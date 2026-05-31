import React from 'react';
import { FaSpinner, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function FollowButton({
    authorId,
    currentUser,
    isAuthor,
    isFollowingAuthor,
    isTogglingFollow,
    onToggleFollow
}) {
    const { t } = useTranslation();

    if (!currentUser || isAuthor) {
        return null;
    }

    const buttonText = isFollowingAuthor ? t('post.unsubscribe') : t('post.subscribe');
    
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
    `;

    const unfollowingClasses = `
        bg-blue-600 
        text-white 
        hover:bg-blue-700
        shadow-blue-600/50
    `;

    const dynamicClasses = isFollowingAuthor ? followingClasses : unfollowingClasses;

    return (
        <button
            onClick={onToggleFollow}
            disabled={isTogglingFollow}
            className={`${baseClasses} ${dynamicClasses}`}
        >
            {isTogglingFollow ? (
                <FaSpinner className="animate-spin text-lg" />
            ) : (
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
