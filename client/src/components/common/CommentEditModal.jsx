import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateComment } from '../../redux/features/comments/commentThunks'; // ⭐ Используем updateComment Thunk
import { toastError, toastSuccess } from '../../redux/features/notifications/notificationSlice';
import { FaSpinner } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ANIMATION_DURATION = 500;

/**
 * Модальное окно для редактирования комментария.
 * @param {boolean} isOpen - Открыто ли модальное окно.
 * @param {function} onClose - Функция закрытия.
 * @param {object} comment - Объект комментария, содержащий _id и text.
 */
function CommentEditModal({ isOpen, onClose, comment }) {
    const dispatch = useDispatch();
    // ⭐ Используем флаг загрузки из среза комментариев
    const { isCommentOperationLoading } = useSelector(state => state.comments);
    
    // ⭐ Управление рендерингом и анимацией
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(isOpen);
    
    // Используем состояние для отредактированного текста комментария
    const [editedText, setEditedText] = useState('');
    const initialTextRef = React.useRef(comment?.text || '');

    // Эффект для синхронизации текста при открытии
    useEffect(() => {
        if (comment && isOpen) { 
            setEditedText(comment.text || '');
            initialTextRef.current = comment.text || '';
        }
    }, [comment, isOpen]);

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
        if (!editedText.trim() || isCommentOperationLoading) return;

        // Проверяем, что текст действительно изменился
        if (editedText.trim() === initialTextRef.current.trim()) {
            onClose(); // Если нет изменений, просто закрываем
            return;
        }

        // Мы закрываем модальное окно сразу, чтобы избежать задержки в UX. 
        // Логика загрузки будет видна через общий спиннер на странице (isCommentOperationLoading).
        onClose(); 
        
        try {
            // ⭐ Обновление комментария: используем comment._id и новый текст
            await dispatch(updateComment({ commentId: comment._id, text: editedText })).unwrap();
            dispatch(toastSuccess('Комментарий успешно обновлен!'));
        } catch (error) {
            const errorMessage = error.payload?.message || error.message || 'Произошла ошибка.';
            dispatch(toastError(`Не удалось обновить комментарий: ${errorMessage}`));
        }
    }, [editedText, comment, dispatch, isCommentOperationLoading, onClose]);


    if (!isRendered || !comment) return null; // Фактический демонтаж
    
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
                        Редактировать комментарий
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
                        placeholder="Ваш обновленный комментарий..."
                        disabled={isCommentOperationLoading}
                    />
                </div>

                {/* Адаптивные кнопки для мобильной версии */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 bg-neutral-900 border-t border-neutral-700 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition duration-200"
                        disabled={isCommentOperationLoading}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg transition duration-200 flex items-center justify-center ${
                            isCommentOperationLoading 
                                ? 'bg-blue-600 opacity-60 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isCommentOperationLoading || !editedText.trim()}
                    >
                        {isCommentOperationLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Сохранение...
                            </>
                        ) : (
                            'Сохранить изменения'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

CommentEditModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    comment: PropTypes.object, // ⭐ Изменено с post на comment
};

export default CommentEditModal;