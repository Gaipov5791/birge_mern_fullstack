import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { deleteComment, updateComment } from '../../redux/features/comments/commentThunks';
import CommentItem from '../CommentItem';
import ConfirmationModal from '../common/ConfirmationModal';
import CommentEditModal from '../common/CommentEditModal';
import LoadingModal from '../common/LoadingModal';
import { toastSuccess, toastError } from '../../redux/features/notifications/notificationSlice';

function CommentActions({ comments, currentUserId, commentsEndRef }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { 
        isCommentOperationLoading,
        loadingMessage,
        newlyCreatedCommentId
    } = useSelector((state) => state.comments);

    const [confirmDeleteState, setConfirmDeleteState] = useState({
        isOpen: false,
        commentId: null,
    });
    
    const [editCommentState, setEditCommentState] = useState({
        isOpen: false,
        comment: null,
    });

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
                .then(() => dispatch(toastSuccess(t('comment.deleted'))))
                .catch((error) => dispatch(toastError(t('comment.deleteError', { error: error.payload || error.message }))));
        }
    }, [dispatch, confirmDeleteState, t]);

    const handleEditStart = useCallback((comment) => {
        setEditCommentState({ isOpen: true, comment });
    }, []);

    const handleEditClose = useCallback(() => {
        setEditCommentState({ isOpen: false, comment: null });
    }, []);

    const handleUpdateComment = useCallback(async (newText) => {
        const commentToUpdate = editCommentState.comment;
        
        if (!commentToUpdate || !newText.trim()) {
            dispatch(toastError(t('comment.invalidUpdate')));
            return;
        }

        try {
            await dispatch(updateComment({ commentId: commentToUpdate._id, text: newText })).unwrap();
            dispatch(toastSuccess(t('comment.updated')));
            setEditCommentState({ isOpen: false, comment: null }); 
        } catch (error) {
            const errorMessage = error.payload?.message || error.message || t('comment.genericError');
            dispatch(toastError(t('comment.updateFailed', { error: errorMessage })));
        }
    }, [editCommentState.comment, dispatch, t]);


    return (
        <>
            {comments && comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment._id}
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
                <p className="text-gray-600 text-center">{t('comment.none')}</p>
            )}

            <LoadingModal 
                isOpen={isCommentOperationLoading && !editCommentState.isOpen}
                message={loadingMessage || t('common.loading')}
            />

            <ConfirmationModal
                isOpen={confirmDeleteState.isOpen}
                onClose={handleDeleteConfirmClose}
                onConfirm={handleDeleteConfirm}
                title={t('comment.deleteTitle')}
                message={t('comment.deleteMessage')}
            />

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
