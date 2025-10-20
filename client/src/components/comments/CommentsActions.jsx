import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteComment, updateComment } from '../../redux/features/comments/commentThunks';
import CommentItem from '../CommentItem';
import ConfirmationModal from '../chat/ConfirmationModal';
import CommentEditModal from '../common/CommentEditModal';
import LoadingModal from '../common/LoadingModal';
import { toastSuccess, toastError } from '../../redux/features/notifications/notificationSlice';

function CommentActions({ comments, currentUserId, commentsEndRef }) {
    const dispatch = useDispatch();

    const { 
        isCommentOperationLoading,
        loadingMessage,
        newlyCreatedCommentId // Нужен для логики Ref
    } = useSelector((state) => state.comments);

    // ⭐ СОСТОЯНИЕ ДЛЯ МОДАЛЬНОГО ОКНА УДАЛЕНИЯ
    const [confirmDeleteState, setConfirmDeleteState] = useState({
        isOpen: false,
        commentId: null,
    });
    
    // ⭐ СОСТОЯНИЕ ДЛЯ МОДАЛЬНОГО ОКНА РЕДАКТИРОВАНИЯ
    const [editCommentState, setEditCommentState] = useState({
        isOpen: false,
        comment: null, // Храним весь объект комментария
    });

    // --- ХЕНДЛЕРЫ УДАЛЕНИЯ ---
    const handleDeleteConfirmStart = useCallback((commentId) => {
        setConfirmDeleteState({ isOpen: true, commentId: commentId });
    }, []);

    const handleDeleteConfirmClose = useCallback(() => {
        setConfirmDeleteState({ isOpen: false, commentId: null });
    }, []);
    
    const handleDeleteConfirm = useCallback(() => {
        const { commentId } = confirmDeleteState;
        
        setConfirmDeleteState({ isOpen: false, commentId: null });
        
        if (commentId) {
            dispatch(deleteComment(commentId))
                .unwrap()
                .then(() => dispatch(toastSuccess('Комментарий успешно удален!')))
                .catch((error) => dispatch(toastError(`Ошибка при удалении: ${error.payload || error.message}`)));
        }
    }, [dispatch, confirmDeleteState]);

    // --- ХЕНДЛЕРЫ РЕДАКТИРОВАНИЯ ---
    const handleEditStart = useCallback((comment) => {
        setEditCommentState({ isOpen: true, comment });
    }, []);

    const handleEditClose = useCallback(() => {
        setEditCommentState({ isOpen: false, comment: null });
    }, []);

    const handleUpdateComment = useCallback(async (newText) => {
        const commentToUpdate = editCommentState.comment;
        
        if (!commentToUpdate || !newText.trim()) {
            dispatch(toastError('Некорректные данные для обновления.'));
            return;
        }

        try {
            // Вызываем Thunk для обновления
            await dispatch(updateComment({ commentId: commentToUpdate._id, text: newText })).unwrap();
            dispatch(toastSuccess('Комментарий обновлен!'));
            // Закрываем модалку при успехе
            setEditCommentState({ isOpen: false, comment: null }); 
        } catch (error) {
            const errorMessage = error.payload?.message || error.message || 'Ошибка при обновлении комментария.';
            dispatch(toastError(`Ошибка: ${errorMessage}`));
            // Оставляем модалку открытой при ошибке
        }
    }, [editCommentState.comment, dispatch]);


    return (
        <>
            {comments && comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment._id}
                            // ⭐ ПРИМЕНЕНИЕ REF для скролла
                            ref={comment._id === newlyCreatedCommentId ? commentsEndRef : null} 
                        >
                            <CommentItem  
                                comment={comment} 
                                currentUserId={currentUserId}
                                onDeleteConfirmStart={handleDeleteConfirmStart}
                                onEditStart={handleEditStart}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center">Комментариев пока нет.</p>
            )}

            {/* --- МОДАЛЬНЫЕ ОКНА --- */}

            {/* Модальное окно загрузки для операций обновления/удаления */}
            <LoadingModal 
                isOpen={isCommentOperationLoading && !editCommentState.isOpen}
                message={loadingMessage || "Загрузка..."}
            />

            {/* Модальное окно подтверждения удаления */}
            <ConfirmationModal
                isOpen={confirmDeleteState.isOpen}
                onClose={handleDeleteConfirmClose}
                onConfirm={handleDeleteConfirm}
                title="Подтвердите удаление"
                message="Вы уверены, что хотите безвозвратно удалить этот комментарий?"
            />

            {/* Модальное окно редактирования комментария */}
            <CommentEditModal
                isOpen={editCommentState.isOpen}
                onClose={handleEditClose}
                onSave={handleUpdateComment}
                comment={editCommentState.comment}
            />
        </>
    );
}

export default CommentActions;