import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function PostActions({
    post,
    currentUser,
    isAuthor,
    onLike,
    onDelete,
    onEditClick,
}) {
    const { t } = useTranslation();
    const isLiked = currentUser && (post.likes || []).includes(currentUser._id);
    const likesCount = (post.likes || []).length;
    const commentsCount = post.commentsCount || (post.comments ? post.comments.length : 0);

    return (
        <div className="flex flex-wrap justify-between items-center text-gray-400 text-sm mt-4 gap-3 border-t border-neutral-700 pt-4">
            <div className="flex items-center gap-6">
                <button
                    type="button"
                    onClick={(e) => onLike(e)}
                    className="flex items-center text-gray-400 transition-colors focus:outline-none group transform hover:scale-105"
                    title={t('post.likeUnlike')}
                >
                    <FaHeart
                        className={`
                            mr-2 text-md sm:text-lg transition-all duration-200 
                            ${isLiked 
                                ? 'text-red-500 drop-shadow-md shadow-red-500'
                                : 'text-gray-500 group-hover:text-red-400'
                            }
                        `}
                    />
                    <span className="font-semibold transition-colors">
                        {t('post.likes', { count: likesCount })}
                    </span>
                </button>

                <Link
                    to={`/post/${post._id}`}
                    className="flex items-center text-gray-400 hover:text-blue-400 transition-colors group transform hover:scale-105"
                    title={t('post.goToComments')}
                >
                    <FaComment className="mr-2 text-md sm:text-lg text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span className="font-semibold transition-colors">
                        {t('post.comments', { count: commentsCount })}
                    </span>
                </Link>
            </div>

            {isAuthor && (
                <div className="flex items-center gap-4 ml-auto">
                    <button
                        onClick={onEditClick}
                        className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none transform hover:scale-110"
                        title={t('post.editPost')}
                    >
                        <FaEdit className="text-md sm:text-lg" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-gray-500 hover:text-red-500 transition-colors focus:outline-none transform hover:scale-110"
                        title={t('post.deletePost')}
                    >
                        <FaTrash className="text-md sm:text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default PostActions;
