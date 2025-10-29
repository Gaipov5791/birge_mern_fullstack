// backend/controllers/notificationController.js
import Conversation from '../models/Conversation.js';
import User from '../models/User.js'; // Чтобы получить username и profilePicture
import mongoose from 'mongoose';

// @desc    Получить сводку непрочитанных диалогов для текущего пользователя
// @route   GET /api/notifications/unread-summary
// @access  Private (нужен req.user._id)
export const getUnreadConversationsSummary = async (req, res) => {
    console.log('Контроллер getUnreadConversationsSummary вызван.');
    console.log('req.user:', req.user);
    const currentUserId = req.user._id;
    console.log('currentUserId:', currentUserId);

    try {
        // Найти все Conversation, где currentUserId является участником
        // и у него есть непрочитанные сообщения
        const conversations = await Conversation.find({
            participants: currentUserId,
            'unreadCounts.user': currentUserId, // Убедиться, что запись для текущего пользователя существует
        })
        .populate({
            path: 'participants',
            select: 'username profilePicture', // Извлекаем только нужные поля пользователя
            match: { _id: { $ne: currentUserId } } // Исключаем текущего пользователя из populate
        })
        .sort({ lastMessageAt: -1 }); // Сортируем по времени последнего сообщения

        const summary = conversations.map(conv => {
            // Найдем другого участника (отправителя)
            const otherParticipant = conv.participants[0];
            
            // Найдем счетчик непрочитанных для текущего пользователя в этой беседе
            const unreadEntry = conv.unreadCounts.find(uc => uc.user.equals(currentUserId));
            const unreadCount = unreadEntry ? unreadEntry.count : 0;

            if (otherParticipant) {
                return {
                    senderId: otherParticipant._id,
                    senderUsername: otherParticipant.username,
                    senderProfilePicture: otherParticipant.profilePicture,
                    unreadCount: unreadCount,
                    lastMessageAt: conv.lastMessageAt // Добавляем для возможной сортировки на фронтенде
                };
            }
            return null;
        }).filter(item => item !== null); // Отфильтровываем null, если другой участник не найден

        res.status(200).json(summary);

    } catch (error) {
        console.error('Ошибка при получении сводки уведомлений:', error.message, error.stack);
        res.status(500).json({ message: 'Ошибка сервера при получении уведомлений.' });
    }
};