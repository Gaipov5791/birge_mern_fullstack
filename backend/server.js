//k40ooxNul0Bsom55
//1CSUn129NVEglOHY

// backend/server.js
import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from '../backend/config/db.js';
import userRoutes from '../backend/routes/userRoutes.js';
import postRoutes from '../backend/routes/postRoutes.js';
import commentRoutes from '../backend/routes/commentRoutes.js';
import chatRoutes from '../backend/routes/chatRoutes.js';
import notificationRoutes from '../backend/routes/notificationRoutes.js';
import trendRoutes from '../backend/routes/trendRoutes.js'; // ⭐ Импортируем маршруты трендов
import feedbackRoutes from '../backend/routes/feedbackRoutes.js'; // ⭐ Импортируем маршруты отзывов
import Chat from '../backend/models/Chat.js'; // Ваша модель сообщения
import Conversation from '../backend/models/Conversation.js'; // ⭐ Новая модель Conversation
import User from '../backend/models/User.js'; // ⭐ Добавляем модель User для получения username/profilePicture
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Инициализация базы данных
connectDB();

const app = express();
const server = createServer(app);


// ДЛЯ ПОДДЕРЖКИ VERCEL И LOCALHOST
const allowedOrigins = [
    process.env.CLIENT_URL, // Ваш боевой URL (Vercel)
    'http://localhost:5173', // Ваш локальный URL (Vite)
];

app.use(cors({
    // Используем функцию, чтобы разрешить любой из адресов в массиве
    origin: (origin, callback) => {
        // Разрешаем, если нет 'origin' (например, запросы с Postman или с того же Origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    // ⚠️ Исправьте опечатку: 'сredentials' -> 'credentials'
    credentials: true,
}));

// 2. Для парсинга тела запроса
app.use(express.json());

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL, // Ваш боевой URL (Vercel)
            'http://localhost:5173'  // Ваш локальный URL (Vite)
        ].filter(Boolean), // .filter(Boolean) уберет undefined, если CLIENT_URL не установлен
        methods: ['GET', 'POST'],
        credentials: true // Добавьте это для Socket.IO, если вы используете куки/сессии
    },
});

const userSocketMap = {}; // userId -> socketId


const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const notifyAllUsersAboutStatus = (userId, isOnline) => {
    io.emit('userStatus', { userId, isOnline });
};

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`Пользователь подключен: ${socket.id} (ID: ${userId})`);
        console.log('Пользователи в сети:', Object.keys(userSocketMap));

        // Сохраняем userId в данных сокета
        socket.data.userId = userId; // ⭐ Сохраняем userId в socket.data
        socket.data.activeChatWith = null; // ⭐ Инициализируем activeChatWith

        socket.emit('onlineUsers', Object.keys(userSocketMap));
        socket.broadcast.emit('userStatus', { userId, isOnline: true });
    }

    // Логика оповещения о доставке сообщений
    Chat.find({ receiver: userId, delivered: false }).then(async (undeliveredMessages) => {
        if (undeliveredMessages.length > 0) {
            await Chat.updateMany(
                { _id: { $in: undeliveredMessages.map(m => m._id) } },
                { $set: { delivered: true } }
            );
            const senderIds = [...new Set(undeliveredMessages.map(msg => msg.sender.toString()))];
            senderIds.forEach(senderId => {
                const senderSocketId = userSocketMap[senderId];
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messagesDelivered', { senderId: userId });
                }
            });
        }
    }).catch(err => console.error('Ошибка при проверке недоставленных сообщений:', err));

    // ⭐ НОВЫЙ ОБРАБОТЧИК: Пользователь присоединяется к чату (открывает ChatPage)
    socket.on('joinChat', async ({ receiverId }) => {
        if (socket.data.userId && receiverId) {
            socket.data.activeChatWith = receiverId; // Устанавливаем активный чат
            console.log(`User ${socket.data.userId} joined chat with ${receiverId}`);

            // ⭐ ЛОГИКА СБРОСА УВЕДОМЛЕНИЙ ПРИ ВХОДЕ В ЧАТ
            try {
                // Ищем диалог между текущим пользователем и receiverId
                const conversation = await Conversation.findOneAndUpdate(
                    {
                        participants: { $all: [socket.data.userId, receiverId] }
                    },
                    {
                        // Обнуляем счетчик непрочитанных для текущего пользователя в этом диалоге
                        $set: { "unreadCounts.$[elem].count": 0 }
                    },
                    {
                        arrayFilters: [{ "elem.user": socket.data.userId }],
                        new: true // Вернуть обновленный документ
                    }
                );
                
                if (conversation) {
                    // Обновляем readBy для всех сообщений, которые текущий пользователь не прочитал
                    await Chat.updateMany(
                        { 
                            sender: receiverId, // Сообщения, отправленные собеседником
                            receiver: socket.data.userId, // Полученные текущим пользователем
                            readBy: { $ne: socket.data.userId } // Ещё не прочитанные
                        },
                        { 
                            $addToSet: { readBy: socket.data.userId } // Добавляем текущего пользователя в readBy
                        }
                    );

                    console.log(`Unread count for user ${socket.data.userId} in conversation with ${receiverId} reset.`);
                    // Если нужно оповестить отправителя, что сообщения прочитаны
                    const senderSocketId = getReceiverSocketId(receiverId);
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messagesRead', { 
                            readerId: socket.data.userId, 
                            conversationId: conversation._id,
                            receiverId: socket.data.userId, // ID того, кто прочитал
                            senderId: receiverId // ID того, чьи сообщения прочитали
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка при сбросе уведомлений при входе в чат:', error);
            }
        }
    });

    // ⭐ НОВЫЙ ОБРАБОТЧИК: Пользователь покидает чат
    socket.on('leaveChat', () => {
        if (socket.data.userId) {
            console.log(`User ${socket.data.userId} left active chat with ${socket.data.activeChatWith}`);
            socket.data.activeChatWith = null; // Сбрасываем активный чат
        }
    });

    // НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ТЕКСТОВЫХ СОБЫТИЙ
    socket.on('typing', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', { senderId });
        }
    });

    socket.on('stoppedTyping', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('stoppedTyping', { senderId });
        }
    });

    socket.on('sendMessage', async (messageData) => {
        const { sender, receiver, text } = messageData;
        const senderId = new mongoose.Types.ObjectId(sender);
        const receiverId = new mongoose.Types.ObjectId(receiver);

        try {
            const receiverSocketId = userSocketMap[receiverId.toString()];
            const isReceiverOnline = !!receiverSocketId;

            // ⭐ 1. НАЙТИ ИЛИ СОЗДАТЬ CONVERSATION
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

            // ⭐ 2. СОЗДАЕМ НОВОЕ СООБЩЕНИЕ
            const newMessage = new Chat({
                sender: senderId,
                receiver: receiverId,
                text,
                delivered: isReceiverOnline,
                readBy: [senderId], // Отправитель всегда "читает" свое сообщение
                conversation: conversation._id // Связываем сообщение с диалогом
            });

            const savedMessage = await newMessage.save();

            // ⭐ 3. ОБНОВЛЯЕМ CONVERSATION С НОВЫМ СООБЩЕНИЕМ И СЧЕТЧИКАМИ
            conversation.lastMessage = savedMessage._id;
            conversation.lastMessageAt = savedMessage.createdAt;

            // Обновляем unreadCounts
            const receiverUnreadIndex = conversation.unreadCounts.findIndex(uc => uc.user.equals(receiverId));
            if (receiverUnreadIndex !== -1) {
                conversation.unreadCounts[receiverUnreadIndex].count++; // Увеличиваем счетчик для получателя
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

            // ⭐ 4. ЗАГРУЖАЕМ (POPULATE) СВЯЗАННЫЕ ДАННЫЕ ДЛЯ СООБЩЕНИЯ
            const populatedMessage = await savedMessage.populate([
                { path: 'sender', select: 'username profilePicture' }, // Только нужные поля
                { path: 'receiver', select: 'username profilePicture' }
            ]);

            // ⭐ 5. ОТПРАВЛЯЕМ СОКЕТ-СОБЫТИЯ
            const senderSocketId = userSocketMap[senderId.toString()];
            
            // Отправляем сообщение обоим, кто онлайн
            if (senderSocketId) {
                io.to(senderSocketId).emit('receiveMessage', populatedMessage);
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
            }

            // ⭐ Отправляем уведомление о непрочитанном сообщении, ЕСЛИ получатель не в активном чате
            const receiverSocket = io.sockets.sockets.get(receiverSocketId); // Получаем объект сокета получателя
            const receiverActiveChat = receiverSocket?.data?.activeChatWith;

            if (isReceiverOnline && receiverActiveChat !== senderId.toString()) {
                // Если получатель онлайн, но не в активном чате с этим отправителем
                const senderUser = await User.findById(senderId).select('username profilePicture');
                const receiverUnreadCount = conversation.unreadCounts.find(uc => uc.user.equals(receiverId))?.count || 0;
                
                io.to(receiverSocketId).emit('newUnreadMessage', {
                    senderId: senderId.toString(),
                    senderUsername: senderUser?.username,
                    senderProfilePicture: senderUser?.profilePicture,
                    unreadCount: receiverUnreadCount, // Отправляем актуальный счетчик
                    lastMessageAt: savedMessage.createdAt
                });
                console.log(`Отправлено newUnreadMessage получателю ${receiverId} от ${senderId}. Счетчик: ${receiverUnreadCount}`);
            } else if (!isReceiverOnline) {
                // Если получатель офлайн, отправляем просто "новое сообщение",
                // т.к. newUnreadMessage будет только для онлайн-пользователей.
                // Фронтенд офлайн-пользователя получит актуальные данные при следующем подключении.
                // Можно здесь отправить push-уведомление, но это отдельная логика.
                // io.to(messageData.receiver).emit('newMessageNotification', { senderId: messageData.sender }); // <-- Это можно убрать или изменить
            }

        } catch (error) {
            console.error('Ошибка при обработке sendMessage:', error.message, error.stack);
            // Можно отправить сообщение об ошибке отправителю
            socket.emit('messageError', { message: 'Не удалось отправить сообщение', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Пользователь отключен: ${socket.id}`);
        let disconnectedUserId = null;

        for (const userId in userSocketMap) {
            if (userSocketMap[userId] === socket.id) {
                disconnectedUserId = userId;
                delete userSocketMap[userId];
                break;
            }
        }

        if (disconnectedUserId) {
            socket.broadcast.emit('userStatus', { userId: disconnectedUserId, isOnline: false });
        }
        console.log('Пользователи в сети:', Object.keys(userSocketMap));
    });
});

// ⭐ Настройка сессий (Passport.js требует сессий)
app.use(session({
    secret: process.env.GOOGLE_CLIENT_SECRET, // Замените на свой секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 часа
}));

app.use(passport.initialize());
app.use(passport.session());

// ⭐ Для отслеживания activeChatWith в HTTP-запросах, если они будут
app.use((req, res, next) => {
    req.io = io;
    req.userSocketMap = userSocketMap;
    
    // ⭐ Добавляем функцию для получения активного чата пользователя
    req.getUserActiveChat = (userId) => {
        const socketId = userSocketMap[userId];
        if (socketId) {
            const userSocket = io.sockets.sockets.get(socketId);
            return userSocket?.data?.activeChatWith;
        }
        return null;
    };
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты API
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes); // ⭐ Подключаем маршруты отзывов
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/trends', trendRoutes); // ⭐ Подключаем маршруты трендов
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);


app.get('/', (req, res) => {
    res.send('Сервер готов к работе!');
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Файл слишком большой. Максимальный размер 50МБ.' });
        }
    }
    next(err);
});