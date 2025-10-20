import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePost } from '../../redux/features/posts/postThunks';
import { toastError, toastSuccess } from '../../redux/features/notifications/notificationSlice';
import PropTypes from 'prop-types';

const ANIMATION_DURATION = 500;

function PostEditModal({ isOpen, onClose, post }) {
    const dispatch = useDispatch();
    const { isPostOperationLoading } = useSelector(state => state.posts);
    
    // ⭐ Управление рендерингом и анимацией
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(isOpen);
    const [editedText, setEditedText] = useState('');

    // Эффект для синхронизации текста
    useEffect(() => {
        if (post && isOpen) { // Заполняем только при открытии
            setEditedText(post.text || '');
        }
    }, [post, isOpen]);

    // ⭐ ГЛАВНЫЙ ЭФФЕКТ ДЛЯ АНИМАЦИИ
    useEffect(() => {
        if (isOpen) {
            // 1. Монтируем
            setIsRendered(true);
            // 2. Запускаем анимацию
            setTimeout(() => {
                setIsVisible(true);
            }, 10);
        } else {
            // 1. Запускаем анимацию закрытия
            setIsVisible(false);
            // 2. Демонтируем после завершения анимации
            setTimeout(() => {
                setIsRendered(false);
            }, ANIMATION_DURATION);
        }
    }, [isOpen]);

    const handleSave = useCallback(async () => {
        if (!editedText.trim() || isPostOperationLoading) return;
        onClose(); // Закрывает модальное окно (устанавливает isOpen: false)
        try {
            await dispatch(updatePost({ postId: post._id, postData: { text: editedText } })).unwrap();
            dispatch(toastSuccess('Пост успешно обновлен!'));
            
        } catch (error) {
            dispatch(toastError(`Не удалось обновить пост: ${error.message || 'Произошла ошибка.'}`));
        }
    }, [editedText, post, dispatch, isPostOperationLoading, onClose]);


    if (!isRendered) return null; // Фактический демонтаж
    
    // isVisible управляет анимационными классами:
    const overlayClasses = isVisible ? 'opacity-100' : 'opacity-0';
    const modalClasses = isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0';


    return (
        // 1. Overlay (фон) с анимацией opacity
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 transition-opacity duration-500 ${overlayClasses}`}
            onClick={onClose}
        >
            {/* 2. Modal Content с анимацией scale/opacity */}
            <div 
                className={`bg-neutral-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-500 ease-in-out ${modalClasses}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-neutral-700 pb-2">
                        Редактировать пост
                    </h2>

                    <textarea
                        className="
                            w-full min-h-[150px] bg-neutral-700 
                            text-gray-100 text-sm sm:text-base border border-neutral-600 
                            rounded-lg p-3 resize-y focus:border-blue-500 
                            focus:ring-blue-500 outline-none transition duration-200
                        "
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        placeholder="Ваш обновленный текст..."
                        disabled={isPostOperationLoading}
                    />
                </div>

                {/* Адаптивные кнопки для мобильной версии */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 bg-neutral-900 border-t border-neutral-700 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition duration-200"
                        disabled={isPostOperationLoading}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg transition duration-200 ${
                            isPostOperationLoading 
                                ? 'bg-blue-600 opacity-60 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isPostOperationLoading}
                    >
                        {isPostOperationLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </div>
        </div>
    );
}

PostEditModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    post: PropTypes.object,
};

export default PostEditModal;