import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageModal from '../ImageModal';

function PostAuthorInfo({ author }) {
    const { t } = useTranslation();
    const authorUsername = author?.username || t('common.unknownUser');
    const authorProfilePicture = author?.profilePicture || 'https://placehold.co/40x40/1f2937/d1d5db?text=PF'; 
    const authorId = author?._id;
    const authorFollowersCount = author?.followers?.length || 0;
    const authorFollowingCount = author?.following?.length || 0;

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <div className="flex items-center space-x-3">
            <img
                src={authorProfilePicture}
                alt={t('common.profile')}
                className="w-10 h-10 rounded-full object-cover cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-blue-500 shadow-lg shadow-blue-500/10"
                onClick={openModal}
            />
            
            <div className="flex flex-col flex-1 min-w-0">
                {authorId ? (
                    <Link to={`/profile/${authorId}`} className="block">
                        <p className="font-bold text-gray-100 hover:text-blue-400 hover:underline text-base truncate transition duration-200">
                            {authorUsername}
                        </p>
                    </Link>
                ) : (
                    <p className="font-bold text-gray-100 text-base truncate">
                        {authorUsername}
                    </p>
                )}
                
                <p className="text-xs text-gray-400 whitespace-nowrap overflow-hidden">
                    <span className="truncate">{authorFollowersCount} {t('profile.followers')}</span>
                    <span className="mx-1 text-blue-500 font-extrabold">&bull;</span>
                    <span className="truncate">{authorFollowingCount} {t('profile.following')}</span>
                </p>
            </div>

            <ImageModal
                imageUrl={isModalOpen ? authorProfilePicture : null}
                onClose={closeModal}
            />
        </div>
    );
}

export default PostAuthorInfo;
