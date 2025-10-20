import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../redux/features/auth/authSlice';
import postReducer from '../redux/features/posts/postSlice';
import commentReducer from '../redux/features/comments/commentSlice'; // Импорт редюсера для комментариев
import userReducer from '../redux/features/users/userSlice'; // Импорт редюсера для пользователей
import chatReducer from '../redux/features/chat/chatSlice'; // Импорт редюсера для чата
import notificationReducer from './features/notifications/notificationSlice';
import trendsReducer from './features/trends/trendSlice';

import { chatSocketMiddleware } from '../middleware/chatSocketMiddleware';

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer, // Добавляем редюсер для постов
        comments: commentReducer, // Добавляем редюсер для комментариев
        users: userReducer, // Добавляем редюсер для пользователей
        chat: chatReducer, // Добавляем редюсер для чата
        notifications: notificationReducer,
        trends: trendsReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(chatSocketMiddleware),
});

export { store };