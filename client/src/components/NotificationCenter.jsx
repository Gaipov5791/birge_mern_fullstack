// src/components/NotificationCenter.jsx
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUnreadConversationsSummary, markMessagesAsRead } from '../redux/features/chat/chatThunks';
import { clearNotificationForSender } from '../redux/features/chat/chatSlice';
import { FaTimes, FaComments } from 'react-icons/fa';
import { formatDistanceToNowStrict } from 'date-fns';
import { ru } from 'date-fns/locale';

function NotificationCenter({ isOpen, onClose, notificationButtonRef }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { unreadNotificationsSummary, isLoadingNotifications } = useSelector((state) => state.chat);

    const popoverRef = useRef(null);
    const isInitialRenderRef = useRef(true); // ⭐ НОВЫЙ РЕФЕРЕНС: Флаг для первого рендера

    const [popoverStyle, setPopoverStyle] = useState({}); // ⭐ Для динамического позиционирования на десктопе

    useEffect(() => {
        if (user && isOpen) {
            dispatch(fetchUnreadConversationsSummary());
        }
    }, [user, isOpen, dispatch]);

    useEffect(() => {
        // ⭐ Устанавливаем флаг в false после первого рендера, когда Popover открыт
        // Это предотвратит немедленное закрытие
        if (isOpen) {
            const timer = setTimeout(() => {
                isInitialRenderRef.current = false;
            }, 0); // Небольшая задержка, чтобы браузер успел обработать текущий клик
            return () => clearTimeout(timer); // Очистка таймера при размонтировании
        } else {
            isInitialRenderRef.current = true; // Сбрасываем флаг при закрытии
        }
    }, [isOpen]);

    // ⭐ useLayoutEffect для синхронного обновления стилей перед рендером
    useLayoutEffect(() => {
        if (isOpen && popoverRef.current && notificationButtonRef.current) {
            const buttonRect = notificationButtonRef.current.getBoundingClientRect();
            // Определяем, является ли текущее устройство мобильным (например, ширина экрана)
            // или используем Tailwind breakpoint 'md' (768px)
            const isMobile = window.innerWidth < 768; 

            if (!isMobile) {
                // Десктопное позиционирование: справа от кнопки, сверху
                setPopoverStyle({
                    top: '75px',
                    right: '0px', // Убираем right, если задан
                    width: '320px', // Фиксированная ширина
                    height: 'auto', // Автоматическая высота
                    maxHeight: '80vh', // Ограничиваем высоту на десктопе
                    transform: 'none', // Сброс трансформации, если есть
                });
            } else {
                // Мобильное позиционирование: снизу экрана, занимает почти всю ширину
                setPopoverStyle({
                    top: '75px',
                    left: '0',
                    right: '0',
                    width: '100%',
                    height: 'auto', // Автоматическая высота
                    maxHeight: '90vh', // Занимает до 90% высоты экрана
                    borderRadius: '1rem 1rem 0 0', // Скругление сверху
                    transform: 'translateY(0)', // Убеждаемся, что полностью виден
                });
            }
        }
    }, [isOpen, notificationButtonRef]); // Зависимости: isOpen, notificationButtonRef



    useEffect(() => {
        const handleClickOutside = (event) => {

            // ⭐ Добавляем проверку, что клик не был на самой кнопке уведомлений
            if (notificationButtonRef.current && notificationButtonRef.current.contains(event.target)) {
                console.log('handleClickOutside: Клик на кнопке уведомлений, игнорируем.');
                return;
            }
            
            // ⭐ Добавляем проверку флага, чтобы игнорировать клик, который открыл Popover
            if (isInitialRenderRef.current) {
                console.log('handleClickOutside: Игнорируем первый рендер.');
                return; 
            }

            // ⭐ Добавляем проверку, что клик не был на кнопке колокольчика
            // (передается ref из Navbar или другая идентификация)
            // Пока используем общую логику:
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                console.log('handleClickOutside: Клик вне Popover. Закрываем.');
                onClose();
            } else {
                console.log('handleClickOutside: Клик внутри Popover, ничего не делаем.');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]); // Убедитесь, что onClose стабильна (используйте useCallback в Navbar)

    const handleNotificationClick = (senderId) => {
        console.log('Кнопка уведомления сработала:', senderId);
        dispatch(markMessagesAsRead(senderId));
        dispatch(clearNotificationForSender(senderId));
        navigate(`/chat/${senderId}`);
        onClose();
    };

    if (!isOpen) return null;


    return (
        <div
            ref={popoverRef}
            // ⭐ Обновленные классы Tailwind для позиционирования и адаптивности
            // Используем fixed для мобильных, чтобы он мог быть внизу экрана
            className={`fixed md:absolute bg-neutral-700 rounded-lg shadow-xl border border-gray-400 z-50 overflow-hidden 
                       transition-all duration-300 ease-in-out
                       ${window.innerWidth < 768 ? 'md:hidden' : ''} `} // Скрываем мобильную версию на десктопе
            style={{ ...popoverStyle }} // Применяем динамические стили
        >
            <div className="p-4 border-b border-gray-400 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Уведомления</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-slate-200">
                    <FaTimes />
                </button>
            </div>
            {isLoadingNotifications ? (
                <div className="p-4 text-center text-gray-400">Загрузка...</div>
            ) : unreadNotificationsSummary.length === 0 ? (
                <div className="p-4 text-center text-gray-400">Нет новых сообщений</div>
            ) : (
                <div className="max-h-[calc(90vh-100px)] overflow-y-auto">
                    {unreadNotificationsSummary.map((notification) => (
                        <div
                            key={notification.senderId}
                            className="flex items-center p-3 border-b border-gray-300 cursor-pointer"
                            onClick={() => handleNotificationClick(notification.senderId)}
                        >
                            <img
                                src={notification.senderProfilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                                alt={notification.senderUsername}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-400 hover:text-slate-200">
                                    <span className="font-bold">{notification.senderUsername}</span> отправил {notification.unreadCount} новое {notification.unreadCount === 1 ? 'сообщение' : 'сообщения'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatDistanceToNowStrict(new Date(notification.lastMessageAt), { addSuffix: true, locale: ru })}
                                </p>
                            </div>
                            <FaComments className="text-indigo-500 ml-2" />
                        </div>
                    ))}
                </div>
            )}
            <div className="p-3 border-t border-gray-300 text-center">
                <Link to="/chat" onClick={onClose} className="text-indigo-400 hover:text-indigo-200 text-sm">
                    Посмотреть все чаты
                </Link>
            </div>
        </div>
    );
}

export default NotificationCenter;