import React from 'react';
// ⭐ ИСПОЛЬЗУЕМ ВАШ СУЩЕСТВУЮЩИЙ КОМПОНЕНТ ДЛЯ ЭЛЕМЕНТА ЛЕНТЫ
import PostItem from '../../components/PostItem'; 
import { FaSpinner } from 'react-icons/fa';

/**
 * PostFeed: Универсальный компонент для отображения ленты постов.
 *
 * @param {object} props
 * @param {Array<Object>} props.posts - Массив объектов постов для отображения.
 * @param {boolean} [props.isLoading=false] - Флаг, указывающий на состояние загрузки.
 */
function PostFeed({ posts, isLoading = false }) {
    
    // --- Логика отображения загрузки (Спиннер) ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
            </div>
        );
    }

    // --- Логика отображения пустого состояния ---
    // Используем пустой массив по умолчанию для безопасной работы
    const postsToRender = posts || [];
    
    if (postsToRender.length === 0) {
        return (
            <div className="text-center p-10 text-gray-500">
                <p className="mb-2">Здесь пока пусто 😔.</p>
                <p className="text-sm">Постов для отображения нет.</p>
            </div>
        );
    }
    
    // --- Основной рендеринг ленты ---
    return (
        <div className="post-feed divide-y divide-neutral-800">
            {postsToRender.map((post) => (
                <PostItem 
                    key={post._id} 
                    post={post} 
                    // Можно передать variant="compact" или "full" при необходимости
                    variant="compact" 
                />
            ))}
        </div>
    );
}

export default PostFeed;