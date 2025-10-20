import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../redux/features/notifications/notificationSlice';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// Длительность отображения тоста (5 секунд)
const TOAST_DURATION = 3000;
// ⭐ ИЗМЕНЕНИЕ: Увеличиваем длительность анимации для лучшей плавности
const ANIMATION_DURATION_MS = 500; 

// --- Вспомогательный компонент для одиночного тоста ---
const Toast = React.memo(({ id, message, type }) => {
    const dispatch = useDispatch();
    const [isMounted, setIsMounted] = React.useState(false); 
    const [isClosing, setIsClosing] = React.useState(false);

    // Закрывает тост, запуская анимацию
    const handleClose = useCallback(() => {
        setIsClosing(true);
        // После завершения анимации удаляем из Redux
        setTimeout(() => {
            dispatch(removeToast(id));
        }, ANIMATION_DURATION_MS);
    }, [dispatch, id]);

    // Эффект для запуска анимации появления и автоматического закрытия
    useEffect(() => {
        // Запускаем анимацию появления с короткой задержкой
        const appearTimer = setTimeout(() => setIsMounted(true), 10);
        
        // Эффект для автоматического закрытия
        const autoCloseTimer = setTimeout(handleClose, TOAST_DURATION);

        return () => {
            clearTimeout(appearTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [handleClose]);

    // Определение стилей и иконок
    let icon, colorClasses;
    switch (type) {
        case 'success':
            icon = <FaCheckCircle className="text-2xl text-green-400" />;
            colorClasses = 'bg-neutral-800 border-green-500';
            break;
        case 'error':
            icon = <FaExclamationCircle className="text-2xl text-red-500" />;
            colorClasses = 'bg-neutral-800 border-red-500';
            break;
        case 'info':
        default:
            icon = <FaInfoCircle className="text-2xl text-blue-400" />;
            colorClasses = 'bg-neutral-800 border-blue-500';
            break;
    }

    let animationClasses;
    let easeFunction; // ⭐ НОВАЯ ПЕРЕМЕННАЯ ДЛЯ УПРАВЛЕНИЯ EASE

    if (isClosing) {
        // Уход: скольжение вправо и исчезновение
        animationClasses = 'opacity-0 translate-x-full';
        easeFunction = 'ease-in'; // ⭐ ПЛАВНЫЙ УХОД: медленно начинается, быстро заканчивается
    } else if (isMounted) {
        // Появление: полное отображение
        animationClasses = 'opacity-100 translate-x-0';
        easeFunction = 'ease-out'; // ⭐ ПЛАВНОЕ ПОЯВЛЕНИЕ: быстро начинается, замедляется к концу
    } else {
        // Начальное состояние: невидимый и сдвинутый вправо
        animationClasses = 'opacity-0 translate-x-full';
        easeFunction = 'ease-out';
    }
    
    // ⭐ ОБНОВЛЕНИЕ КЛАССОВ: Использование duration-{ANIMATION_DURATION_MS} и динамической easeFunction
    return (
        <div
            className={`
                w-full max-w-sm p-4 rounded-xl shadow-2xl border-l-4 
                ${colorClasses} 
                flex items-start justify-between 
                transform transition-all duration-${ANIMATION_DURATION_MS} ${easeFunction}
                ${animationClasses} 
                mb-3 pointer-events-auto
            `}
        >
            <div className="flex items-start">
                {icon}
                <p className="ml-3 text-sm font-medium text-gray-100">{message}</p>
            </div>
            
            <button 
                onClick={handleClose}
                className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-100 transition duration-150"
                aria-label="Закрыть уведомление"
            >
                <FaTimes className="text-sm" />
            </button>
        </div>
    );
});


// --- Главный контейнер для всех тостов ---
const ToastContainer = () => {
    // Получаем массив тостов из Redux
    const { toasts } = useSelector(state => state.notifications);

    return (
        <div className="fixed top-4 right-4 z-[1000] space-y-3 pointer-events-none flex flex-col items-end">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id} 
                    {...toast} 
                />
            ))}
        </div>
    );
};

export default ToastContainer;