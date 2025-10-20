import React from 'react';

// Компонент, имитирующий скелет экрана профиля
function ProfileSkeleton() {
    
    // Вспомогательный компонент для создания эффекта пульсирующей линии
    const SkeletonLine = ({ width = 'w-full', height = 'h-4', margin = 'mb-2' }) => (
        <div className={`bg-neutral-700 rounded-lg animate-pulse ${width} ${height} ${margin}`}></div>
    );

    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 max-w-4xl min-h-screen">
                
                {/* 1. Блок Header (Аватар, Имя, Кнопки) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b border-neutral-800 pb-6 mb-6">
                    <div className="flex items-center space-x-4">
                        {/* Аватар */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                        
                        {/* Имя и дата регистрации */}
                        <div className="mt-4 sm:mt-0">
                            <SkeletonLine width="w-36" height="h-8" margin="mb-4" /> {/* Имя пользователя */}
                            <SkeletonLine width="w-24" height="h-3" /> {/* Дата регистрации/прочее */}
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="mt-6 sm:mt-0 flex space-x-3 self-center sm:self-auto">
                        <div className="w-24 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                        <div className="w-28 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* 2. Блок Bio */}
                <div className="mb-8 p-4 border border-neutral-800 rounded-xl bg-neutral-900 animate-pulse">
                    <h3 className="text-xl font-semibold mb-3 text-gray-300">Биография</h3>
                    <SkeletonLine height="h-4" />
                    <SkeletonLine width="w-11/12" height="h-4" />
                    <SkeletonLine width="w-2/3" height="h-4" />
                </div>

                {/* 3. Секция Постов (Заголовок) */}
                <h2 className="text-2xl font-bold mb-6 border-b border-blue-400 pb-2 text-blue-400">
                    Посты
                </h2>

                {/* 4. Скелет поста (Повторяющийся элемент) */}
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="mb-6 p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg transition duration-300">
                        {/* Заголовок поста / Автор */}
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse"></div>
                            <SkeletonLine width="w-32" height="h-4" />
                        </div>
                        
                        {/* Тело поста */}
                        <SkeletonLine width="w-full" height="h-5" />
                        <SkeletonLine width="w-10/12" height="h-5" margin="mb-4" />

                        {/* Медиа-плейсхолдер (фото/видео) */}
                        <div className="w-full h-48 bg-neutral-800 rounded-lg animate-pulse mb-4"></div>

                        {/* Кнопки действий */}
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                            <div className="w-20 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
                            <div className="w-20 h-8 bg-neutral-700 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfileSkeleton;