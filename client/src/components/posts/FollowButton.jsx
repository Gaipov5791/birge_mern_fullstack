import React from 'react';
import { FaSpinner, FaUserPlus, FaUserMinus } from 'react-icons/fa'; // ⭐ Добавлены иконки

function FollowButton({
    authorId,
    currentUser,
    isAuthor,
    isFollowingAuthor,
    isTogglingFollow,
    onToggleFollow
}) {
    // Если пользователь не вошел в систему ИЛИ автор поста - не показываем кнопку
    if (!currentUser || isAuthor) {
        return null;
    }

    const buttonText = isFollowingAuthor ? 'Отписаться' : 'Подписаться';
    
    // ⭐ Динамические стили для тёмной темы
    const baseClasses = `
        ml-3
        px-3 sm:px-4 
        py-1.5 
        rounded-full 
        font-semibold
        text-xs sm:text-sm 
        transition-all 
        duration-300 
        flex 
        items-center 
        justify-center
        min-w-[110px]
        shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-[1.03] active:scale-[0.98]
    `;

    const followingClasses = `
        bg-neutral-600 
        text-gray-200 
        hover:bg-neutral-500 
        hover:text-gray-100
        shadow-neutral-700/50
    `; // Для "Отписаться" - нейтральный тёмный

    const unfollowingClasses = `
        bg-blue-600 
        text-white 
        hover:bg-blue-700
        shadow-blue-600/50
    `; // Для "Подписаться" - яркий синий акцент

    const dynamicClasses = isFollowingAuthor ? followingClasses : unfollowingClasses;

    return (
        <button
            onClick={onToggleFollow}
            disabled={isTogglingFollow}
            className={`${baseClasses} ${dynamicClasses}`}
        >
            {isTogglingFollow ? (
                // Спиннер
                <FaSpinner className="animate-spin text-lg" />
            ) : (
                // Текст и иконка
                <span className="flex items-center gap-2 whitespace-nowrap">
                    {isFollowingAuthor ? (
                        <FaUserMinus className="text-base" />
                    ) : (
                        <FaUserPlus className="text-base" />
                    )}
                    {buttonText}
                </span>
            )}
        </button>
    );
}

export default FollowButton;