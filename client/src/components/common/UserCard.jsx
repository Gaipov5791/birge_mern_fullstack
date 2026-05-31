import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const UserCard = ({ 
    user = {}, 
    size = 'small',
    onToggleFollow, 
    isActionLoading 
}) => {
    const { t } = useTranslation();

    if (!user || !user._id) { 
        return null;
    }

    const isLarge = size === 'large';
    const containerClasses = isLarge 
        ? "flex items-center justify-between p-4 border-b border-neutral-800 transition-colors hover:bg-neutral-900"
        : "flex items-center justify-between p-3 transition-colors duration-200 hover:bg-neutral-800 rounded-lg";
        
    const imageSize = isLarge ? "w-12 h-12" : "w-10 h-10";

    const isFollowing = user.isFollowing ?? false; 
    const isUserActionLoading = isActionLoading === user._id; 
    
    let buttonText, buttonClass;
    if (isLarge) {
        buttonText = isFollowing 
            ? (isUserActionLoading ? t('users.unsubscribing') : t('users.unsubscribe'))
            : (isUserActionLoading ? t('users.following') : t('users.follow'));
        buttonClass = isFollowing 
            ? 'bg-neutral-700 text-gray-400 border border-neutral-600 hover:bg-neutral-600' 
            : 'bg-blue-600 text-white hover:bg-blue-700';
    } else {
        buttonText = isFollowing ? t('users.subscribe') : t('users.follow');
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
                    alt={t('common.profile')}
                    className={`${imageSize} rounded-full object-cover ring-2 ring-blue-500/50 flex-shrink-0`}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/1f2937/FFFFFF?text=P"; }}
                />
                
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-100 text-lg group-hover:text-blue-400 hover:underline truncate transition duration-200">
                        {user.username}
                    </span>
                    <span className="text-sm text-gray-500 truncate">@{user.username.toLowerCase()}</span>
                    
                    {isLarge && (
                         <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {user.bio || t('users.noBio')}
                        </p>
                    )}
                </div>
            </Link>
            
            <button 
                onClick={isLarge ? (e) => { e.preventDefault(); onToggleFollow(user._id, isFollowing); } : undefined}
                className={`px-3 py-1 text-sm font-bold rounded-full transition-colors flex-shrink-0 flex items-center justify-center ${buttonClass}`}
                disabled={isUserActionLoading || !isLarge}
            >
                {isUserActionLoading && <FaSpinner className="animate-spin mr-2" />}
                {buttonText}
            </button>
        </div>
    );
};

export default UserCard;
