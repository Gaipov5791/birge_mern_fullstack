// /components/common/TrendItem.jsx

import React from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // ⭐ Импортируем Link

// Вспомогательная функция для склонения слова "публикация"
const formatPostCount = (count) => {
    if (count === 1) return 'публикация';
    if (count > 1 && count < 5) return 'публикации';
    return 'публикаций';
};

const TrendItem = ({ rank, topic, postCount, size = 'small' }) => {
    
    // Формируем URL для страницы хештега
    // Кодируем, чтобы избежать проблем с символами в URL
    const encodedTopic = encodeURIComponent(topic);
    const linkPath = `/hashtag/${encodedTopic}`;
    
    const isLarge = size === 'large';
    const containerClasses = isLarge 
        ? "flex justify-between items-center p-4 border-b border-neutral-800 transition-colors hover:bg-neutral-900"
        : "transition-colors duration-200 hover:bg-neutral-800 rounded-lg";
        
    const countText = `${postCount} ${formatPostCount(postCount)}`;


    return (
        <Link 
            to={linkPath} 
            className={containerClasses}
        >
            
            {/* Ранг только для большой версии */}
            {isLarge && (
                 <div className="flex-shrink-0 text-xl font-extrabold text-blue-500 mr-4 w-8 text-center">
                    {rank}
                </div>
            )}
            
            <div className="flex-grow">
                {/* В большой версии убираем лишнюю нумерацию, так как она есть в отдельном блоке rank */}
                <span className="text-xs text-gray-500 block">
                    {isLarge && rank ? `Топ тренд ${rank}` : `Актуально сейчас`}
                </span>
                <h4 className="font-bold text-gray-100 text-base leading-snug hover:text-blue-400 transition-colors">
                    #{topic}
                </h4>
                <span className="text-sm text-gray-400">{countText}</span>
            </div>
            
            {/* Стрелка для обеих версий, показывающая, что элемент кликабельный */}
            {isLarge && (
                <div className="flex-shrink-0 text-gray-500 ml-2">
                    {/* Обычно стрелка указывает вправо, чтобы показать переход */}
                    <FaChevronRight className="text-sm" /> 
                </div>
            )}
        </Link>
    );
};

export default TrendItem;