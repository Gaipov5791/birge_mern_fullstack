import React, { useEffect, useCallback, useState, useRef } from 'react';
import { FaUserPlus, FaChevronLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { followUser, unfollowUser } from '../redux/features/auth/authThunks';
import { getRecommendedUsers } from '../redux/features/users/userThunks';

import UserCard from '../components/common/UserCard';


function UsersPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        recommendedUsers, 
        isRecommendedLoading, 
        isRecommendedError, 
        message 
    } = useSelector((state) => state.users);

    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        
        if (
            recommendedUsers.length === 0 && 
            !isRecommendedLoading && 
            !isRecommendedError
        ) {
        console.log("UsersPage: Запуск Thunk для получения рекомендаций.");
        dispatch(getRecommendedUsers());
        }

    }, [dispatch, recommendedUsers.length, isRecommendedLoading, isRecommendedError]);

    const handleToggleFollow = useCallback(async (userId, isFollowing) => {

        setActionLoadingId(userId);
        
        try {
            if (isFollowing) {
                await dispatch(unfollowUser(userId)).unwrap();
            } else {
                await dispatch(followUser(userId)).unwrap();
            }
        } catch (error) {
            console.error('Ошибка подписки/отписки:', error);
        } finally {
            setActionLoadingId(null);
        }
    }, [dispatch, actionLoadingId]);

    if (isRecommendedLoading && recommendedUsers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <p className="ml-4 text-gray-400">{t('users.loading')}</p>
            </div>
        );
    }

    if (isRecommendedError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
                <p className="text-red-500 text-lg mb-4">{t('users.loadError', { message })}</p>
                <button 
                    onClick={() => dispatch(getRecommendedUsers())} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                    {t('common.tryAgain')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100">
            <div className="max-w-xl mx-auto border-x border-neutral-800">
                
                <header className="sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10 p-4 border-b border-neutral-800 flex items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 mr-4 text-blue-400 hover:bg-neutral-800 rounded-full transition"
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-100 flex items-center">
                        <FaUserPlus className="mr-2 text-blue-400" /> {t('users.title')}
                    </h1>
                </header>

                <div className="users-list">
                    {recommendedUsers.length > 0 ? (
                        recommendedUsers.map((user, index) => {
                            if (!user) {
                                console.warn(`Обнаружен пустой элемент в recommendedUsers на индексе ${index}`);
                                return null;
                            }
                            
                            return (
                                <UserCard 
                                    key={user._id || index} 
                                    user={user} 
                                    onToggleFollow={handleToggleFollow}
                                    isActionLoading={actionLoadingId} 
                                    size="large"
                                />
                            );
                        })
                    ) : (
                        !isRecommendedLoading && (
                            <div className="text-center p-10 text-gray-500">
                                {t('users.empty')}
                            </div>
                        )
                    )}
                    
                    <div className="text-center p-6 text-blue-500 hover:text-blue-400 cursor-pointer">
                        {t('users.loadMore')}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
