import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaHeart, FaComment } from 'react-icons/fa';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '../utils/dateLocale';

function ActivityNotificationPanel({ isOpen, onClose, notifications, isLoading, panelRef, buttonRef }) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef?.current?.contains(event.target)) {
                return;
            }
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, panelRef, buttonRef]);

    if (!isOpen) return null;

    const getNotificationText = (notification) => {
        const username = notification.sender?.username || t('notifications.user');
        if (notification.type === 'like') {
            return t('notifications.likedPost', { username });
        }
        return t('notifications.commentedPost', { username });
    };

    const getPostLink = (notification) => {
        const postId = notification.postId?._id || notification.postId;
        return postId ? `/post/${postId}` : '/dashboard';
    };

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 z-50 overflow-hidden"
        >
            <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">{t('notifications.title')}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-200"
                    aria-label={t('common.close')}
                >
                    <FaTimes />
                </button>
            </div>

            {isLoading ? (
                <div className="p-4 text-center text-gray-400">{t('common.loading')}</div>
            ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">{t('notifications.empty')}</div>
            ) : (
                <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                        <Link
                            key={notification._id}
                            to={getPostLink(notification)}
                            onClick={onClose}
                            className="flex items-center p-3 border-b border-neutral-700 hover:bg-neutral-700 transition-colors"
                        >
                            <img
                                src={notification.sender?.profilePicture || 'https://placehold.co/40x40/1f2937/FFFFFF?text=P'}
                                alt={notification.sender?.username || t('notifications.user')}
                                className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300">
                                    {getNotificationText(notification)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNowStrict(new Date(notification.createdAt), {
                                        addSuffix: true,
                                        locale: getDateLocale(i18n.language),
                                    })}
                                </p>
                            </div>
                            {notification.type === 'like' ? (
                                <FaHeart className="text-red-400 ml-2 flex-shrink-0" />
                            ) : (
                                <FaComment className="text-blue-400 ml-2 flex-shrink-0" />
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ActivityNotificationPanel;
