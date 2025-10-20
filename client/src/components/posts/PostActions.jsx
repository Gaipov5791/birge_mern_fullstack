import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';

function PostActions({
    post,
    currentUser,
    isAuthor,
    onLike,
    onDelete,
    onEditClick,
}) {
    const isLiked = currentUser && (post.likes || []).includes(currentUser._id);

    return (
        // ⭐ Общий контейнер: Светло-серый текст на тёмном фоне
        <div className="flex flex-wrap justify-between items-center text-gray-400 text-sm mt-4 gap-3 border-t border-neutral-700 pt-4">
            
            {/* Лайки и комментарии */}
            <div className="flex items-center gap-6">
                
                {/* ⭐ Лайк: Динамический цвет и эффект */}
                <button
                    type="button"
                    onClick={(e) => onLike(e)}
                    className="flex items-center text-gray-400 transition-colors focus:outline-none group transform hover:scale-105"
                    title="Нравится / Не нравится"
                >
                    <FaHeart
                        className={`
                            mr-2 text-md sm:text-lg transition-all duration-200 
                            ${isLiked 
                                ? 'text-red-500 drop-shadow-md shadow-red-500' // Активный лайк
                                : 'text-gray-500 group-hover:text-red-400' // Неактивный лайк
                            }
                        `}
                    />
                    {/* Счётчик и текст */}
                    <span className="font-semibold transition-colors">
                        {(post.likes || []).length}
                        <span className="hidden sm:inline ml-1"> Лайков</span>
                    </span>
                </button>

                {/* ⭐ Комментарии: Синий акцент */}
                <Link
                    to={`/post/${post._id}`}
                    className="flex items-center text-gray-400 hover:text-blue-400 transition-colors group transform hover:scale-105"
                    title="Перейти к комментариям"
                >
                    <FaComment className="mr-2 text-md sm:text-lg text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span className="font-semibold transition-colors">
                        {post.commentsCount || (post.comments ? post.comments.length : 0)}
                        <span className="hidden sm:inline ml-1"> Комментариев</span>
                    </span>
                </Link>
            </div>

            {/* Кнопки редактирования и удаления (только для автора) */}
            {isAuthor && (
                <div className="flex items-center gap-4 ml-auto">
                    {/* ⭐ Редактировать: Синий hover */}
                    <button
                        onClick={onEditClick}
                        className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none transform hover:scale-110"
                        title="Редактировать пост"
                    >
                        <FaEdit className="text-md sm:text-lg" />
                    </button>
                    {/* ⭐ Удалить: Красный hover */}
                    <button
                        onClick={onDelete}
                        className="text-gray-500 hover:text-red-500 transition-colors focus:outline-none transform hover:scale-110"
                        title="Удалить пост"
                    >
                        <FaTrash className="text-md sm:text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default PostActions;
