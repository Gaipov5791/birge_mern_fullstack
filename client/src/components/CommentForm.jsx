import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function CommentForm({ onSubmit }) {
    const [commentText, setCommentText] = useState('');

    // Локальное состояние для отображения ошибки валидации
    const [localError, setLocalError] = useState(''); 

    const { isPublishing } = useSelector((state) => state.comments);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError(''); // Сброс ошибки при каждой попытке отправки

        if (commentText.trim()) {
            // ⭐ Дополнительная проверка: запретить отправку, если уже идет публикация
            if (!isPublishing) {
                onSubmit(commentText);
                setCommentText('');
            }
        } else {
            setLocalError('Комментарий не может быть пустым.');
        }
    };

    const handleTextChange = (e) => {
        setCommentText(e.target.value);
        if (localError) {
            setLocalError(''); // Сброс ошибки при начале ввода
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-2xl shadow-blue-900/50 border border-neutral-700 mb-8">
            <h3 className="text-lg sm:text-xl font-extrabold text-white mb-3 sm:mb-4">Оставить комментарий</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="
                        w-full p-4 border rounded-xl bg-neutral-700 text-white text-sm sm:text-base
                        placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 
                        resize-none transition-colors mb-3
                    "
                    style={{ borderColor: localError ? 'rgb(239 68 68)' : 'rgb(64 64 64)' }}
                    rows="3"
                    placeholder="Напишите ваш комментарий..."
                    value={commentText}
                    onChange={handleTextChange}
                    disabled={isPublishing}
                ></textarea>

                {/* Отображение локальной ошибки */}
                {localError && (
                    <p className="text-red-400 text-sm mb-3 font-medium transition-opacity duration-300">
                        {localError}
                    </p>
                )}
                
                <button
                    type="submit"
                    className="
                        w-full py-2 px-4 text-sm sm:text-base text-white font-semibold rounded-lg 
                        flex items-center justify-center focus:outline-none 
                        focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-md 
                        bg-blue-600 hover:bg-blue-700 shadow-blue-500/40 focus:ring-blue-500 focus:ring-offset-neutral-800
                    "
                    disabled={isPublishing}
                >
                    {isPublishing ? 'Публикация...' : 'Опубликовать комментарий'}
                </button>
            </form>
        </div>
    );
}

export default CommentForm;