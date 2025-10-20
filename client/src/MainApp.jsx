import React, { useEffect, useState } from 'react'; // ⭐ Добавлен useState
import { useDispatch, useSelector } from 'react-redux'; // ⭐ Добавлен useSelector
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import ToastContainer from './components/common/ToastContainer';
import { FaSpinner } from 'react-icons/fa';

// Импорты страниц
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CommentPostPage from './pages/CommentPostPage';
import DiscoverPage from './pages/DiscoverPage';
import ChatPage from './pages/ChatPage';
import TrendsPage from './pages/TrendsPage';
import UsersPage from './pages/UsersPage';
import HashtagFeedPage from './pages/HashtagFeedPage';
import FeedbackPage from './pages/FeedbackPage'; // ⭐ Импорт страницы обратной связи

// Импорты компонентов
import Navbar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';

// Импорт Redux
import { setAuthToken, setAuthLoading } from './redux/features/auth/authSlice'; 
import { getMe } from './redux/features/auth/authThunks'; 
import { getRecommendedUsers } from './redux/features/users/userThunks'; // ⭐ Импорт Thunk рекомендаций

const MainApp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ⭐ Получаем статус аутентификации
    const { user, isLoading: isGoogleAuthLoading } = useSelector((state) => state.auth);
    
    // ⭐ Состояние для отслеживания, была ли выполнена первичная загрузка данных после входа
    const [initialDataFetched, setInitialDataFetched] = useState(false);


    // ⭐ ЛОГИКА АВТОМАТИЧЕСКОЙ ЗАГРУЗКИ ПОСТ-АУТЕНТИФИКАЦИИ
    useEffect(() => {
        // Условие: Пользователь авторизован И данные еще не загружались
        if (user && !initialDataFetched) {
            console.log("MainApp: Запуск первичной загрузки данных приложения (Recommended Users)");
            
            // 1. Запуск Thunk для получения рекомендованных пользователей
            dispatch(getRecommendedUsers());
            
            // 2. Установка флага, чтобы Thunk не запускался снова
            setInitialDataFetched(true);
        }
        
        // Сброс флага при выходе из системы, чтобы данные загрузились при следующем входе
        if (!user && initialDataFetched) {
             setInitialDataFetched(false);
        }

    }, [user, initialDataFetched, dispatch]); // Реагируем на изменение объекта user

    // ⭐ ЛОГИКА ПЕРЕХВАТА ТОКЕНА GOOGLE OAUTH (оставлена без изменений)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token'); 
        const error = searchParams.get('error'); 

        if (token) {
            localStorage.setItem('token', token); 
            dispatch(setAuthToken(token));
            // ⭐ КРИТИЧЕСКОЕ ДОБАВЛЕНИЕ: Включаем спиннер, пока ждем getMe()
            dispatch(setAuthLoading(true));
            dispatch(getMe()); 
            navigate('/dashboard', { replace: true }); 
        } else if (error) {
            console.error('Ошибка Google OAuth:', error);
            navigate('/login', { replace: true }); 
        }

    }, [location, navigate, dispatch]); 

    // Индикатор полной загрузки 
    if (isGoogleAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <p className="ml-4 text-gray-400">Идет авторизация...</p>
            </div>
        );
    }


    return (
        <>
            <ToastContainer/>
            <Navbar />
            <Routes>
                <Route path="/" element={<DiscoverPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path='/discover/trends' element={<TrendsPage />} />
                <Route path='/discover/users' element={<UsersPage />} />
                <Route path='/hashtag/:tagName' element={<HashtagFeedPage />} />
                <Route path="/feedback" element={<FeedbackPage />} /> {/* ⭐ Маршрут обратной связи */}

                {/* Защищенные маршруты */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/post/:id" element={<PrivateRoute><CommentPostPage /></PrivateRoute>} />
                <Route path="/chat/:receiverId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            </Routes>
        </>
    );
}

export default MainApp;