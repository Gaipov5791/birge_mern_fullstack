import React from 'react';
import PostItem from '../../components/PostItem'; 
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function PostFeed({ posts, isLoading = false }) {
    const { t } = useTranslation();
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
            </div>
        );
    }

    const postsToRender = posts || [];
    
    if (postsToRender.length === 0) {
        return (
            <div className="text-center p-10 text-gray-500">
                <p className="mb-2">{t('post.emptyTitle')}</p>
                <p className="text-sm">{t('post.emptyMessage')}</p>
            </div>
        );
    }
    
    return (
        <div className="post-feed divide-y divide-neutral-800">
            {postsToRender.map((post) => (
                <PostItem 
                    key={post._id} 
                    post={post} 
                    variant="compact" 
                />
            ))}
        </div>
    );
}

export default PostFeed;
