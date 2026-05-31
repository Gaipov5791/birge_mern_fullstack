import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    reset as resetAuthSlice,
    setUserProfile,
} from '../redux/features/auth/authSlice';
import axios from 'axios';

import { getUserPosts } from '../redux/features/posts/postThunks';
import ProfileActions from '../components/profile/ProfileActions';
import ProfileBio from '../components/profile/ProfileBio';
import ProfilePostsSection from '../components/profile/ProfilePostsSection';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { toastError, toastSuccess } from '../redux/features/notifications/notificationSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfilePage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: currentUser, userProfile } = useSelector((state) => state.auth);

    const targetUserId = id || currentUser?._id;

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const [editedBio, setEditedBio] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const {
        userPosts,
        isLoading: userPostsLoading,
        isError: userPostsError,
        message: userPostsMessage,
    } = useSelector((state) => state.posts);

    const handleSaveProfile = useCallback(async () => {
        if (!editedBio.trim()) {
            dispatch(toastError(t('profile.bioRequired')));
            return;
        }

        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch(toastError(t('profile.notAuthorized')));
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios.put(`${API_BASE_URL}/users/profile`, { bio: editedBio }, config);

            dispatch(setUserProfile(response.data.user));
            dispatch(toastSuccess(t('profile.updated')));
        } catch (error) {
            console.error('Ошибка при сохранении профиля:', error);
            const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            dispatch(toastError(t('profile.saveError', { error: errorMessage })));
        } finally {
            setIsSavingProfile(false);
        }
    }, [editedBio, dispatch, t]);

    const handleCancelEdit = useCallback(() => {
        setEditedBio(userProfile.bio || '');
    }, [userProfile]);

    useEffect(() => {
        const fetchUserProfileAndPosts = async () => {
            if (targetUserId) {
                setProfileLoading(true);
                setProfileError(null);

                const token = localStorage.getItem('token');
                const config = token ? {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } : {};

                try {
                    const profileResponse = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, config);
                    dispatch(setUserProfile(profileResponse.data.user));
                    setEditedBio(profileResponse.data.user.bio || '');

                    await dispatch(getUserPosts(targetUserId)).unwrap();

                } catch (error) {
                    console.error('Ошибка при загрузке данных профиля/постов:', error);
                    const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();

                    setProfileError(errorMessage);

                    dispatch(setUserProfile(null));
                    if (errorMessage.includes("Пользователь не найден")) {
                        dispatch(toastError(t('profile.notFound')));
                        navigate('/');
                    } else {
                        dispatch(toastError(t('profile.loadError', { error: errorMessage })));
                    }
                } finally {
                    setProfileLoading(false);
                }
            } else {
                setProfileLoading(false);
                dispatch(toastError(t('profile.loginRequired')));
                navigate('/login');
            }
        };

        fetchUserProfileAndPosts();

        return () => {
            dispatch(setUserProfile(null));
            dispatch(resetAuthSlice());
        };
    }, [targetUserId, dispatch, navigate, t]);

    const isCurrentUserProfile = currentUser && String(currentUser._id) === String(userProfile?._id);

    if (profileLoading) {
        return (
            <ProfileSkeleton />
        );
    }

    if (profileError || !userProfile) {
        return <h2 className="text-center text-xl mt-10 text-red-400">{t('common.error')}: {profileError || t('profile.notFound')}</h2>;
    }

    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 mt-8 max-w-2xl min-h-screen">
                <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 block">
                    {t('post.backToFeed')}
                </Link>

                <ProfileActions
                    userProfile={userProfile}
                    currentUser={currentUser}
                />

                <ProfileBio
                    userProfile={userProfile}
                    isCurrentUserProfile={isCurrentUserProfile}
                    editedBio={editedBio}
                    setEditedBio={setEditedBio}
                    isSavingProfile={isSavingProfile}
                    handleSaveProfile={handleSaveProfile}
                    handleCancelEdit={handleCancelEdit}
                />

                <ProfilePostsSection
                    userProfile={userProfile}
                    userPosts={userPosts}
                    userPostsLoading={userPostsLoading}
                    userPostsError={userPostsError || (userPostsMessage && !userPosts.length ? userPostsMessage : null)}
                />
            </div>
        </div>
    );
}

export default ProfilePage;
