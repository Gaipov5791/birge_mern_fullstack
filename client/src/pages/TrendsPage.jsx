import React, { useEffect } from 'react'; // 💡 Добавлен useEffect
import { FaChartLine, FaChevronLeft, FaSpinner } from 'react-icons/fa'; // 💡 Добавлен FaSpinner
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 💡 Добавлен Redux
import { getTrends } from '../redux/features/trends/trendThunks'; // 💡 Импорт Thunk

import TrendItem from '../components/common/TrendItem'; // 💡 Импорт компонента TrendItem


function TrendsPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // 💡 Инициализация dispatch

    // ⭐ Извлекаем данные и флаги из Redux
    const { 
        trends, 
        isLoading: isTrendsLoading, 
        isError, 
        message 
    } = useSelector((state) => state.trends);
    
    // 💡 useEffect для загрузки трендов при монтировании компонента
    useEffect(() => {
        dispatch(getTrends());
    }, [dispatch]);

    // ⭐ 2. Индикатор загрузки
    if (isTrendsLoading && trends.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <p className="ml-4 text-gray-400">Загрузка трендов...</p>
            </div>
        );
    }

    // ⭐ 3. Индикатор ошибки
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
                <p className="text-red-500 text-lg mb-4">Ошибка загрузки трендов: {message}</p>
                <button 
                    onClick={() => dispatch(getTrends())} 
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
                        <FaChartLine className="mr-2 text-red-400" /> Актуальные тренды
                    </h1>
                </header>

                {/* Список трендов */}
                <div className="trends-list px-4 py-4">
                    {(trends && Array.isArray(trends) && trends.length > 0) ? ( // 💡 Используем реальные данные
                        trends.map((trend, index) => (
                            <TrendItem 
                                key={trend._id || trend.topic} // Используем id, если есть
                                rank={index + 1}
                                topic={trend.topic} 
                                postCount={trend.count} // Используем поле count из бэкенда
                            />
                        ))
                    ) : (
                        !isTrendsLoading && (
                            <div className="text-center p-10 text-gray-500">
                                В настоящее время нет актуальных трендов.
                            </div>
                        )
                    )}
                </div>

                <div className="text-center p-6 text-gray-500">
                    На этом пока всё! Обновление трендов происходит каждый час.
                </div>
            </div>
        </div>
    );
}

export default TrendsPage;