import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { FaEdit, FaTrash } from 'react-icons/fa';

// ⭐ ФУНКЦИЯ ДЛЯ ПАРСИНГА ТЕКСТА КОММЕНТАРИЯ НА ССЫЛКИ
const parseCommentText = (text) => {
    // Регулярное выражение для поиска URL-адресов, начинающихся с http, https или www.
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    
    // Разбиваем текст по найденным ссылкам. Ссылки также попадают в массив parts.
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        // Проверяем, является ли часть текста ссылкой
        if (part.match(urlRegex)) {
            // Гарантируем, что ссылка имеет префикс http/https для корректного href
            let href = part;
            if (href.startsWith('www.')) {
                href = `http://${href}`;
            } else if (!href.startsWith('http')) {
                 // Дополнительная проверка, хотя regex с 'https?://' и 'www.' должен это покрыть.
                href = `http://${href}`;
            }

            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Стили для кликабельной ссылки
                    className="text-blue-400 hover:text-blue-300 underline font-medium break-words" 
                >
                    {part}
                </a>
            );
        }
        return part; // Обычный текст
    });
};

const CommentItem = ({ comment, onDeleteConfirmStart, onEditStart, currentUserId }) => {

    // ⭐ СОСТОЯНИЕ ДЛЯ АНИМАЦИИ (ОСТАВЛЯЕМ)
    const [isMounted, setIsMounted] = useState(false);
    
    // ⭐ ЭФФЕКТ ДЛЯ ЗАПУСКА АНИМАЦИИ (ОСТАВЛЯЕМ)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);
    

    // Проверяем, что ID текущего пользователя совпадает с ID автора комментария
    const isCommentAuthor = currentUserId && 
                           comment.user && 
                           String(comment.user._id) === String(currentUserId);

    // ⭐ ХЕНДЛЕР УДАЛЕНИЯ (ТОЛЬКО ВЫЗОВ ПРОПСА)
    const handleDeleteComment = () => {
        if (!currentUserId) {
            return;
        }
        onDeleteConfirmStart(comment._id);
    };

    // ⭐ НОВЫЙ ХЕНДЛЕР РЕДАКТИРОВАНИЯ (ВЫЗЫВАЕТ МОДАЛЬНОЕ ОКНО)
    const handleEditCommentStart = () => {
        if (!currentUserId) {
            return;
        }
        // ⭐ ВЫЗЫВАЕМ ПРОПС, ПЕРЕДАВАЯ ВЕСЬ ОБЪЕКТ КОММЕНТАРИЯ
        onEditStart(comment); 
    };

    return (
        <div 
            className={`
                bg-neutral-800 rounded-xl shadow-xl shadow-neutral-900/50 
                p-4 sm:p-6 mb-4 border border-neutral-700 hover:border-blue-600 
                transform transition-all duration-700 ease-out 
                ${isMounted 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-4 scale-95'}
            `}
        >
            <div className="flex items-center mb-4">
                <img
                    src={comment.user?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                    alt="Профиль"
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                />
                <div>
                    <p className="font-extrabold text-gray-100 text-lg hover:underline">{comment.user?.username || 'Неизвестный пользователь'}</p>
                    <p className="text-sm text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
            </div>

            {/* РЕЖИМ ПРОСМОТРА */}
            <p className="text-white text-sm sm:text-base mb-4 whitespace-pre-wrap">
                {parseCommentText(comment.text)}
            </p>

            {/* Кнопки редактирования и удаления */}
            {isCommentAuthor && (
                <div className="flex space-x-2 mt-2 justify-end">
                    {/* КНОПКА РЕДАКТИРОВАНИЯ */}
                    <button
                        onClick={handleEditCommentStart} // ⭐ ВЫЗЫВАЕТ ОТКРЫТИЕ МОДАЛКИ
                        className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none transform hover:scale-110"
                    >
                        <FaEdit className="text-md sm:text-lg" />
                    </button>
                    
                    {/* КНОПКА УДАЛЕНИЯ */}
                    <button
                        onClick={handleDeleteComment} 
                        className="text-gray-500 hover:text-red-500 transition-colors focus:outline-none transform hover:scale-110"
                    >
                        <FaTrash className="text-md sm:text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentItem;