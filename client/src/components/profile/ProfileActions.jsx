import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify'; 
import axios from 'axios';
import { setUserProfile } from '../../redux/features/auth/authSlice';
import { updatePostAuthorFollowData } from '../../redux/features/posts/postSlice';
import ProfileHeader from '../../components/profile/ProfileHeader'; // Импортируем ProfileHeader

// Получаем базовый URL API из переменной окружения
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfileActions({ userProfile, currentUser }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null); 

    // ⭐ 1. СОСТОЯНИЯ ДЛЯ ПОДПИСКИ/ОТПИСКИ
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);

    // ⭐ 2. СОСТОЯНИЯ ДЛЯ ФОТОГРАФИИ ПРОФИЛЯ
    const [selectedImageFile, setSelectedImageFile] = useState(null); 
    // Инициализация превью URL текущей фотографией профиля
    const [imagePreviewUrl, setImagePreviewUrl] = useState(userProfile?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
    const [isUploadingImage, setIsUploadingImage] = useState(false); 
    
    // Проверка, является ли текущий профиль профилем залогиненного пользователя
    const isCurrentUserProfile = currentUser && String(currentUser._id) === String(userProfile?._id);

    // --- ФУНКЦИОНАЛ ПОДПИСКИ/ОТПИСКИ ---
    const handleToggleFollow = useCallback(async () => {
        if (!currentUser || !userProfile) {
            toast.warn(t('profile.loginFirst'));
            return;
        }
        
        setIsTogglingFollow(true);
        const isFollowing = userProfile.followers.includes(currentUser._id);
        const action = isFollowing ? t('profile.followUnsubscribe') : t('profile.followSubscribe');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const url = isFollowing
                ? `${API_BASE_URL}/users/unfollow/${userProfile._id}`
                : `${API_BASE_URL}/users/follow/${userProfile._id}`;

            const response = await axios.put(url, {}, config);
            const updatedAuthor = isFollowing
                ? response.data.userToUnfollow
                : response.data.userToFollow;

            dispatch(setUserProfile(updatedAuthor));
            dispatch(updatePostAuthorFollowData({
                userId: userProfile._id,
                followers: updatedAuthor.followers,
                following: updatedAuthor.following,
            }));

            toast.success(t('profile.followSuccess', { action }));

        } catch (error) {
            console.error(`Follow error:`, error);
            const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(`${t('common.error')}: ${errorMessage}`);
        } finally {
            setIsTogglingFollow(false);
        }
    }, [currentUser, userProfile, dispatch, t]);
    
    // --- ФУНКЦИОНАЛ ЗАГРУЗКИ ФОТО ---

    // Функция для отмены выбора изображения
    const handleCancelImageChange = useCallback(() => {
        setSelectedImageFile(null);
        // Сброс превью на текущую фотографию из userProfile
        setImagePreviewUrl(userProfile?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
        if (fileInputRef.current) fileInputRef.current.value = ''; 
    }, [userProfile]); 

    // Обработчик выбора файла
    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedImageFile(null);
            setImagePreviewUrl(userProfile?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
        }
    }, [userProfile]);

    // Обработчик для загрузки изображения на сервер
    const handleImageUpload = useCallback(async () => {
        if (!selectedImageFile) {
            toast.warn(t('profile.selectFile')); 
            return;
        }

        setIsUploadingImage(true); 
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error(t('profile.notAuthorizedUpload')); 
                return;
            }

            const formData = new FormData();
            formData.append('profilePicture', selectedImageFile); 

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', 
                },
            };
            
            const response = await axios.put(`${API_BASE_URL}/users/upload-profile-picture/${currentUser._id}`, formData, config);
            
            dispatch(setUserProfile(response.data.user)); 
            setSelectedImageFile(null); 
            toast.success(t('profile.photoUpdated'));

        } catch (error) {
            console.error('Profile photo upload error:', error);
            const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(t('profile.uploadError', { error: errorMessage })); 
            // При ошибке возвращаем превью к старому изображению
            setImagePreviewUrl(userProfile?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
        } finally {
            setIsUploadingImage(false); 
        }
    }, [selectedImageFile, currentUser, dispatch, userProfile, t]);

    // Обновляем imagePreviewUrl при изменении userProfile (после успешного сохранения)
    // чтобы ProfileHeader показывал актуальное фото
    useEffect(() => {
        if (userProfile?.profilePicture) {
            setImagePreviewUrl(userProfile.profilePicture);
        }
    }, [userProfile?.profilePicture]);


    return (
        <ProfileHeader
            userProfile={userProfile}
            isCurrentUserProfile={isCurrentUserProfile}
            imagePreviewUrl={imagePreviewUrl}
            selectedImageFile={selectedImageFile}
            isUploadingImage={isUploadingImage}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleImageUpload={handleImageUpload}
            handleCancelImageChange={handleCancelImageChange}
            
            // Пропсы для FollowButton
            currentUser={currentUser} 
            isTogglingFollow={isTogglingFollow} 
            onToggleFollow={handleToggleFollow} 
        />
    );
}

export default ProfileActions;