import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { BsChatDots } from 'react-icons/bs';
import { 
    reset as resetAuthSlice,
    setUserProfile,
} from '../redux/features/auth/authSlice';
import { clearNotificationForSender, setActiveChat } from '../redux/features/chat/chatSlice';
import axios from 'axios';

import { getUserPosts } from '../redux/features/posts/postThunks';
import { markMessagesAsRead, activateChat } from '../redux/features/chat/chatThunks';

// Обновленный импорт: ProfileActions вместо ProfileHeader
import ProfileActions from '../components/profile/ProfileActions'; // ⭐ НОВЫЙ ИМПОРТ
import ProfileBio from '../components/profile/ProfileBio';
import ProfilePostsSection from '../components/profile/ProfilePostsSection';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { toastError, toastSuccess } from '../redux/features/notifications/notificationSlice';

// Получаем базовый URL API из переменной окружения
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProfilePage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ⭐ НОВОЕ ОПРЕДЕЛЕНИЕ ID ПРОФИЛЯ:
    const targetUserId = id || currentUser?._id; 

    const { user: currentUser, userProfile } = useSelector((state) => state.auth);
    
    // Оставлены только состояния, связанные с загрузкой профиля и постами, и редактированием BIO
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const [editedBio, setEditedBio] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    // ⭐ 2. ИЗВЛЕКАЕМ ПОСТЫ ИЗ ГЛОБАЛЬНОГО REDUX-СТЕЙТА (postSlice)
    // Эти поля теперь будут автоматически обновляться после успешного update/delete!
    const { 
        userPosts, 
        isLoading: userPostsLoading, // Переименуем isLoading, чтобы избежать конфликта с profileLoading
        isError: userPostsError, // Упрощенный вариант, если postSlice хранит ошибки
        message: userPostsMessage
    } = useSelector((state) => state.posts);

    // Обработчик перехода в чат
    const handleGoToChat = useCallback(() => {
        if (id) {
            // Вызываем КОРРЕКТНО импортированное Thunk-действие
            dispatch(activateChat(id)).then(() => { 
                
                // 2. Дополнительно диспетчим обычный редьюсер для Redux-состояния
                dispatch(setActiveChat(id)); 

                // 3. Навигируем
                navigate(`/chat/${id}`);
            }).catch(error => {
                // Важно обрабатывать ошибку Thunk-а
                console.error("Ошибка активации чата:", error);
                // Если Thunk падает, навигация не произойдет, это правильно.
                // Можно добавить toast: toast.error('Не удалось начать чат.');
            });
        } else {
            // Добавьте обработку случая, когда ID не найден (хотя params.id должен быть)
            dispatch(toastError('Невозможно перейти в чат: ID пользователя не найден.')); 
        }
    }, [id, navigate, dispatch]);
    
    // ⭐ ОСТАВЛЕН: handleSaveProfile (для био)
    const handleSaveProfile = useCallback(async () => {
        if (!editedBio.trim()) {
            dispatch(toastError('Пожалуйста, введите текст био.')); 
            return;
        }

        setIsSavingProfile(true); 
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch(toastError('Вы не авторизованы для сохранения профиля.')); 
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
            dispatch(toastSuccess('Профиль успешно обновлен!')); 
        } catch (error) {
            console.error('Ошибка при сохранении профиля:', error);
            const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            dispatch(toastError(`Ошибка при сохранении профиля: ${errorMessage}`)); 
        } finally {
            setIsSavingProfile(false); 
        }
    }, [editedBio, dispatch]);

    // ⭐ ОСТАВЛЕН: handleCancelEdit (для био)
    const handleCancelEdit = useCallback(() => {
        setEditedBio(userProfile.bio || ''); 
    }, [userProfile]);

    useEffect(() => {
        const fetchUserProfileAndPosts = async () => { 
            // ... (логика загрузки профиля и постов осталась без изменений)
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
                        dispatch(toastError('Профиль не найден.')); 
                        navigate('/'); 
                    } else {
                        dispatch(toastError(`Ошибка при загрузке профиля: ${errorMessage}`)); 
                    }
                } finally {
                    setProfileLoading(false); 
                }
            } else {
                // Это сработает, если пользователь НЕ залогинен и идет на /profile
                setProfileLoading(false); 
                dispatch(toastError('Для просмотра собственного профиля необходимо войти.'));
                navigate('/login'); // Перенаправляем на страницу входа
            
            }
        };

        fetchUserProfileAndPosts();

        return () => {
            // Очистка при размонтировании
            dispatch(setUserProfile(null)); 
            dispatch(resetAuthSlice());  
        };
    }, [targetUserId, dispatch, navigate]); 

    // Проверка, является ли текущий профиль профилем залогиненного пользователя
    const isCurrentUserProfile = currentUser && String(currentUser._id) === String(userProfile?._id);

    // --- УСЛОВНЫЙ РЕНДЕРИНГ ---
    if (profileLoading) {
        return (
            <ProfileSkeleton />
        );
    }

    if (profileError || !userProfile) {
        return <h2 className="text-center text-xl mt-10 text-red-400">Ошибка: {profileError || "Профиль не найден."}</h2>;
    }

    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 max-w-4xl min-h-screen"> 
                
                {/* ⭐ ИСПОЛЬЗУЕМ ProfileActions ВМЕСТО ProfileHeader */}
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
                
                {/* КНОПКА ПЕРЕЙТИ В ЧАТ (оставлена в родительском компоненте) */}
                {!isCurrentUserProfile && (
                    <button
                        onClick={handleGoToChat}
                        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-500/50 hover:bg-blue-500 transition-all z-50 transform hover:scale-110 active:scale-95"
                        title="Написать сообщение"
                    >
                        <BsChatDots className="text-3xl" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;