import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/features/auth/authSlice';
import postReducer from '../redux/features/posts/postSlice';
import commentReducer from '../redux/features/comments/commentSlice';
import userReducer from '../redux/features/users/userSlice';
import notificationReducer from './features/notifications/notificationSlice';
import trendsReducer from './features/trends/trendSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        comments: commentReducer,
        users: userReducer,
        notifications: notificationReducer,
        trends: trendsReducer,
    },
});

export { store };
