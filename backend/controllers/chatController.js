import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";


// @desc    Отправить новое сообщение
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res) => {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !text) {
        return res.status(400).json({ message: 'Необходимо указать получателя и текст сообщения.' });
    }

    try {
        // 1. НАЙТИ ИЛИ СОЗДАТЬ CONVERSATION
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                unreadCounts: [
                    { user: senderId, count: 0 },
                    { user: receiverId, count: 0 }
                ]
            });
        }

        // 2. СОЗДАЕМ НОВОЕ СООБЩЕНИЕ
        const isReceiverOnline = !!req.userSocketMap[receiverId.toString()];

        const newMessage = new Chat({
            sender: senderId,
            receiver: receiverId,
            text,
            delivered: isReceiverOnline,
            readBy: [],
            conversation: conversation._id, // ⭐ ДОБАВЛЕНО ЭТО ПОЛЕ
        });

        const savedMessage = await newMessage.save();

        // 3. ОБНОВЛЯЕМ CONVERSATION С НОВЫМ СООБЩЕНИЕМ И СЧЕТЧИКАМИ
        conversation.lastMessage = savedMessage._id;
        conversation.lastMessageAt = savedMessage.createdAt;

        const receiverUnreadIndex = conversation.unreadCounts.findIndex(uc => uc.user.equals(receiverId));
        if (receiverUnreadIndex !== -1) {
            conversation.unreadCounts[receiverUnreadIndex].count++;
        } else {
            conversation.unreadCounts.push({ user: receiverId, count: 1 });
        }

        const senderUnreadIndex = conversation.unreadCounts.findIndex(uc => uc.user.equals(senderId));
        if (senderUnreadIndex !== -1) {
            conversation.unreadCounts[senderUnreadIndex].count = 0; // Сбрасываем счетчик для отправителя
        } else {
            conversation.unreadCounts.push({ user: senderId, count: 0 });
        }

        await conversation.save();

        // 4. ЗАГРУЖАЕМ (POPULATE) СВЯЗАННЫЕ ДАННЫЕ ДЛЯ СООБЩЕНИЯ
        const populatedMessage = await savedMessage.populate([
            { path: 'sender', select: 'username profilePicture' },
            { path: 'receiver', select: 'username profilePicture' }
        ]);

        // 5. ОТПРАВЛЯЕМ СОКЕТ-СОБЫТИЯ (используем req.io)
        const senderSocketId = req.userSocketMap[senderId.toString()];
        const receiverSocketId = req.userSocketMap[receiverId.toString()];

        // Отправляем сообщение обратно отправителю и получателю
        if (senderSocketId) {
            req.io.to(senderSocketId).emit('receiveMessage', populatedMessage);
            console.log(`[REST] Отправлено receiveMessage отправителю ${senderId} (self).`);
        }
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
            console.log(`[REST] Отправлено receiveMessage получателю ${receiverId}.`);
        }

        // Отправляем уведомление о непрочитанном сообщении, ЕСЛИ получатель онлайн и не в активном чате
        // req.getUserActiveChat должен возвращать ID пользователя, с которым открыт чат у receiverId
        const receiverActiveChat = req.getUserActiveChat(receiverId.toString());
        
        if (isReceiverOnline && receiverActiveChat !== senderId.toString()) {
            const senderUser = await User.findById(senderId).select('username profilePicture');
            const receiverUnreadCount = conversation.unreadCounts.find(uc => uc.user.equals(receiverId))?.count || 0;
            
            req.io.to(receiverSocketId).emit('newUnreadMessage', {
                senderId: senderId.toString(),
                senderUsername: senderUser?.username,
                senderProfilePicture: senderUser?.profilePicture,
                unreadCount: receiverUnreadCount,
                lastMessageAt: savedMessage.createdAt,
                conversationId: conversation._id.toString() // ⭐ Добавлено для уведомления
            });
            console.log(`[REST] Отправлено newUnreadMessage получателю ${receiverId} от ${senderId}. Счетчик: ${receiverUnreadCount}`);
        }

        res.status(201).json(populatedMessage); // Отправляем полное сообщение обратно клиенту
    } catch (error) {
        console.error('Ошибка при отправке сообщения через REST:', error.message, error.stack);
        res.status(500).json({ message: 'Ошибка при отправке сообщения.', error: error.message });
    }
};

// @desc    Получить историю сообщений между двумя пользователями
// @route   GET /api/chat/:receiverId
// @access  Private
export const getChatHistory = async (req, res) => {
    const { receiverId } = req.params;
    const currentUserId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Некорректный ID получателя.' });
    }
    try {
        const chatHistory = await Chat.find({
            $or: [
                { sender: currentUserId, receiver: receiverId },
                { sender: receiverId, receiver: currentUserId }
            ],
        })
        .sort({ createdAt: 1 }) // Сортируем по времени создания по возрастанию
        .populate('sender', 'username avatar') // Заполняем данные об отправителе
        .populate('receiver', 'username avatar'); // Заполняем данные о получателе
        
        res.status(200).json(chatHistory, { message: 'История сообщений успешно получена.' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении истории сообщений.', error: error.message });
    }
};

// @desc    Пометить сообщения как прочитанные
// @route   PUT /api/chat/messages/read/:senderId
// @access  Private
export const markMessageAsRead = async (req, res) => {
    const { senderId } = req.params;
    const currentUserId = req.user._id; // Пользователь Б (читатель)
    const { io, userSocketMap } = req;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json({ message: 'Некорректный ID отправителя.' });
    }

    try {
        let conversationId = null;

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, senderId] },
        });

        // ШАГ 1: Обновляем счетчик непрочитанных (ТОЛЬКО если Conversation существует)
        if (conversation) {
            const readerUnreadEntry = conversation.unreadCounts.find(entry =>
                entry.user.equals(currentUserId)
            );

            if (readerUnreadEntry && readerUnreadEntry.count > 0) {
                readerUnreadEntry.count = 0;
                await conversation.save();
                console.log(`Unread count reset for user ${currentUserId}.`);
                // ⭐ ТЕПЕРЬ НЕ ОТПРАВЛЯЕМ unreadCountReset ОТДЕЛЬНО
            } else if (!readerUnreadEntry) {
                 // Если диалог есть, но записи нет (редкий случай)
                conversation.unreadCounts.push({ user: currentUserId, count: 0 });
                await conversation.save();
            }
        }
        
        conversationId = conversation._id;


        // ⭐ ШАГ 2: Обновляем поле 'readBy' для сообщений
        const result = await Chat.updateMany(
            {
                sender: senderId,
                receiver: currentUserId,
                readBy: { $nin: [currentUserId] }
            },
            { $addToSet: { readBy: currentUserId } }
        );
        
        console.log(`Updated ${result.modifiedCount} messages as read for user ${currentUserId} from ${senderId}.`);

        // ⭐ ШАГ 3: Оповещаем отправителя через Socket.IO (ВСЕГДА, ЕСЛИ ЕСТЬ ЧИТАТЕЛЬ)
        // Теперь мы отправляем событие, если кто-то прочитал сообщения,
        // независимо от того, были ли *новые* сообщения фактически обновлены в readBy.
        // Это важно, так как unreadCounts мог быть сброшен.
        const senderSocketId = userSocketMap[senderId.toString()]; // senderId - это Пользователь А
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', {
                readerId: currentUserId.toString(), // Пользователь Б
                senderId: senderId.toString(),       // Пользователь А
                conversationId: conversationId.toString()
            });
            console.log(`Event 'messagesRead' ALWAYS EMITTED to ${senderId}.`); // ⭐ Теперь этот лог должен быть
        } else {
            console.log(`Sender ${senderId} is OFFLINE or has no active socket for messagesRead.`);
        }
        
        // ⭐ ШАГ 4: Дополнительно (как было)
        res.status(200).json({ 
            message: 'Сообщения успешно помечены как прочитанные.', 
            modifiedCount: result.modifiedCount,
            conversationId: conversationId.toString()
        });

    } catch (error) {
        console.error('Ошибка при пометке сообщений как прочитанных:', error.message, error.stack);
        res.status(500).json({ message: 'Ошибка при обновлении статуса сообщений.', error: error.message });
    }
};

// @desc    Очистить чат (удалить только у себя)
// @route   /api/chat/clear/:receiverId
// @access  Private
export const clearChat = async (req, res) => {
    const { receiverId } = req.params;
    const currentUserId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Некорректный ID получателя.' });
    }
    try {
        const result = await Chat.updateMany(
            {
                $or: [
                    { sender: currentUserId, receiver: receiverId },
                    { sender: receiverId, receiver: currentUserId }
                ],
            },
            { $addToSet: { deletedBy: currentUserId } }
        );

        if (result.modifiedCount === 0) {
            return res.status(494).json({
                message: 'Нет сообщений для очистки.'
            });
        }

        res.status(200).json({
            message: 'Чат успешно очищен у вас.',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Ошибка при очистке чата:', error);
        res.status(500).json({ message: 'Ошибка при очистке чата.', error: error.message });
    }
};


// @desc    Удалить одно сообщение для всех
// @route   DELETE /api/chat/message/:messageId
// @access  Private
export const deleteMessageForEveryone = async (req, res) => {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    try {
        const message = await Chat.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Сообщение не найдено.' });
        }
        if (message.sender.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: 'Вы не можете удалить это сообщение.' });
        }
        const receiverId = message.receiver.toString();

        const updatedMessage = await Chat.findByIdAndUpdate(
            messageId,
            {
                text: 'Данное сообщение было удалено.',
                isDeleted: true
            },
            { new: true }
        );

        // ⭐ ИСПРАВЛЕНИЕ: Получаем ID сокетов из userSocketMap
        const senderSocketId = req.userSocketMap[currentUserId.toString()];
        const receiverSocketId = req.userSocketMap[receiverId];

        // Отправляем уведомление отправителю, если он в сети
        if (senderSocketId) {
            req.io.to(senderSocketId).emit('messageUpdated', updatedMessage);
        }

        // Отправляем уведомление получателю, если он в сети
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit('messageUpdated', updatedMessage);
        }

        res.status(200).json({ message: 'Сообщение успешно удалено для всех.' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении сообщения.', error: error.message });
    }
};


// @desc    Удалить несколько сообщений для всех
// @route   DELETE /api/chat/messages/all
// @access  Private
export const deleteAllMessagesForEveryone = async (req, res) => {
    const { messageIds, receiverId } = req.body;
    const currentUserId = req.user.id;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ message: 'Некорректный массив ID сообщений.' });
    }

    try {
        // ⭐ ИЗМЕНЕНИЕ 1: Проверяем, что сообщения принадлежат данному чату, а не только отправителю
        const chatExists = await Chat.findOne({
            _id: messageIds[0],
            $or: [
                { sender: currentUserId, receiver: receiverId },
                { sender: receiverId, receiver: currentUserId }
            ]
        });

        if (!chatExists) {
            return res.status(403).json({ message: 'Вы не можете удалять сообщения из этого чата.' });
        }

        // ⭐ ИЗМЕНЕНИЕ 2: Удаляем все сообщения по их ID без проверки отправителя
        await Chat.deleteMany({ _id: { $in: messageIds } });

        // ⭐ ИЗМЕНЕНИЕ 3: Получаем ID сокетов
        const senderSocketId = req.userSocketMap[currentUserId.toString()];
        const receiverSocketId = req.userSocketMap[receiverId];

        const deletedMessageIds = { messageIds: messageIds };

        // Отправляем уведомление отправителю
        if (senderSocketId) {
            req.io.to(senderSocketId).emit('messagesDeleted', deletedMessageIds);
        }

        // Отправляем уведомление получателю
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit('messagesDeleted', deletedMessageIds);
        }

        res.status(200).json({ message: 'Все сообщения успешно удалены для всех.' });
    } catch (error) {
        console.error('Ошибка при массовом удалении сообщений:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении сообщений.' });
    }
};
