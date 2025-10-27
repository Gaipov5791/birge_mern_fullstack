import { createSlice } from '@reduxjs/toolkit';
import { 
    getChatHistory, 
    sendMessage, 
    markMessagesAsRead, 
    clearChat, 
    deleteMessageForEveryone, 
    deleteAllMessagesForEveryone,
    fetchUnreadConversationsSummary,
    activateChatConnection
} from './chatThunks'; // Убедитесь, что путь к chatThunks верный


const initialState = {
    messages: [],
    isConnected: false,
    isLoading: false, // Общий флаг загрузки
    isError: false,
    error: null,
    onlineUsers: [],
    isReceiverTyping: false,
    // ⭐ Изменена структура: массив объектов, а не просто объект счетчиков
    // Каждый объект будет { senderId, senderUsername, senderProfilePicture, unreadCount, lastMessageAt }
    unreadNotificationsSummary: [], 
    isLoadingNotifications: false, // ⭐ Новый флаг для загрузки уведомлений
    activeChatWith: null, // ⭐ ID пользователя, с которым открыт активный чат
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        resetMessages: (state) => {
            state.messages = [];
            state.isLoading = false;
            state.isError = false;
            state.error = null;
        },
        // ⭐ ОБНОВЛЕННЫЙ РЕДЮСЕР для обновления статуса прочитанных сообщений (галочек)
        // Этот редюсер вызывается, когда *другой пользователь* (readerId) прочитал *наши* сообщения.
        updateMessagesReadStatus: (state, action) => {
            const { readerId, senderId, conversationId } = action.payload; // Payload: { readerId: ID_Б, senderId: ID_А, conversationId: ID_диалога }
            console.log('Редюсер updateMessagesReadStatus вызван. Payload:', action.payload);

            let messagesUpdatedCount = 0;
            state.messages.filter(msg => msg != null).forEach(message => {
                if (!message._id) {
                    console.warn('Пропущено сообщение без _id в Redux:', message);
                    return; // Пропускаем элемент
                }
                const messageSenderId = message.sender && typeof message.sender === 'object' ? message.sender._id : message.sender;
                const messageReceiverId = message.receiver && typeof message.receiver === 'object' ? message.receiver._id : message.receiver;

                console.log(`Проверка сообщения ${message._id}:`);
                console.log(`  messageSenderId: ${messageSenderId} === payload.senderId: ${senderId} -> ${messageSenderId === senderId}`);
                console.log(`  messageReceiverId: ${messageReceiverId} === payload.readerId: ${readerId} -> ${messageReceiverId === readerId}`);
                console.log(`  message.readBy (до проверки):`, message.readBy); // ⭐ ЭТОТ ЛОГ КРИТИЧЕН
                console.log(`  !message.readBy.includes(readerId): ${!message.readBy.includes(readerId)}`);
                // ⭐ ИЗМЕНЕНО: используем .toString() для сравнения, если message.conversation - ObjectId
                console.log(`  message.conversation: ${message.conversation} === payload.conversationId: ${conversationId} -> ${message.conversation && message.conversation.toString() === conversationId}`);


                if (messageSenderId === senderId &&
                    messageReceiverId === readerId &&
                    message.conversation && message.conversation.toString() === conversationId && // ⭐ И здесь используем .toString()
                    !message.readBy.includes(readerId)) {
                    message.readBy.push(readerId);
                    messagesUpdatedCount++;
                    console.log(`Сообщение ${message._id} успешно обновлено. readBy теперь:`, message.readBy);
                }
            });
            console.log(`Всего сообщений обновлено в Redux: ${messagesUpdatedCount}`);
        },
        updateMessagesDeliveredStatus: (state, action) => {
            const { senderId } = action.payload;
            state.messages.filter(msg => msg != null).forEach(message => {
                const messageSenderId = message.sender && typeof message.sender === 'object' ? message.sender._id : message.sender;
                if (messageSenderId === senderId && !message.delivered) {
                    message.delivered = true;
                }
            });
        },
        deleteMessages: (state, action) => {
            const deletedMessageIds = action.payload.messageIds;
            state.messages = state.messages
                .filter(msg => msg != null) // Убедимся, что нет null в массиве
                .filter(msg => !deletedMessageIds.includes(msg._id));
        },
        updateMessage: (state, action) => {
            const updatedMessage = action.payload;
            state.messages = state.messages
                .filter(msg => msg != null) // Убедимся, что нет null в массиве
                .map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                );
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setIsReceiverTyping: (state, action) => {
            state.isReceiverTyping = action.payload;
        },
        setActiveChat: (state, action) => {
        state.activeChatWith = action.payload; // action.payload будет senderId
        },
        clearActiveChat: (state) => {
            state.activeChatWith = null;
        },
        // ⭐ НОВЫЙ/ОБНОВЛЕННЫЙ addNotification (для newUnreadMessage с бэкенда)
        // Теперь action.payload будет содержать полную информацию:
        // { senderId, senderUsername, senderProfilePicture, unreadCount, lastMessageAt }
        addOrUpdateNotification: (state, action) => {
            const newNotification = action.payload;
            const existingIndex = state.unreadNotificationsSummary.findIndex(
                notif => notif.senderId === newNotification.senderId
            );

            if (existingIndex !== -1) {
                // Если уведомление от этого отправителя уже есть, обновляем его
                state.unreadNotificationsSummary[existingIndex] = newNotification;
            } else {
                // Иначе добавляем новое
                state.unreadNotificationsSummary.push(newNotification);
            }
            // Сортируем по lastMessageAt, чтобы самые свежие были сверху
            state.unreadNotificationsSummary.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        },
        // ⭐ clearNotificationForSender вызывается, когда *текущий пользователь* читает
        // входящие сообщения от *другого пользователя*. Это должно быть вызвано 
        // из NotificationCenter или ChatPage, когда пользователь открывает чат.
        clearNotificationForSender: (state, action) => {
            const senderIdToClear = action.payload;
            state.unreadNotificationsSummary = state.unreadNotificationsSummary.filter(
                (notif) => notif.senderId !== senderIdToClear
            );
        },
        // ⭐ ОБНОВЛЕННЫЙ `clearNotifications` (если он будет вызываться для всего):
        // Можно использовать, чтобы очистить все уведомления, или как более общий сброс.
        clearAllNotifications: (state) => {
            state.unreadNotificationsSummary = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Существующие обработчики для getChatHistory
            .addCase(getChatHistory.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                const { messages, currentUserId } = action.payload;
                
                // ⭐ ДОБАВЛЕНИЕ: Фильтруем любые null/undefined сообщения 
                const validMessages = messages.filter(msg => msg != null);

                state.messages = validMessages.filter(msg => {
                    return !msg.deletedBy.includes(currentUserId);
                });
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload;
            })
            // Остальные существующие обработчики
            .addCase(sendMessage.pending, (state) => {
                state.isError = false;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                // Больше ничего не делаем, сокет-мидлварь сам вызовет addMessage
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload;
            })
            .addCase(markMessagesAsRead.pending, (state) => {
                state.isError = false;
                state.error = null;
            })
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                const { readerId } = action.payload;
                // ⭐ ОБНОВИТЬ: Промаркировать все входящие сообщения как прочитанные
                state.messages.forEach(message => {
                    const messageReceiverId = message.receiver && typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
                    
                    // Если сообщение адресовано нам (мы — читатель) и еще не прочитано нами
                    if (messageReceiverId === readerId && !message.readBy.includes(readerId)) {
                        message.readBy.push(readerId);
                        // Дополнительно можно обновить delivered, если это необходимо
                        if (!message.delivered) {
                            message.delivered = true;
                        }
                    }
                });
            })
            .addCase(markMessagesAsRead.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload;
            })
            .addCase(clearChat.fulfilled, (state) => {
                state.messages = [];
            })
            .addCase(clearChat.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload;
            })
            .addCase(deleteMessageForEveryone.fulfilled, (state, action) => {})
            
            .addCase(deleteMessageForEveryone.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload;
            })
            .addCase(deleteAllMessagesForEveryone.fulfilled, (state, action) => {
                console.log('Массовое удаление завершено.');
            })
            .addCase(deleteAllMessagesForEveryone.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload;
            })
            // ⭐ НОВЫЕ ОБРАБОТЧИКИ ДЛЯ fetchUnreadConversationsSummary
            .addCase(fetchUnreadConversationsSummary.pending, (state) => {
                state.isLoadingNotifications = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(fetchUnreadConversationsSummary.fulfilled, (state, action) => {
                state.isLoadingNotifications = false;
                
                // ⭐ ИСПРАВЛЕНИЕ: Фильтруем null/undefined элементы в массиве перед записью
                const validPayload = Array.isArray(action.payload) ? action.payload.filter(item => item != null && item.senderId) : [];
                
                state.unreadNotificationsSummary = validPayload;
            })
            .addCase(fetchUnreadConversationsSummary.rejected, (state, action) => {
                state.isLoadingNotifications = false;
                state.isError = true;
                state.error = action.payload;
            })
            // ⭐ НОВЫЕ ОБРАБОТЧИКИ ДЛЯ activateChat    
            .addCase(activateChatConnection.pending, (state) => {
                
            })
            .addCase(activateChatConnection.fulfilled, (state, action) => {
                const receiverId = action.payload.receiverId;
                state.activeChatWith = receiverId;
                console.log(`[Redux] Активация чата успешна: ${receiverId}`);
            })
            .addCase(activateChatConnection.rejected, (state, action) => {
                console.error('Ошибка активации чата:', action.payload);
            });
    },
});

export const { 
    addMessage,  
    setConnected,
    resetMessages, 
    updateMessagesReadStatus,
    updateMessagesDeliveredStatus,
    deleteMessages,
    updateMessage,
    setOnlineUsers,
    setIsReceiverTyping,
    setActiveChat,
    clearActiveChat,
    addOrUpdateNotification, // ⭐ Новый reducer
    clearNotificationForSender, // ⭐ Новый reducer
    clearAllNotifications // ⭐ Обновленный reducer
} = chatSlice.actions;
export default chatSlice.reducer;