// /src/pages/HashtagFeedPage.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronLeft, FaHashtag, FaSpinner } from 'react-icons/fa';

import PostFeed from '../components/posts/PostFeed'; // Ваш компонент для отображения ленты
import { getPostsByHashtag } from '../redux/features/posts/postThunks';

function HashtagFeedPage() {
    const { tagName } = useParams(); // ⭐ Получаем имя тега из URL
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        hashtagFeed: posts, 
        isHashtagLoading: isLoading, 
        hashtagErrorMessage: error 
    } = useSelector((state) => state.posts);

    // Загрузка постов при изменении тега
    useEffect(() => {
        if (tagName) {
            dispatch(getPostsByHashtag(tagName));
        }
    }, [dispatch, tagName]);

    const displayTag = tagName ? `#${tagName}` : 'Хештег';

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 border-x border-neutral-800 max-w-xl mx-auto">
            
            {/* Заголовок */}
            <header className="sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10 p-4 border-b border-neutral-800 flex items-center">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 mr-4 text-blue-400 hover:bg-neutral-800 rounded-full transition"
                >
                    <FaChevronLeft className="text-xl" />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Актуально:</span>
                    <h1 className="text-xl font-extrabold text-gray-100 flex items-center">
                        <FaHashtag className="mr-1 text-blue-400" /> 
                        {tagName}
                    </h1>
                </div>
            </header>

            {/* Состояние Загрузки */}
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <FaSpinner className="animate-spin text-4xl text-blue-400" />
                </div>
            )}

            {/* Состояние Ошибки */}
            {error && (
                <div className="text-center p-6 text-red-500">
                    Ошибка загрузки ленты: {error}
                </div>
            )}

            {/* Лента Постов */}
            {!isLoading && !error && (
                <>
                    {posts.length > 0 ? (
                        <PostFeed posts={posts} />
                    ) : (
                        <div className="text-center p-10 text-gray-500">
                            Постов с хештегом **{displayTag}** пока нет.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default HashtagFeedPage;