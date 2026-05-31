import React from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TrendItem = ({ rank, topic, postCount, size = 'small' }) => {
    const { t } = useTranslation();
    
    const encodedTopic = encodeURIComponent(topic);
    const linkPath = `/hashtag/${encodedTopic}`;
    
    const isLarge = size === 'large';
    const containerClasses = isLarge 
        ? "flex justify-between items-center p-4 border-b border-neutral-800 transition-colors hover:bg-neutral-900"
        : "transition-colors duration-200 hover:bg-neutral-800 rounded-lg";
        
    const countText = `${postCount} ${t('trends.publication', { count: postCount })}`;

    return (
        <Link 
            to={linkPath} 
            className={containerClasses}
        >
            {isLarge && (
                 <div className="flex-shrink-0 text-xl font-extrabold text-blue-500 mr-4 w-8 text-center">
                    {rank}
                </div>
            )}
            
            <div className="flex-grow">
                <span className="text-xs text-gray-500 block">
                    {isLarge && rank ? t('trends.topTrend', { rank }) : t('trends.trendingNow')}
                </span>
                <h4 className="font-bold text-gray-100 text-base leading-snug hover:text-blue-400 transition-colors">
                    #{topic}
                </h4>
                <span className="text-sm text-gray-400">{countText}</span>
            </div>
            
            {isLarge && (
                <div className="flex-shrink-0 text-gray-500 ml-2">
                    <FaChevronRight className="text-sm" /> 
                </div>
            )}
        </Link>
    );
};

export default TrendItem;
