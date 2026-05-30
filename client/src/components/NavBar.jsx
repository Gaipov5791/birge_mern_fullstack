import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/auth/authThunks";
import { reset as resetAuth } from "../redux/features/auth/authSlice";
import notificationService from "../api/notificationService";
import ActivityNotificationPanel from "./ActivityNotificationPanel";
import {
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt,
    FaGlobe,
    FaBars,
    FaTimes,
    FaHome,
    FaChartLine,
    FaUserFriends,
    FaEnvelopeOpenText,
    FaBell,
} from "react-icons/fa";

const POLL_INTERVAL_MS = 45_000;

function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    const notificationButtonRef = useRef(null);
    const notificationPanelRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Ошибка получения счётчика уведомлений:', error);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return undefined;
        }

        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [user, fetchUnreadCount]);

    const onLogout = useCallback(() => {
        dispatch(logoutUser());
        dispatch(resetAuth());
        navigate("/login");
    }, [dispatch, navigate]);

    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
        setIsNotificationsOpen(false);
    }, []);

    const handleMenuClose = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const handleNotificationsToggle = useCallback(async () => {
        if (!user) return;

        if (isNotificationsOpen) {
            setIsNotificationsOpen(false);
            return;
        }

        setIsLoadingNotifications(true);
        setIsNotificationsOpen(true);

        try {
            const [list] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.markNotificationsAsRead(),
            ]);
            setNotifications(list);
            setUnreadCount(0);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [user, isNotificationsOpen]);

    const handleCloseNotifications = useCallback(() => {
        setIsNotificationsOpen(false);
    }, []);

    const userPhoto =
        user?.profilePicture ||
        "https://placehold.co/40x40/1f2937/FFFFFF?text=P";
    const userName = user?.username || "Гость";
    const userId = user?._id;

    const notificationBadge = unreadCount > 0 && (
        <span
            className="absolute top-1 right-1 flex items-center justify-center
                       text-xs font-bold leading-none text-red-100
                       bg-red-600 rounded-full min-w-[1.25rem] h-5 px-1"
        >
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );

    const notificationButton = user && (
        <div className="relative" ref={notificationButtonRef}>
            <button
                type="button"
                onClick={handleNotificationsToggle}
                className="relative p-2 rounded-lg transition-colors hover:bg-neutral-800 text-gray-300 hover:text-blue-400 focus:outline-none"
                aria-label="Уведомления"
            >
                <FaBell className="text-2xl" />
                {notificationBadge}
            </button>
            <ActivityNotificationPanel
                isOpen={isNotificationsOpen}
                onClose={handleCloseNotifications}
                notifications={notifications}
                isLoading={isLoadingNotifications}
                panelRef={notificationPanelRef}
                buttonRef={notificationButtonRef}
            />
        </div>
    );

    return (
        <nav className="bg-neutral-900 border-b border-neutral-800 shadow-xl p-4 sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto flex justify-between items-center">
                <Link
                    to="/"
                    className="text-blue-400 text-2xl uppercase font-extrabold transition-colors hover:text-blue-300 flex items-center"
                >
                    <FaGlobe className="mr-2 text-3xl" /> Бирге
                </Link>

                <ul className="hidden lg:flex space-x-6 items-center relative">
                    {user ? (
                        <li>{notificationButton}</li>
                    ) : (
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

                <div className="lg:hidden flex items-center space-x-4">
                    {notificationButton}
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

            {isMenuOpen && (
                <>
                    <div
                        onClick={handleMenuClose}
                        className="fixed inset-0 bg-black bg-opacity-60 z-40"
                    ></div>
                    <div
                        className={`lg:hidden bg-neutral-800 border-t border-neutral-700 shadow-2xl absolute top-[64px] left-0 w-full z-50 
                                   transform transition-transform duration-300 ease-out p-4`}
                    >
                        {user ? (
                            <div className="flex flex-col space-y-2 py-2">
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

                                <Link
                                    to="/dashboard"
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaHome className="text-xl" />
                                    <span>Главная лента</span>
                                </Link>

                                <Link
                                    to="/discover/trends"
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaChartLine className="text-xl" />
                                    <span>Тренды</span>
                                </Link>

                                <Link
                                    to="/discover/users"
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaUserFriends className="text-xl" />
                                    <span>Кого читать</span>
                                </Link>

                                <Link
                                    to="/feedback"
                                    onClick={handleMenuClose}
                                    className="flex items-center space-x-4 text-gray-300 font-medium text-lg hover:text-blue-400 p-3 rounded-lg hover:bg-neutral-700 transition"
                                >
                                    <FaEnvelopeOpenText className="text-xl" />
                                    <span>Отправить отзыв</span>
                                </Link>

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
