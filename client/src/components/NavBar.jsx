import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/auth/authThunks";
import { reset as resetAuth } from "../redux/features/auth/authSlice";
import {
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt,
    FaGlobe,
    FaBars,
    FaTimes,
    FaBell,
    FaComments,
    FaHome, // ⭐ НОВАЯ ИКОНКА для Ленты
    FaChartLine, // ⭐ НОВАЯ ИКОНКА для Трендов
    FaUserFriends, // ⭐ НОВАЯ ИКОНКА для Кого Читать
    FaEnvelopeOpenText // ⭐ НОВАЯ ИКОНКА для Отправки Отзыва
} from "react-icons/fa";
import NotificationCenter from "./NotificationCenter";

function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { unreadNotificationsSummary } = useSelector((state) => state.chat);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const notificationButtonRef = useRef(null); 

    const onLogout = useCallback(() => {
        dispatch(logoutUser());
        dispatch(resetAuth());
        navigate("/login");
    }, [dispatch, navigate]);

    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
        setIsNotificationsOpen(false); // Закрываем уведомления при открытии мобильного меню
    }, []);

    const handleMenuClose = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const handleNotificationsToggle = useCallback(() => {
        setIsNotificationsOpen((prev) => !prev);
        setIsMenuOpen(false); // Закрываем мобильное меню при открытии уведомлений
    }, []);

    const handleCloseNotifications = useCallback(() => {
        setIsNotificationsOpen(false);
    }, []);

    const totalNotifications = unreadNotificationsSummary.reduce(
        (sum, notification) => sum + notification.unreadCount,
        0
    );

    const userPhoto =
        user?.profilePicture ||
        "https://placehold.co/40x40/1f2937/FFFFFF?text=P"; // ⭐ Заменил на placeholder
    const userName = user?.username || "Гость";
    const userId = user?._id;

    return (
        // ⭐ Тёмный фон, легкий отделитель снизу и тень
        <nav className="bg-neutral-900 border-b border-neutral-800 shadow-xl p-4 sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto flex justify-between items-center">
                {/* Логотип */}
                <Link
                    to="/"
                    // ⭐ Использование акцентного синего цвета для логотипа
                    className="text-blue-400 text-2xl uppercase font-extrabold transition-colors hover:text-blue-300 flex items-center"
                >
                    <FaGlobe className="mr-2 text-3xl" /> Бирге
                </Link>

                {/* Desktop меню и интерактивные элементы */}
                <ul className="hidden lg:flex space-x-6 items-center relative">
                    {user ? (
                        <>

                            {/* Кнопка уведомлений */}
                            <li>
                                <button
                                    ref={notificationButtonRef}
                                    onClick={handleNotificationsToggle}
                                    className="relative p-2 rounded-lg transition-colors hover:bg-neutral-800 text-gray-300 hover:text-blue-400 focus:outline-none"
                                >
                                    <FaBell className="text-2xl" />
                                    {totalNotifications > 0 && (
                                        <span 
                                            // ⭐ Современный значок уведомлений
                                            className="absolute top-1 right-3 transform translate-x-1/2 -translate-y-1/2 
                                                       flex items-center justify-center 
                                                       text-xs font-bold leading-none text-red-100 
                                                       bg-red-600 rounded-full w-5 h-5"
                                        >
                                            {totalNotifications > 9 ? "9+" : totalNotifications}
                                        </span>
                                    )}
                                </button>
                            </li>
                        </>
                    ) : (
                        // Меню для неавторизованных
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className="flex items-center px-4 py-2 bg-blue-600 rounded-lg text-white transition-all duration-200 hover:bg-blue-700 shadow-md"
                                >
                                    <FaSignInAlt className="mr-2" /> Вход
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="flex items-center text-blue-400 hover:text-blue-300"
                                >
                                    <FaUserPlus className="mr-2" /> Регистрация
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                {/* Mobile: кнопки управления (уведомления + бургер) */}
                <div className="lg:hidden flex items-center space-x-4">
                    {user && ( // Показываем кнопку уведомлений, только если пользователь залогинен
                        <button
                            ref={notificationButtonRef}
                            onClick={handleNotificationsToggle}
                            className="relative text-gray-300 hover:text-blue-400 focus:outline-none p-2 rounded-lg transition-colors hover:bg-neutral-800"
                        >
                            <FaBell className="text-xl" />
                            {totalNotifications > 0 && (
                                <span 
                                    className="absolute top-0 right-2 inline-flex items-center justify-center 
                                               w-4 h-4 text-[10px] font-bold leading-none text-red-100 
                                               transform translate-x-1/4 -translate-y-1/4 
                                               bg-red-600 rounded-full"
                                >
                                    {totalNotifications > 9 ? "9+" : totalNotifications} 
                                </span>
                            )}
                        </button>
                    )}
                    {/* Кнопка бургера */}
                    <button
                        onClick={handleMenuToggle}
                        className="text-gray-300 hover:text-blue-400 focus:outline-none p-2 rounded-lg transition-colors hover:bg-neutral-800"
                    >
                        {isMenuOpen ? (
                            <FaTimes className="text-2xl" />
                        ) : (
                            <FaBars className="text-2xl" />
                        )}
                    </button>
                </div>
            </div>

            {/* NotificationCenter */}
            {user && isNotificationsOpen && (
                <NotificationCenter
                    isOpen={isNotificationsOpen}
                    onClose={handleCloseNotifications}
                    notificationButtonRef={notificationButtonRef}
                />
            )}

            {/* Mobile меню (Плавное открытие) */}
            {isMenuOpen && (
                <>
                    {/* Затемнение фона */}
                    <div
                        onClick={handleMenuClose}
                        className="fixed inset-0 bg-black bg-opacity-60 z-40"
                    ></div>
                    {/* Само меню */}
                    <div
                        className={`lg:hidden bg-neutral-800 border-t border-neutral-700 shadow-2xl absolute top-[64px] left-0 w-full z-50 
                                   transform transition-transform duration-300 ease-out p-4`}
                    >
                        {user ? (
                            <div className="flex flex-col space-y-2 py-2">
                                {/* Профиль (наверху мобильного меню) */}
                                <Link
                                    to={`/profile/${userId}`}
                                    className="flex items-center space-x-3 text-gray-200 hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                    onClick={handleMenuClose}
                                >
                                    <img
                                        src={userPhoto}
                                        alt="Профиль"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/1f2937/FFFFFF?text=P"; }}
                                    />
                                    <span className="font-semibold text-lg">{userName}</span>
                                </Link>

                                {/* ⭐ НОВАЯ ССЫЛКА: Лента (для удобства навигации в мобильном меню) */}
                                <Link
                                    to="/dashboard"
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaHome className="text-xl" /> 
                                    <span>Главная лента</span>
                                </Link>

                                {/* Ссылка на все чаты */}
                                <Link
                                    to="/chat"
                                    onClick={() => { handleMenuClose(); handleCloseNotifications(); }}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition relative"
                                >
                                    <FaComments className="text-xl" /> 
                                    <span>Чаты</span> 
                                    {totalNotifications > 0 && (
                                        <span 
                                            className="absolute right-3 inline-flex items-center justify-center 
                                                       w-6 h-6 text-xs font-bold bg-red-600 text-red-100 rounded-full"
                                        >
                                            {totalNotifications > 9 ? "9+" : totalNotifications}
                                        </span>
                                    )}
                                </Link>

                                {/* ⭐ НОВАЯ ССЫЛКА: Тренды (контент правой панели) */}
                                <Link
                                    // Используем условные маршруты, которые позже будут созданы для мобильной версии
                                    to="/discover/trends" 
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaChartLine className="text-xl" /> 
                                    <span>Тренды</span>
                                </Link>

                                {/* ⭐ НОВАЯ ССЫЛКА: Кого читать (контент правой панели) */}
                                <Link
                                    to="/discover/users" 
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaUserFriends className="text-xl" /> 
                                    <span>Кого читать</span>
                                </Link>

                                {/* ⭐ ИСПРАВЛЕНИЕ: Замена кнопки "Создать пост" */}
                                <Link
                                    to="/feedback"
                                    onClick={handleMenuClose} // Закрываем меню после клика
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaEnvelopeOpenText className="text-xl" /> 
                                    <span>Отправить отзыв</span> {/* Текст теперь видим */}
                                </Link>
                                
                                {/* Кнопка Выхода */}
                                <button
                                    onClick={() => {
                                        onLogout();
                                        handleMenuClose();
                                    }}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-red-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaSignOutAlt className="text-xl" />
                                    <span>Выход</span>
                                </button>
                            </div>
                        ) : (
                            // Меню для неавторизованных
                            <div className="flex flex-col space-y-2 py-2">
                                <Link
                                    to="/login"
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                    onClick={handleMenuClose}
                                >
                                    <FaSignInAlt className="text-xl" /> <span>Вход</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                    onClick={handleMenuClose}
                                >
                                    <FaUserPlus className="text-xl" /> <span>Регистрация</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </nav>
    );
}

export default Navbar;
