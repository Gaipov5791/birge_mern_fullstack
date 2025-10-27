import { io } from 'socket.io-client';
import {
    addMessage,
    setConnected,
    updateMessagesReadStatus, 
    updateMessagesDeliveredStatus,
    updateMessage,
    deleteMessages,
    setOnlineUsers,
    setIsReceiverTyping,
    addOrUpdateNotification,
    clearNotificationForSender,
    setActiveChat,
    clearActiveChat,
} from '../features/chat/chatSlice';
import {
    markMessagesAsRead as markMessagesAsReadAPI,
    fetchUnreadConversationsSummary
} from '../features/chat/chatThunks';
import {
    SEND_MESSAGE,
    START_TYPING,
    STOP_TYPING,
    JOIN_CHAT,
    LEAVE_CHAT
} from '../actions/actionTypes'; // Убедитесь, что здесь все типы корректны!

const API_BASE_DOMAIN = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
const SOCKET_URL = API_BASE_DOMAIN;
let socket;
let typingTimeout = null;

// ⭐ НОВАЯ ФУНКЦИЯ: Централизованная инициализация и настройка слушателей
const initSocket = (store, userId) => {
    if (socket) return; // Уже инициализирован

    socket = io(SOCKET_URL, {
        query: { userId },
    });

    // --- СЛУШАТЕЛИ СОКЕТА (Логика при входе в сеть) ---

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        store.dispatch(setConnected(true));
        // При подключении запрашиваем актуальную сводку уведомлений
        store.dispatch(fetchUnreadConversationsSummary());
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        store.dispatch(setConnected(false));
        store.dispatch(setOnlineUsers([])); 
    });

    socket.on('onlineUsers', (users) => {
        console.log(`[CLIENT SOCKET] Received 'onlineUsers' list. Total: ${users.length}`);
        store.dispatch(setOnlineUsers(users));
    });

    socket.on('userStatus', ({ userId, isOnline }) => {
        const currentUserId = store.getState().auth.user?._id;
        if (userId === currentUserId) return; // Игнорируем себя

        console.log(`[CLIENT SOCKET] Received 'userStatus' for ${userId}. Is Online: ${isOnline}`);

        const prevUsers = store.getState().chat.onlineUsers;
        const newUsers = isOnline 
            ? [...new Set([...prevUsers, userId])] 
            : prevUsers.filter((id) => id !== userId);

        store.dispatch(setOnlineUsers(newUsers));
    });
    
    // --- СЛУШАТЕЛИ ЧАТА (Логика сообщений/печати/прочтения) ---
    
    socket.on('receiveMessage', (newMessage) => {
        // ... (Ваша текущая логика обработки receiveMessage) ...
        store.dispatch(addMessage(newMessage));

        const currentUserId = store.getState().auth.user?._id;
        const activeChatWithId = store.getState().chat.activeChatWith;

        if (newMessage.sender._id === currentUserId) {
            return; 
        }

        if (newMessage.receiver._id === currentUserId && activeChatWithId === newMessage.sender._id) {
            store.dispatch(markMessagesAsReadAPI(newMessage.sender._id));
            store.dispatch(clearNotificationForSender(newMessage.sender._id));
        }
    });

    socket.on('typing', (data) => {
        const activeChatWithId = store.getState().chat.activeChatWith;
        if (data.senderId === activeChatWithId) {
            store.dispatch(setIsReceiverTyping(true));
        }
    });

    socket.on('stoppedTyping', (data) => {
        const activeChatWithId = store.getState().chat.activeChatWith;
        if (data.senderId === activeChatWithId) {
            store.dispatch(setIsReceiverTyping(false));
        }
    });

    socket.on('messagesRead', (data) => {
        console.log('Пользователь А: Получено событие messagesRead:', data);
        const currentUserId = store.getState().auth.user?._id;

        // Проверяем, что это подтверждение прочтения для НАШИХ сообщений
        // (т.е. currentUserId === data.senderId)
        // И что читатель (data.readerId) это не мы сами
        if (currentUserId && currentUserId === data.senderId && currentUserId !== data.readerId) {
            console.log(`Пользователь А: Условие для dispatch updateMessagesReadStatus ВЫПОЛНЕНО.`);
            store.dispatch(updateMessagesReadStatus({
                readerId: data.readerId,      // Кто прочитал
                senderId: data.senderId,      // Кто отправил (мы)
                conversationId: data.conversationId.toString()
            }));
        } else {
            console.log(`Пользователь А: Условие для dispatch updateMessagesReadStatus НЕ ВЫПОЛНЕНО.`);
        }
    });

    socket.on('messagesDelivered', (data) => {
        // ⭐ Здесь вам нужно будет решить, как вы хотите обрабатывать статус "доставлено".
        // Если вы храните message.delivered: boolean, то это подходит.
        // data должна содержать senderId или messageId для обновления.
        store.dispatch(updateMessagesDeliveredStatus({ senderId: data.senderId, delivered: true }));
    });

    socket.on('messageUpdated', (updatedMessage) => {
        store.dispatch(updateMessage(updatedMessage));
    });

    socket.on('messagesDeleted', (data) => {
        // data должен содержать { messageIds: [...] }
        store.dispatch(deleteMessages(data));
    });

    socket.on('messageDeleted', (data) => {
        // data должен содержать { _id: '...' } для одного сообщения
        store.dispatch(deleteMessages({ messageIds: [data._id] }));
    });

    // НОВЫЙ СЛУШАТЕЛЬ ДЛЯ newUnreadMessage
    socket.on('newUnreadMessage', (notificationData) => {
        console.log('Получено newUnreadMessage:', notificationData);
        const currentUserId = store.getState().auth.user?._id;
        const activeChatWithId = store.getState().chat.activeChatWith;

        // Добавляем уведомление, только если это не мы сами отправили сообщение
        // И если мы не в активном чате с отправителем этого сообщения
        // (иначе оно будет помечено как прочитанное сразу)
        if (notificationData.senderId !== currentUserId && activeChatWithId !== notificationData.senderId) {
                store.dispatch(addOrUpdateNotification(notificationData));
        }
    });
};


export const chatSocketMiddleware = (store) => (next) => (action) => {
    // ⭐ КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Инициализация по экшену
    const isAuthActionFulfilled = action.type.endsWith('/fulfilled') && 
        (action.type.startsWith('auth/login') || action.type.startsWith('auth/getMe'));
    
    // ⭐ Условие инициализации: Если сокет еще не создан И пришел экшен успешной авторизации
    if (!socket && isAuthActionFulfilled) {
        const { user } = store.getState().auth; 
        // Если данные пользователя есть в стейте, инициализируем сокет
        if (user?._id) {
            initSocket(store, user._id);
        }
    }


    // --- Обработка исходящих событий (остается без изменений) ---
    
    switch (action.type) {
        case SEND_MESSAGE: {
            if (socket && store.getState().chat.isConnected) {
                socket.emit('sendMessage', action.payload);
                console.log('Сообщение отправлено:', action.payload);
            }
            break;
        }
        case JOIN_CHAT: {
            if (socket) {
                console.log('Emitting joinChat:', action.payload);
                socket.emit('joinChat', action.payload); 
                store.dispatch(setActiveChat(action.payload.receiverId || action.payload)); 
            }
            break;
        }
        case LEAVE_CHAT: {
            if (socket) {
                console.log('Emitting leaveChat');
                socket.emit('leaveChat', action.payload); 
                store.dispatch(clearActiveChat());
            }
            break;
        }
        case START_TYPING: {
            if (socket) {
                socket.emit('typing', action.payload);
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    store.dispatch({
                        type: STOP_TYPING,
                        payload: action.payload,
                    });
                }, 2000);
            }
            break;
        }
        case STOP_TYPING: {
            if (socket) {
                socket.emit('stoppedTyping', action.payload);
            }
            break;
        }
        default:
            break;
    }

    return next(action);
};