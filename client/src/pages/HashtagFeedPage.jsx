import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaHashtag, FaSpinner } from 'react-icons/fa';

import PostFeed from '../components/posts/PostFeed';
import { getPostsByHashtag } from '../redux/features/posts/postThunks';

function HashtagFeedPage() {
    const { t } = useTranslation();
    const { tagName } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        hashtagFeed: posts, 
        isHashtagLoading: isLoading, 
        hashtagErrorMessage: error 
    } = useSelector((state) => state.posts);

    useEffect(() => {
        if (tagName) {
            dispatch(getPostsByHashtag(tagName));
        }
    }, [dispatch, tagName]);

    const displayTag = tagName ? `#${tagName}` : t('hashtag.defaultTag');

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 border-x border-neutral-800 max-w-xl mx-auto">
            
            <header className="sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10 p-4 border-b border-neutral-800 flex items-center">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 mr-4 text-blue-400 hover:bg-neutral-800 rounded-full transition"
                >
                    <FaChevronLeft className="text-xl" />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">{t('hashtag.trending')}</span>
                    <h1 className="text-xl font-extrabold text-gray-100 flex items-center">
                        <FaHashtag className="mr-1 text-blue-400" /> 
                        {tagName}
                    </h1>
                </div>
            </header>

            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <FaSpinner className="animate-spin text-4xl text-blue-400" />
                </div>
            )}

            {error && (
                <div className="text-center p-6 text-red-500">
                    {t('hashtag.loadError', { error })}
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {posts.length > 0 ? (
                        <PostFeed posts={posts} />
                    ) : (
                        <div className="text-center p-10 text-gray-500">
                            {t('hashtag.empty', { tag: displayTag })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default HashtagFeedPage;
