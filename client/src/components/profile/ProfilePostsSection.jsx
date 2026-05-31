import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PostItem from '../PostItem'; 
import ConfirmationModal from '../common/ConfirmationModal';
import PostEditModal from '../common/PostEditModal'; // Предполагаемый путь
import LoadingModal from '../common/LoadingModal';
import { deletePost, updatePost } from '../../redux/features/posts/postThunks'; // Thunks для постов
import { setPostIdToDelete, setPostIdToEdit } from '../../redux/features/posts/postSlice'; // Действия для управления состоянием
import { toastSuccess, toastError } from '../../redux/features/notifications/notificationSlice';
import { FaSpinner } from 'react-icons/fa'; // Для спиннера в модалке

// Принимаем userPosts в качестве пропса, но нам нужен current user ID для проверки прав
function ProfilePostsSection({ userProfile, userPosts, userPostsLoading, userPostsError }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);

    // ⭐ ИСПОЛЬЗУЕМ REDUX-СОСТОЯНИЯ ВМЕСТО ЛОКАЛЬНЫХ!
    const { isPostOperationLoading, postIdToDelete, postIdToEdit } = useSelector((state) => state.posts);

    // ⭐ ИСПРАВЛЕНИЕ: Находим объект поста для редактирования ИЗ ПРОПСОВ userPosts
    // Это гарантирует, что пост действительно отображается в этом разделе.
    const postToEdit = userPosts?.find(p => p._id === postIdToEdit);

    // --- ЛОГИКА УДАЛЕНИЯ ПОСТА ---

    // 2. Закрытие модального окна
    const handleDeleteConfirmClose = useCallback(() => {
        dispatch(setPostIdToDelete(null)); // ⭐ Сброс ID в Redux
    }, [dispatch]);

    // 3. Выполнение удаления
    const handleDeleteConfirm = useCallback(() => {
        const postId = postIdToDelete;
        
        handleDeleteConfirmClose(); // Закрываем модалку перед запросом
        
        if (postId) {
            dispatch(deletePost(postId))
                .unwrap()
                .then(() => dispatch(toastSuccess(t('dashboard.postDeleted'))))
                .catch((error) => dispatch(toastError(t('dashboard.deleteError', { error: error.payload || error.message }))));
        }
    }, [dispatch, postIdToDelete, handleDeleteConfirmClose, t]);


    // --- ЛОГИКА РЕДАКТИРОВАНИЯ ПОСТА ---

    // 2. ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
    const handleEditClose = useCallback(() => {
        dispatch(setPostIdToEdit(null)); // ⭐ Сброс ID в Redux
    }, [dispatch]);

    // 3. СОХРАНЕНИЕ ИЗМЕНЕНИЙ (Вызывается из PostEditModal)
    const handleUpdatePost = useCallback(async (updateData) => {
        // postToEdit теперь берется из области видимости компонента (найден по userPosts)

        
        if (!postToEdit) {
            dispatch(toastError(t('profile.postNotFoundForUpdate')));
            return;
        }
        
        if (!updateData.text?.trim()) {
            dispatch(toastError(t('profile.textRequired')));
            return;
        }

        try {
            await dispatch(updatePost({ 
                postId: postToEdit._id,
                updateData: updateData 
            })).unwrap();
            
            dispatch(toastSuccess(t('post.updated')));
            handleEditClose(); 
        } catch (error) {
            const errorMessage = error.payload?.message || error.message || t('comment.genericError');
            dispatch(toastError(t('post.updateFailed', { error: errorMessage })));
        }
    }, [dispatch, postToEdit, handleEditClose, t]);


    return (
        <div className="bg-neutral-950 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-400 mb-4 text-center">
                {t('profile.postsOf', { username: userProfile.username })}
            </h2>

            {userPostsLoading ? (
                <p className="text-center text-lg text-blue-400">
                    <FaSpinner className='animate-spin inline mr-2' /> {t('profile.loadingPosts')}
                </p>
            ) : userPostsError ? (
                <p className="text-center text-red-500 text-lg">{t('profile.postsLoadError', { error: userPostsError })}</p>
            ) : Array.isArray(userPosts) && userPosts.length === 0 ? (
                <p className="text-center text-lg text-gray-600">{t('profile.noPosts')}</p>
            ) : (
                <div className="space-y-6">
                    {Array.isArray(userPosts) && userPosts.map((post) => (
                        <PostItem 
                            key={post._id} 
                            post={post} 
                            currentUserId={currentUser?._id} // Передаем ID для проверки прав
                        />
                    ))}
                </div>
            )}

            {/* ⭐ МОДАЛЬНЫЕ ОКНА */}
            <ConfirmationModal
                isOpen={!!postIdToDelete}
                onClose={handleDeleteConfirmClose}
                onConfirm={handleDeleteConfirm}
                title={t('dashboard.deletePostTitle')}
                message={t('dashboard.deletePostMessage')}
            />

            <PostEditModal
                isOpen={!!postIdToEdit}
                onClose={handleEditClose}
                onSave={handleUpdatePost}
                post={postToEdit}
                isSaving={isPostOperationLoading}
            />

            <LoadingModal
                isOpen={isPostOperationLoading}
                message={t('profile.updatingPost')}
            />
        </div>
    );
}

// Заменяем оригинальный экспорт
export default ProfilePostsSection;