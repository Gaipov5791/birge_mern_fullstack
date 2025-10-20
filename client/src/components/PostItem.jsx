import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    updateSinglePostInState,
    setPostIdToDelete, 
    setPostIdToEdit // Оставляем, так как используется в handleEditClick
} from '../redux/features/posts/postSlice';
import { followUser, unfollowUser } from '../redux/features/auth/authThunks';
import { likePost } from '../redux/features/posts/postThunks';
import { toastSuccess, toastError, toastInfo } from '../redux/features/notifications/notificationSlice';

import PostAuthorInfo from './posts/PostAuthorInfo';
import FollowButton from './posts/FollowButton';
import PostContent from './posts/PostContent';
import PostActions from './posts/PostActions';

function PostItem({ post, variant = "compact" }) {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);

    // ⭐ НОВОЕ СОСТОЯНИЕ ДЛЯ АНИМАЦИИ
    const [isMounted, setIsMounted] = useState(false);

    // ⭐ ЭФФЕКТ ДЛЯ ЗАПУСКА АНИМАЦИИ
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);
    
    // Удалили неиспользуемый postIdToEdit

    const isLiked = post.likes?.includes(currentUser?._id);
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);

    const authorId = post.author?._id;
    const isAuthor = currentUser && post.author && post.author._id === currentUser._id;
    const isFollowingAuthor = currentUser?.following?.includes(authorId);

    // Классы остались без изменений
    const headerClasses = `flex flex-col ${variant === "compact" ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:flex-row sm:justify-between'} gap-3`;
    const followContainerClasses = `flex ${variant === "compact" ? 'items-center justify-between sm:justify-end gap-2' : 'flex-col items-end gap-1'}`;
    const dateClasses = `text-xs ${variant === "compact" ? 'text-gray-400' : 'text-gray-400'}`;

    // --- Хэндлеры ---
    
    const handleFollowToggle = useCallback(async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!currentUser) return dispatch(toastInfo('Пожалуйста, войдите, чтобы подписаться.'));

        if (isTogglingFollow) return;
        setIsTogglingFollow(true);

        try {
            if (isFollowingAuthor) {
                await dispatch(unfollowUser(authorId)).unwrap();
                dispatch(toastSuccess('Вы отписались от автора.')); // ✅ Исправлено
            } else {
                await dispatch(followUser(authorId)).unwrap();
                dispatch(toastSuccess('Вы подписались на автора.'));
            }
        } catch {
            dispatch(toastError('Ошибка при подписке/отписке.'));
        } finally {
            setIsTogglingFollow(false);
        }
    }, [currentUser, isFollowingAuthor, authorId, dispatch, isTogglingFollow]);

    const handleLike = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!currentUser) {
            dispatch(toastInfo('Войдите, чтобы поставить лайк.'));
            return;
        }

        // Оптимистичное обновление: сразу обновляем UI
        const newLikes = isLiked
            ? post.likes.filter(id => id !== currentUser._id)
            : [...(post.likes || []), currentUser._id];

        dispatch(updateSinglePostInState({
            ...post,
            likes: newLikes,
        }));

        // Отправляем асинхронный запрос на сервер
        dispatch(likePost(post._id)).then((result) => {
            if (result.meta.requestStatus === 'rejected') {
                dispatch(toastError(result.payload || 'Не удалось обновить лайк.'));
                dispatch(updateSinglePostInState(post)); 
            }
        });
    }, [currentUser, dispatch, post, isLiked]);

    // ⭐ ХЕНДЛЕР УДАЛЕНИЯ: Только диспатч в Redux
    const handleDeleteConfirmStart = useCallback(() => {
        if (!currentUser) return dispatch(toastInfo('Войдите, чтобы удалить пост.'));
        dispatch(setPostIdToDelete(post._id));
    }, [currentUser, dispatch, post._id]);

    // ⭐ ХЕНДЛЕР РЕДАКТИРОВАНИЯ: Только диспатч в Redux
    const handleEditClick = useCallback(() => {
        if (!currentUser) return dispatch(toastInfo('Войдите, чтобы редактировать.'));
        dispatch(setPostIdToEdit(post._id));
    }, [currentUser, dispatch, post._id]);


    // --- Рендер ---
    return (
        <div 
            className={`
                bg-neutral-800 rounded-xl shadow-xl shadow-neutral-900/50 
                p-4 sm:p-6 mb-4 border border-neutral-700 hover:border-blue-600 
                transform transition-all duration-700 ease-out max-w-full overflow-hidden
                ${isMounted 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-4 scale-95'}
                
            `}
        >
            
            {/* Шапка */}
            <div className={headerClasses}>
                <PostAuthorInfo author={post.author} />
                <div className={followContainerClasses}>
                    <FollowButton
                        authorId={post.author?._id}
                        currentUser={currentUser}
                        isAuthor={post.author?._id === currentUser?._id}
                        isFollowingAuthor={isFollowingAuthor} 
                        isTogglingFollow={isTogglingFollow}
                        onToggleFollow={handleFollowToggle}
                    />
                    <p className={dateClasses}>
                        {new Date(post.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Контент */}
            <PostContent
                post={post}
            />

            {/* Действия */}
            <div className="mt-4 pt-4 border-t border-neutral-700">
                <PostActions
                    post={post}
                    currentUser={currentUser}
                    isAuthor={isAuthor}
                    onLike={handleLike}
                    onDelete={handleDeleteConfirmStart} 
                    onEditClick={handleEditClick}
                />
            </div>
        </div>
    );
}

export default PostItem;



