import { createAsyncThunk } from "@reduxjs/toolkit";
import chatService from '../../../api/chatService';
import { updateMessage, deleteMessages } from './chatSlice';
import { io } from 'socket.io-client';

const API_BASE_DOMAIN = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
const SOCKET_URL = API_BASE_DOMAIN;
let socket;

// Эта функция-помощник гарантирует, что сокет-соединение создается только один раз
const getSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            query: { userId },
        });
    }
    return socket;
};

// Асинхронный thunk для получения списка чатов
export const getChatList = createAsyncThunk(
    'chat/getChatList',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await chatService.getChatList(token);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Асинхронный thunk для получения истории чата
export const getChatHistory = createAsyncThunk(
    'chat/getChatHistory',
    async ({ receiverId, currentUserId }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            // Возвращаем данные, которые будут доступны в action.payload
            const data = await chatService.getChatHistory(receiverId, token);
            // Возвращаем данные вместе с ID текущего пользователя для фильтрации
            return { messages: data, currentUserId: currentUserId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Асинхронный thunk для отправки сообщения
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (messageData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await chatService.sendMessage(messageData, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для пометки сообщений как прочитанных
export const markMessagesAsRead = createAsyncThunk(
    'chat/markMessagesAsRead',
    async (receiverId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                return thunkAPI.rejectWithValue('Нет токена авторизации');
            }
            return await chatService.markMessagesAsRead(receiverId, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для очистки чата
export const clearChat = createAsyncThunk(
    'chat/clearChat',
    async (receiverId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                return thunkAPI.rejectWithValue('Нет токена авторизации');
            }
            return await chatService.clearChat(receiverId, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для удаления сообщения для всех
export const deleteMessageForEveryone = createAsyncThunk(
    'chat/deleteMessagesForEveryone',
    async (messageId, { getState, dispatch, rejectWithValue }) => {
        const { user } = getState().auth;

        if (!user) {
            return rejectWithValue('Нет токена авторизации');
        }

        try {
            // ⭐ ШАГ 1: МГНОВЕННО ОБНОВЛЯЕМ СООБЩЕНИЕ ЛОКАЛЬНО
            // Вместо полного удаления, мы можем просто отметить его как "удаленное".
            // Это позволит сохранить сообщение в списке и показать "Данное сообщение было удалено".
            // Для этого нужен action updateMessage.
            const messageToDelete = getState().chat.messages.find(m => m._id === messageId);
            if (messageToDelete) {
                dispatch(updateMessage({ ...messageToDelete, isDeleted: true }));
            }

            // ⭐ ШАГ 2: ОТПРАВЛЯЕМ ЗАПРОС НА СЕРВЕР ДЛЯ ОКОНЧАТЕЛЬНОГО УДАЛЕНИЯ ИЗ БАЗЫ ДАННЫХ
            await chatService.deleteMessageForEveryone(messageId);

            // ⭐ ШАГ 3: УВЕДОМЛЯЕМ ДРУГОГО ПОЛЬЗОВАТЕЛЯ ЧЕРЕЗ СОКЕТ
            // Здесь мы используем сокет для синхронизации с получателем.
            const receiverId = getState().users.userProfile?._id;
            if (receiverId) {
                const socket = getSocket(user._id);
                // socket.emit('messageUpdated', {
                //     _id: messageId,
                //     isDeleted: true,
                //     receiverId
                // });
                socket.emit('messageDeleted', {
                    _id: messageId,
                    receiverId
                });
            }

            // Возвращаем данные, чтобы thunk мог завершиться успешно
            return { messageId };

        } catch (error) {
            // Если что-то пошло не так на сервере, вы можете откатить локальное изменение.
            const message = error.response?.data?.message || error.message || error.toString();
            console.error('Ошибка ', message);
            return rejectWithValue(message);
        }
    }
);


// Асинхронный thunk для массового удаления сообщений
export const deleteAllMessagesForEveryone = createAsyncThunk(
    'chat/deleteAllMessagesForEveryone',
    async ({ messageIds, receiverId }, { getState, dispatch, rejectWithValue }) => {
        const { user } = getState().auth;
        
        if (!user) {
            return rejectWithValue('Нет токена авторизации');
        }

        try {
            // ⭐ Шаг 1: МГНОВЕННО удаляем все сообщения локально.
            // Это действие немедленно очистит чат для пользователя, который инициировал удаление.
            dispatch(deleteMessages({ messageIds }));

            // ⭐ Шаг 2: Отправляем запрос на сервер.
            // Ваш сервис принимает token.
            await chatService.deleteAllMessagesForEveryone(messageIds, receiverId);

            // ⭐ Шаг 3: Уведомляем другого пользователя через сокет.
            // Другой пользователь также должен мгновенно увидеть, что сообщения удалены.
            const socket = getSocket(user._id);
            socket.emit('messagesDeleted', {
                messageIds,
                receiverId
            });

            return { messageIds };

        } catch (error) {
            // В случае, если запрос к серверу не удался, мы можем
            // отменить локальное удаление (это продвинутая логика, но стоит о ней знать)
            const message = error.response?.data?.message || error.message || error.toString();
            return rejectWithValue(message);
        }
    }
);

// Асинхронный thunk для получения сводки непрочитанных сообщений
export const fetchUnreadConversationsSummary = createAsyncThunk(
    'chat/fetchUnreadConversationsSummary',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            return await chatService.fetchUnreadConversationsSummary(token);
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
); 

// Асинхронный thunk для активации чата
export const activateChat = createAsyncThunk(
    'chat/activateChatConnection',
    async (receiverId, thunkAPI) => {
        try {
            
            if (!token) {
                return thunkAPI.rejectWithValue('Нет токена авторизации');
            }

            const token = thunkAPI.getState().auth.token;
            const data = await chatService.activateChat(receiverId, token);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);
