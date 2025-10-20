import React from 'react';

// Вспомогательный компонент для создания эффекта пульсирующей линии
const SkeletonLine = ({ width = 'w-full', height = 'h-4', margin = 'mb-2' }) => (
    <div className={`bg-neutral-700 rounded-lg animate-pulse ${width} ${height} ${margin}`}></div>
);

// Компонент, имитирующий скелет одного комментария
const SingleCommentSkeleton = () => (
    <div className="flex space-x-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-inner">
        {/* Аватар автора комментария */}
        <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
        
        <div className="flex-grow">
            {/* Имя автора и дата */}
            <div className="flex justify-between items-center mb-1">
                <SkeletonLine width="w-24" height="h-3" margin="mb-0" />
                <SkeletonLine width="w-16" height="h-3" margin="mb-0" />
            </div>
            
            {/* Тело комментария */}
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-11/12" height="h-4" margin="mb-3" />

            {/* Кнопки действий (Лайки) */}
            <div className="flex justify-start items-center space-x-3 mt-2">
                <div className="w-10 h-6 bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);


function CommentSkeleton() {
    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 mt-8 max-w-2xl">
                
                {/* 1. Скелет поста (Имитация CommentHeader) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-5 mb-6">
                    {/* Автор поста */}
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                        <SkeletonLine width="w-32" height="h-4" margin="mb-0" />
                    </div>
                    
                    {/* Текст поста */}
                    <div className="mb-4 space-y-2">
                        <SkeletonLine width="w-full" height="h-5" />
                        <SkeletonLine width="w-10/12" height="h-5" />
                        <SkeletonLine width="w-2/3" height="h-5" />
                    </div>

                    {/* Мета-информация (лайки/комментарии) */}
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                        <div className="w-24 h-4 bg-neutral-700 rounded-lg animate-pulse"></div>
                        <div className="w-16 h-4 bg-neutral-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* 2. Скелет формы комментария (Имитация CommentForm) */}
                <div className="mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-inner">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-grow space-y-2">
                            <div className="w-full h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                            <div className="flex justify-end pt-2">
                                <div className="w-20 h-8 bg-blue-700/50 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 3. Заголовок "Комментарии" */}
                <SkeletonLine width="w-40" height="h-6" margin="mb-4 mt-8" />
                
                {/* 4. Скелеты комментариев (повторяем 3 раза) */}
                <div className='space-y-4'>
                    {[...Array(3)].map((_, index) => (
                        <SingleCommentSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CommentSkeleton;