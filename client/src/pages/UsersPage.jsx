import React, { useEffect, useCallback, useState, useRef } from 'react';
import { FaUserPlus, FaChevronLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { followUser, unfollowUser } from '../redux/features/auth/authThunks';
import { getRecommendedUsers } from '../redux/features/users/userThunks';

import UserCard from '../components/common/UserCard';


function UsersPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    

    const { 
        recommendedUsers, 
        isRecommendedLoading, 
        isRecommendedError, 
        message 
    } = useSelector((state) => state.users);

    const [actionLoadingId, setActionLoadingId] = useState(null); // ID пользователя, для которого выполняется действие

    // Загрузка рекомендованных пользователей при монтировании компонента
    useEffect(() => {
        
        if (
            recommendedUsers.length === 0 && 
            !isRecommendedLoading && 
            !isRecommendedError
        ) {
        console.log("UsersPage: Запуск Thunk для получения рекомендаций.");
        dispatch(getRecommendedUsers());
        }

    }, [dispatch, recommendedUsers.length, isRecommendedLoading, isRecommendedError]);

    // ⭐ Хендлер для подписки/отписки
    const handleToggleFollow = useCallback(async (userId, isFollowing) => {
        // if (actionLoadingId) return; // Игнорируем клики, пока другая операция в процессе

        setActionLoadingId(userId); // Начинаем загрузку для конкретного пользователя
        
        try {
            if (isFollowing) {
                // Если подписан -> отписаться
                await dispatch(unfollowUser(userId)).unwrap();
            } else {
                // Если не подписан -> подписаться
                await dispatch(followUser(userId)).unwrap();
            }
        } catch (error) {
            console.error('Ошибка подписки/отписки:', error);
            // Обработка ошибки будет в userSlice (необязательно, но полезно)
        } finally {
            setActionLoadingId(null); // Завершаем загрузку
        }
    }, [dispatch, actionLoadingId]);

    // Индикатор полной загрузки (если список пуст и идет загрузка)
    if (isRecommendedLoading && recommendedUsers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <p className="ml-4 text-gray-400">Загрузка рекомендаций...</p>
            </div>
        );
    }

    // Индикатор ошибки
    if (isRecommendedError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
                <p className="text-red-500 text-lg mb-4">Ошибка загрузки рекомендаций: {message}</p>
                <button 
                    onClick={() => dispatch(getRecommendedUsers())} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100">
            <div className="max-w-xl mx-auto border-x border-neutral-800">
                
                {/* Заголовок с кнопкой "Назад" */}
                <header className="sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10 p-4 border-b border-neutral-800 flex items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 mr-4 text-blue-400 hover:bg-neutral-800 rounded-full transition"
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-100 flex items-center">
                        <FaUserPlus className="mr-2 text-blue-400" /> Кого читать?
                    </h1>
                </header>

                {/* Список рекомендаций */}
                <div className="users-list">
                    {recommendedUsers.length > 0 ? (
                        recommendedUsers.map((user, index) => {
                            // ⭐ КРИТИЧЕСКАЯ ПРОВЕРКА: Если элемент пуст, пропускаем его
                            if (!user) {
                                console.warn(`Обнаружен пустой элемент в recommendedUsers на индексе ${index}`);
                                return null;
                            }
                            
                            return (
                                <UserCard 
                                    // Используем _id как key, fallback к index
                                    key={user._id || index} 
                                    user={user} 
                                    onToggleFollow={handleToggleFollow}
                                    isActionLoading={actionLoadingId} 
                                    size="large" // Добавлено, чтобы соответствовать логике UserCard
                                />
                            );
                        })
                    ) : (
                        !isRecommendedLoading && (
                            <div className="text-center p-10 text-gray-500">
                                В настоящее время нет подходящих рекомендаций.
                            </div>
                        )
                    )}
                    
                    {/* Кнопка "Загрузить больше" (для будущей пагинации) */}
                    <div className="text-center p-6 text-blue-500 hover:text-blue-400 cursor-pointer">
                        Загрузить больше рекомендаций...
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersPage;