import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostItem from '../PostItem'; 
import ConfirmationModal from '../chat/ConfirmationModal'; // Предполагаемый путь
import PostEditModal from '../common/PostEditModal'; // Предполагаемый путь
import LoadingModal from '../common/LoadingModal';
import { deletePost, updatePost } from '../../redux/features/posts/postThunks'; // Thunks для постов
import { setPostIdToDelete, setPostIdToEdit } from '../../redux/features/posts/postSlice'; // Действия для управления состоянием
import { toastSuccess, toastError } from '../../redux/features/notifications/notificationSlice';
import { FaSpinner } from 'react-icons/fa'; // Для спиннера в модалке

// Принимаем userPosts в качестве пропса, но нам нужен current user ID для проверки прав
function ProfilePostsSection({ userProfile, userPosts, userPostsLoading, userPostsError }) {
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
                .then(() => dispatch(toastSuccess('Пост успешно удален!')))
                .catch((error) => dispatch(toastError(`Ошибка при удалении: ${error.payload || error.message}`)));
        }
    }, [dispatch, postIdToDelete, handleDeleteConfirmClose]);


    // --- ЛОГИКА РЕДАКТИРОВАНИЯ ПОСТА ---

    // 2. ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
    const handleEditClose = useCallback(() => {
        dispatch(setPostIdToEdit(null)); // ⭐ Сброс ID в Redux
    }, [dispatch]);

    // 3. СОХРАНЕНИЕ ИЗМЕНЕНИЙ (Вызывается из PostEditModal)
    const handleUpdatePost = useCallback(async (updateData) => {
        // postToEdit теперь берется из области видимости компонента (найден по userPosts)

        
        if (!postToEdit) {
            dispatch(toastError('Невозможно найти пост для обновления.'));
            return;
        }
        
        if (!updateData.text?.trim()) {
            dispatch(toastError('Поле "Текст" не может быть пустым.'));
            return;
        }

        try {
            await dispatch(updatePost({ 
                postId: postToEdit._id, // ✅ ID теперь гарантированно существует
                updateData: updateData 
            })).unwrap();
            
            dispatch(toastSuccess('Пост успешно обновлен!'));
            handleEditClose(); 
        } catch (error) {
            const errorMessage = error.payload?.message || error.message || 'Ошибка при обновлении поста.';
            dispatch(toastError(`Ошибка: ${errorMessage}`));
        }
    }, [dispatch, postToEdit, handleEditClose]); // ⭐ Добавляем postToEdit в зависимости useCallback


    return (
        <div className="bg-neutral-950 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-400 mb-4 text-center">
                Посты {userProfile.username}
            </h2>

            {userPostsLoading ? (
                <p className="text-center text-lg text-blue-400">
                    <FaSpinner className='animate-spin inline mr-2' /> Загрузка постов...
                </p>
            ) : userPostsError ? (
                <p className="text-center text-red-500 text-lg">Ошибка при загрузке постов: {userPostsError}</p>
            ) : Array.isArray(userPosts) && userPosts.length === 0 ? (
                <p className="text-center text-lg text-gray-600">У пользователя пока нет постов.</p>
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
                title="Подтвердите удаление поста"
                message="Вы уверены, что хотите безвозвратно удалить этот пост? Это действие нельзя отменить."
            />

            <PostEditModal
                isOpen={!!postIdToEdit}
                onClose={handleEditClose}
                onSave={handleUpdatePost}
                post={postToEdit} // Находим пост по ID
                isSaving={isPostOperationLoading} // Передаем состояние загрузки в модалку
            />

            <LoadingModal
                isOpen={isPostOperationLoading}
                message="Обновление поста..."
            />
        </div>
    );
}

// Заменяем оригинальный экспорт
export default ProfilePostsSection;