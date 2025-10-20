import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Длительность анимации должна соответствовать Tailwind duration-500
const ANIMATION_DURATION = 500;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // ⭐ НОВОЕ СОСТОЯНИЕ: для запуска анимации появления
    const [isVisible, setIsVisible] = useState(false);
    // Локальное состояние для управления фактическим монтированием/демонтированием
    const [isRendered, setIsRendered] = useState(isOpen);
    
    // Эффект для плавного появления/исчезновения
    useEffect(() => {
        if (isOpen) {
            // 1. При открытии: немедленно монтируем
            setIsRendered(true);
            // 2. Через короткий таймаут (10ms) запускаем анимацию
            setTimeout(() => {
                setIsVisible(true);
            }, 10); // Очень короткая задержка для регистрации в DOM
        } else {
            // 1. При закрытии: запускаем анимацию
            setIsVisible(false);
            // 2. После завершения анимации демонтируем компонент
            setTimeout(() => {
                setIsRendered(false);
            }, ANIMATION_DURATION);
        }
    }, [isOpen]);

    if (!isRendered) return null; // Фактический демонтаж

    // isVisible теперь управляет анимационными классами:
    const overlayClasses = isVisible ? 'opacity-100' : 'opacity-0';
    const modalClasses = isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0';

    return (
        // 1. Overlay (фон) с анимацией opacity
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 transition-opacity duration-500 ${overlayClasses}`}
            onClick={onClose}
        >
            {/* 2. Modal Content с анимацией scale/opacity */}
            <div 
                className={`bg-neutral-800 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-500 ease-in-out ${modalClasses}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-100 mb-2 border-b border-neutral-700 pb-2">
                        {title}
                    </h2>
                    <p className="text-gray-300 mb-6">{message}</p>
                </div>
                
                {/* Адаптивные кнопки для мобильной версии (flex-col на мобильных, flex-row на sm и выше) */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 bg-neutral-900 border-t border-neutral-700 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition duration-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

export default ConfirmationModal;