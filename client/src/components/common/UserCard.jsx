// /components/common/UserCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

// Этот компонент должен быть универсальным, принимая props для настройки
// внешнего вида (мини-версия или полная) и действий.

const UserCard = ({ 
    user = {}, 
    size = 'small', // 'small' (сайдбар) или 'large' (страница)
    onToggleFollow, 
    isActionLoading 
}) => {

    // ⭐ КРИТИЧЕСКАЯ ПРОВЕРКА: Если user пустой (или null/undefined), выходим
    if (!user || !user._id) { 
        // Это предотвратит ошибку, если в списке есть null или пустой объект
        return null;
    }

    // 1. Определение стилей на основе размера
    const isLarge = size === 'large';
    const containerClasses = isLarge 
        ? "flex items-center justify-between p-4 border-b border-neutral-800 transition-colors hover:bg-neutral-900"
        : "flex items-center justify-between p-3 transition-colors duration-200 hover:bg-neutral-800 rounded-lg";
        
    const imageSize = isLarge ? "w-12 h-12" : "w-10 h-10";

    // 2. Логика кнопки (использует полные данные для страницы, упрощенные для сайдбара)
    const isFollowing = user.isFollowing ?? false; 
    const isUserActionLoading = isActionLoading === user._id; 
    
    // Текст и класс кнопки
    let buttonText, buttonClass;
    if (isLarge) {
        // Логика кнопки для UsersPage.jsx
        buttonText = isFollowing 
            ? (isUserActionLoading ? 'Отписка...' : 'Отписаться')
            : (isUserActionLoading ? 'Читать...' : 'Читать');
        buttonClass = isFollowing 
            ? 'bg-neutral-700 text-gray-400 border border-neutral-600 hover:bg-neutral-600' 
            : 'bg-blue-600 text-white hover:bg-blue-700';
    } else {
        // Логика кнопки для RightSidebar.jsx
        buttonText = isFollowing ? 'Подписка' : 'Читать';
        buttonClass = isFollowing 
            ? 'bg-neutral-700 text-gray-400 cursor-default' 
            : 'bg-blue-600 text-white hover:bg-blue-700';
    }
    
    const userPhoto = user?.profilePicture || "https://placehold.co/48x48/1f2937/FFFFFF?text=P";

    return (
        <div className={containerClasses}>
            <Link to={`/profile/${user._id}`} className="flex items-center space-x-4 group flex-grow min-w-0">
                <img
                    src={userPhoto}
                    alt="Профиль"
                    className={`${imageSize} rounded-full object-cover ring-2 ring-blue-500/50 flex-shrink-0`}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/1f2937/FFFFFF?text=P"; }}
                />
                
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-100 text-lg group-hover:text-blue-400 hover:underline truncate transition duration-200">
                        {user.username}
                    </span>
                    <span className="text-sm text-gray-500 truncate">@{user.username.toLowerCase()}</span>
                    
                    {/* Показываем описание только в большой версии */}
                    {isLarge && (
                         <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {user.bio || 'Пользователь не добавил описание.'}
                        </p>
                    )}
                </div>
            </Link>
            
            <button 
                onClick={isLarge ? (e) => { e.preventDefault(); onToggleFollow(user._id, isFollowing); } : undefined}
                className={`px-3 py-1 text-sm font-bold rounded-full transition-colors flex-shrink-0 flex items-center justify-center ${buttonClass}`}
                disabled={isUserActionLoading || !isLarge} // Отключаем клик в маленькой версии
            >
                {isUserActionLoading && <FaSpinner className="animate-spin mr-2" />}
                {buttonText}
            </button>
        </div>
    );
};

export default UserCard;