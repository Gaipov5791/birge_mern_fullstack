import { io } from 'socket.io-client';
import {
    addMessage,
    setConnected,
    updateMessagesReadStatus, // Для исходящих сообщений
    updateMessagesDeliveredStatus,
    updateMessage,
    deleteMessages,
    setOnlineUsers,
    setIsReceiverTyping,
    addOrUpdateNotification,
    clearNotificationForSender, // Для входящих сообщений
    setActiveChat, // Для управления активным чатом
    clearActiveChat, // Для управления активным чатом
} from '../redux/features/chat/chatSlice';
import {
    markMessagesAsRead as markMessagesAsReadAPI,
    fetchUnreadConversationsSummary
} from '../redux/features/chat/chatThunks';
import {
    SEND_MESSAGE,
    START_TYPING,
    STOP_TYPING,
    JOIN_CHAT,
    LEAVE_CHAT
} from '../redux/actions/actionTypes';

const API_BASE_DOMAIN = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
const SOCKET_URL = API_BASE_DOMAIN; // Теперь SOCKET_URL = https://birge-mern-fullstack.onrender.com
let socket;
let typingTimeout = null;

export const chatSocketMiddleware = (store) => (next) => (action) => {
    // Инициализация сокета, если еще не был инициализирован
    // И если пользователь залогинен (user._id доступен)
    if (!socket && store.getState().auth.user) {
        const { user } = store.getState().auth;
        
        socket = io(SOCKET_URL, {
            query: { userId: user._id },
        });

        // Настройка слушателей сокета
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            store.dispatch(setConnected(true));
            // При подключении запрашиваем актуальную сводку уведомлений
            store.dispatch(fetchUnreadConversationsSummary());
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            store.dispatch(setConnected(false));
            // Возможно, здесь также нужно очистить онлайн-пользователей
            store.dispatch(setOnlineUsers([])); 
        });

        socket.on('receiveMessage', (newMessage) => {
            console.log('Получено сообщение (client A) - ДО dispatch(addMessage):', newMessage); // <--- Новый лог
            console.log('newMessage.readBy (client A) - ДО dispatch(addMessage):', newMessage.readBy); // <--- НОВЫЙ ЛОГ ДЛЯ ПРОВЕРКИ
            store.dispatch(addMessage(newMessage));

            const currentUserId = store.getState().auth.user?._id;
            const activeChatWithId = store.getState().chat.activeChatWith;

            // ⭐ НОВОЕ УСЛОВИЕ: Игнорируем, если мы сами отправили это сообщение
            if (newMessage.sender._id === currentUserId) {
                console.log('Получено собственное сообщение. Игнорируем логику прочтения/уведомлений.');
                // Только добавляем его через addMessage(newMessage) выше
                return; 
            }

            // Если это сообщение для текущего пользователя (он получатель)
            // И он находится в активном чате с отправителем этого сообщения
            if (newMessage.receiver._id === currentUserId && activeChatWithId === newMessage.sender._id) {
                // Если пользователь в активном чате с отправителем,
                // сразу помечаем сообщения как прочитанные (на бэкенде)
                store.dispatch(markMessagesAsReadAPI(newMessage.sender._id));
                // Также очищаем уведомление на фронтенде
                store.dispatch(clearNotificationForSender(newMessage.sender._id));
            } else if (newMessage.receiver._id === currentUserId && activeChatWithId !== newMessage.sender._id) {
                // Если получатель - текущий пользователь, но он НЕ в активном чате с отправителем,
                // то бэкенд уже отправит 'newUnreadMessage', которое будет обработано ниже.
                // Не нужно dispatch addOrUpdateNotification здесь, так как это событие обрабатывается
                // через socket.on('newUnreadMessage')
            }
        });

        socket.on('onlineUsers', (users) => {
            // ⭐ ЛОГ 5: Фиксируем получение
            console.log(`[CLIENT SOCKET] Received 'onlineUsers' list. Total: ${users.length}. First 3: ${users.slice(0, 3).join(', ')}`);
            store.dispatch(setOnlineUsers(users));
        });

        socket.on('userStatus', ({ userId, isOnline }) => {
            // ⭐ ЛОГ 6: Фиксируем изменение
            console.log(`[CLIENT SOCKET] Received 'userStatus' for ${userId}. Is Online: ${isOnline}`);

            const prevUsers = store.getState().chat.onlineUsers;
            const newUsers = isOnline ? [...new Set([...prevUsers, userId])] : prevUsers.filter((id) => id !== userId);
            
            // ⭐ ЛОГ 7: Показываем, что было в Redux до/после
            console.log(`[CLIENT SOCKET] Prev online count: ${prevUsers.length}. New online count: ${newUsers.length}`);
            store.dispatch(setOnlineUsers(newUsers));
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
    }

    // Обработка исходящих событий
    switch (action.type) {
        case SEND_MESSAGE: {
            if (socket && store.getState().chat.isConnected) {
                socket.emit('sendMessage', action.payload);
                console.log('Сообщение отправлено:', action.payload);
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
        case JOIN_CHAT: {
            if (socket) {
                console.log('Emitting joinChat:', action.payload);
                // payload для JOIN_CHAT должен быть conversationId или receiverId
                socket.emit('joinChat', action.payload); 
                // Устанавливаем активный чат в Redux
                store.dispatch(setActiveChat(action.payload.receiverId || action.payload)); 
            }
            break;
        }
        case LEAVE_CHAT: {
            if (socket) {
                console.log('Emitting leaveChat');
                // payload для LEAVE_CHAT также может быть conversationId или receiverId,
                // чтобы бэкенд знал, какую комнату покинуть.
                socket.emit('leaveChat', action.payload); 
                // Сбрасываем активный чат в Redux
                store.dispatch(clearActiveChat());
            }
            break;
        }
        default:
            break;
    }

    return next(action);
};