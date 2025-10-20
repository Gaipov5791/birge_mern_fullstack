import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Импортируем useSelector, чтобы проверить, залогинен ли пользователь
import { FaGlobe, FaArrowRight } from 'react-icons/fa'; // Используем более подходящие иконки для лендинга

function DiscoverPage() {
    const { user } = useSelector((state) => state.auth); // Проверяем, залогинен ли пользователь

    return (
        // ⭐ Тёмный фон с мягким радиальным градиентом для глубины
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-center p-6 sm:p-8 md:p-12 relative overflow-hidden">
            
            {/* ⭐ Эффект мягкого свечения (Background Glow) */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-1/4 left-1/4"></div>
                <div className="w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 bottom-1/4 right-1/4"></div>
            </div>

            {/* Контент центрируется поверх свечения */}
            <div className="relative z-10 max-w-4xl">
                
                {/* Логотип */}
                <FaGlobe className='text-6xl text-blue-400 mx-auto mb-6 animate-pulse-slow' />
                
                <h1 className="text-6xl md:text-8xl font-extrabold text-blue-400 mb-4 animate-fade-in tracking-tight">
                    Бирге
                </h1>

                {/* Заголовок/слоган */}
                <h2 className="text-2xl sm:text-4xl font-semibold text-gray-100 mb-6 mt-4 animate-fade-in-delay-1 max-w-2xl mx-auto">
                    Соединяй, Делись, Общайся — <span className="text-blue-400">Вместе</span>.
                </h2>
                
                {/* Краткое описание */}
                <p className="text-md sm:text-lg text-gray-300 mb-10 max-w-xl mx-auto animate-fade-in-delay-2">
                    Присоединяйтесь к "Бирге" — вашей новой социальной сети. Делитесь моментами, находите единомышленников и оставайтесь на связи с теми, кто важен.
                </p>

                {/* Призывы к действию */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
                    {user ? ( // Если пользователь залогинен, предлагаем перейти на дашборд
                        <Link 
                            to="/dashboard" 
                            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/50 transition duration-300 ease-in-out transform hover:scale-[1.03] text-sm sm:text-lg"
                        >
                            <span>Перейти к Ленте</span>
                            <FaArrowRight />
                        </Link>
                    ) : ( // Иначе, предлагаем войти или зарегистрироваться
                        <>
                            {/* ⭐ Основное действие: Войти */}
                            <Link 
                                to="/login" 
                                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/50 transition duration-300 ease-in-out transform hover:scale-[1.03] text-sm sm:text-lg"
                            >
                                Войти в Аккаунт
                            </Link>
                            {/* ⭐ Второстепенное действие: Регистрация (Контурный стиль) */}
                            <Link 
                                to="/register" 
                                className="flex items-center justify-center space-x-2 text-blue-400 font-bold py-3 px-8 rounded-xl border border-blue-600 transition duration-300 ease-in-out transform hover:bg-blue-600 hover:text-white hover:shadow-lg text-sm sm:text-lg"
                            >
                                Зарегистрироваться
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <footer className="mt-20 text-gray-600 text-sm">
                &copy; 2025 Бирге. Все права защищены.
            </footer>
        </div>
    );
}

export default DiscoverPage;