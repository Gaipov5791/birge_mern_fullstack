import React from 'react';

// Компонент, имитирующий скелет одного поста
const SinglePostSkeleton = () => {
    
    // Вспомогательный компонент для создания эффекта пульсирующей линии
    const SkeletonLine = ({ width = 'w-full', height = 'h-4', margin = 'mb-2' }) => (
        <div className={`bg-neutral-700 rounded-lg animate-pulse ${width} ${height} ${margin}`}></div>
    );
    
    return (
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg transition duration-300">
            
            {/* 1. Блок Автора / Header */}
            <div className="flex items-center space-x-3 mb-4">
                {/* Аватар */}
                <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                {/* Имя пользователя */}
                <SkeletonLine width="w-32" height="h-4" margin="mb-0" />
            </div>
            
            {/* 2. Тело поста (Текст) */}
            <div className="mb-4 space-y-2">
                <SkeletonLine width="w-full" height="h-5" />
                <SkeletonLine width="w-11/12" height="h-5" />
                <SkeletonLine width="w-3/4" height="h-5" />
            </div>

            {/* 3. Медиа-плейсхолдер (если пост с изображением) */}
            <div className="w-full h-48 bg-neutral-800 rounded-lg animate-pulse mb-4"></div>

            {/* 4. Кнопки действий (Лайки, Комментарии) */}
            <div className="flex justify-start items-center space-x-4 pt-2 border-t border-neutral-800">
                <div className="w-16 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
                <div className="w-16 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
};


function PostSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Имитация заголовка страницы */}
                <div className='mt-5 text-xl sm:text-3xl font-extrabold text-center mb-10 text-gray-100 uppercase tracking-wider'>
                    Ваша <span className="text-blue-400">Лента</span> Новостей
                </div>
                
                {/* Имитация формы создания поста */}
                <div className="mb-8 p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg">
                    <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-grow space-y-2">
                            <div className="w-full h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                            <div className="flex justify-end pt-2">
                                <div className="w-24 h-8 bg-blue-700/50 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Контейнер для постов: повторяем скелет поста 3 раза */}
                <div className='posts-container mt-8 space-y-6'>
                    {[...Array(3)].map((_, index) => (
                        <SinglePostSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PostSkeleton;