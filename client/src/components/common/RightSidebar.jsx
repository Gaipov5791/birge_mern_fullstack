import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaChevronRight, FaChartLine, FaSpinner } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux'; 

// Импортируем общие компоненты
import UserCard from './UserCard'; // ⭐ НОВЫЙ ИМПОРТ
import TrendItem from './TrendItem'; // ⭐ НОВЫЙ ИМПОРТ

import { getRecommendedUsers } from '../../redux/features/users/userThunks'; 
import { getTrends } from '../../redux/features/trends/trendThunks';


function RightSidebar() {
    const dispatch = useDispatch();
    const { 
        recommendedUsers, 
        isRecommendedLoading 
    } = useSelector((state) => state.users);
    const { 
        trends, 
        isLoading: isTrendsLoading 
    } = useSelector((state) => state.trends);

    useEffect(() => {
        dispatch(getRecommendedUsers());
        dispatch(getTrends());
    }, [dispatch]);

    // Берем только первые 3 элемента для отображения в сайдбаре
    const displayedUsers = recommendedUsers.slice(0, 3);
    const displayedTrends = trends.slice(0, 3);
    
    // --- Вспомогательные функции для отображения загрузки ---
    const renderLoadingPlaceholder = () => (
        <div className="flex justify-center items-center py-4 text-gray-400">
            <FaSpinner className="animate-spin mr-2" /> Загрузка...
        </div>
    );

    return (
        // Фиксированная боковая панель для десктопов
        <div className="hidden lg:block w-72 min-h-screen p-4 sticky top-[80px] self-start space-y-6
                        border border-neutral-700 hover:border-blue-600 
                        transform transition-all duration-700 ease-out rounded-xl">

            {/* 1. Виджет "Кого читать" */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-3">
                <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center">
                    <FaUserPlus className="mr-2 text-blue-400" /> Кого читать?
                </h3>
                
                <div className='space-y-1'>
                    {/* ⭐ Отображение загрузки или данных пользователей */}
                    {isRecommendedLoading && displayedUsers.length === 0 ? (
                        renderLoadingPlaceholder()
                    ) : (
                        displayedUsers.map(user => {
                            // ⭐ КРИТИЧЕСКАЯ ПРОВЕРКА: на случай, если элемент пуст
                            if (!user) return null; 
                            
                            return (
                                <UserCard 
                                    key={user._id} 
                                    user={user} // ✅ ИСПРАВЛЕНИЕ: Передаем весь объект как пропс 'user'
                                    size="small" // Указываем размер для сайдбара
                                    // onToggleFollow здесь не нужен, так как кнопка в size="small" отключена
                                />
                            );
                        })
                    )}
                    
                    {/* Если данных нет и загрузка завершена */}
                    {(!isRecommendedLoading && displayedUsers.length === 0) && (
                        <p className="text-gray-500 text-sm p-2 text-center">
                            Нет рекомендаций.
                        </p>
                    )}
                </div>

                <Link to="/discover/users" className="text-blue-500 hover:text-blue-400 text-sm mt-3 p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between">
                    Показать еще
                    <FaChevronRight className="text-xs ml-1" />
                </Link>
            </div>

            {/* 2. Виджет "Тренды" */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-3">
                <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center">
                    <FaChartLine className="mr-2 text-red-400" /> Актуальные тренды
                </h3>

                <div className='space-y-1'>
                    {/* ⭐ Отображение загрузки или данных трендов */}
                    {isTrendsLoading && displayedTrends.length === 0 ? (
                        renderLoadingPlaceholder()
                    ) : (
                        displayedTrends.map((trend, index) => (
                            <TrendItem 
                                key={trend.topic || index}
                                topic={trend.topic} 
                                postCount={trend.count} // Ожидаем поле count
                            />
                        ))
                    )}

                    {/* Если данных нет и загрузка завершена */}
                    {(!isTrendsLoading && displayedTrends.length === 0) && (
                        <p className="text-gray-500 text-sm p-2 text-center">
                            Нет актуальных трендов.
                        </p>
                    )}
                </div>
                
                <Link to="/discover/trends" className="text-blue-500 hover:text-blue-400 text-sm mt-3 p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between">
                    Все тренды
                    <FaChevronRight className="text-xs ml-1" />
                </Link>
            </div>

            {/* 3. Дополнительная информация/Ссылки (Необязательно) */}
            <footer className="text-xs text-gray-600 pt-2 px-2">
                <p>&copy; 2024 Бирге. О нас • Помощь • Условия.</p>
            </footer>
        </div>
    );
}

export default RightSidebar;