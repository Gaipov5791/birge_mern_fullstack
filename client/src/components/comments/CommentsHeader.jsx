import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CommentHeader({ post, commentsCount }) {
    const { t } = useTranslation();

    if (!post) return null;

    const postAuthorUsername = post.author?.username || t('common.unknownUser');
    const postAuthorProfilePicture = post.author?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    const postAuthorId = post.author?._id;
    const postCreatedAt = post.createdAt
        ? new Date(post.createdAt).toLocaleString()
        : t('common.invalidDate');
    const mediaUrl = post.image || post.video;
    const mediaType = post.image ? 'image' : (post.video ? 'video' : null);
    const fullMediaUrl = mediaUrl ? `${API_BASE_URL.replace(/\/api$/, '')}${mediaUrl}` : null;
    const likesCount = post.likes?.length || 0;

    return (
        <div className="bg-neutral-800 rounded-3xl shadow-xl shadow-neutral-900/50 border-b-4 border-indigo-600 p-4 sm:p-6 mb-6">
            <div className="flex items-center mb-4">
                {postAuthorId ? (
                    <Link to={`/profile/${postAuthorId}`} className="flex items-center">
                        <img
                            src={postAuthorProfilePicture}
                            alt={t('comment.postAuthorAlt')}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                        <div>
                            <p className="font-extrabold text-gray-100 text-lg hover:underline">{postAuthorUsername}</p>
                            <p className="text-sm text-gray-400">{postCreatedAt}</p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center">
                        <img
                            src={postAuthorProfilePicture}
                            alt={t('comment.postAuthorAlt')}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                        <div>
                            <p className="font-extrabold text-gray-100 text-lg">{postAuthorUsername}</p>
                            <p className="text-sm text-gray-400">{postCreatedAt}</p>
                        </div>
                    </div>
                )}
            </div>
            
            <p className="text-white text-sm sm:text-base mb-4 whitespace-pre-wrap">{post.text}</p>
            
            {fullMediaUrl && (
                <div className="mt-4 mb-4">
                    {mediaType === 'video' ? (
                        <div className="relative group rounded-md overflow-hidden">
                            <video
                                src={fullMediaUrl}
                                controls
                                className="w-full rounded-md max-h-96 object-contain"
                                aria-label={t('comment.postVideo')}
                            />
                        </div>
                    ) : (
                        <img
                            src={fullMediaUrl}
                            alt={t('comment.postImage')}
                            className="w-full rounded-md max-h-96 object-contain"
                        />
                    )}
                </div>
            )}
            
            <div className="flex justify-between items-center text-gray-400 text-xs sm:text-sm">
                <span>{t('post.likes', { count: likesCount })}</span>
                <span>{t('post.comments', { count: commentsCount })}</span>
            </div>
        </div>
    );
}

export default CommentHeader;
