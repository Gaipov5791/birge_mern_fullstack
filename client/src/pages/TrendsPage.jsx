import React, { useEffect } from 'react';
import { FaChartLine, FaChevronLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getTrends } from '../redux/features/trends/trendThunks';

import TrendItem from '../components/common/TrendItem';


function TrendsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { 
        trends, 
        isLoading: isTrendsLoading, 
        isError, 
        message 
    } = useSelector((state) => state.trends);
    
    useEffect(() => {
        dispatch(getTrends());
    }, [dispatch]);

    if (isTrendsLoading && trends.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <p className="ml-4 text-gray-400">{t('trends.loading')}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4">
                <p className="text-red-500 text-lg mb-4">{t('trends.loadError', { message })}</p>
                <button 
                    onClick={() => dispatch(getTrends())} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                    {t('common.tryAgain')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100">
            <div className="max-w-xl mx-auto border-x border-neutral-800">
                
                <header className="sticky top-0 bg-neutral-900/90 backdrop-blur-sm z-10 p-4 border-b border-neutral-800 flex items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 mr-4 text-blue-400 hover:bg-neutral-800 rounded-full transition"
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-100 flex items-center">
                        <FaChartLine className="mr-2 text-red-400" /> {t('trends.title')}
                    </h1>
                </header>

                <div className="trends-list px-4 py-4">
                    {(trends && Array.isArray(trends) && trends.length > 0) ? (
                        trends.map((trend, index) => (
                            <TrendItem 
                                key={trend._id || trend.topic}
                                rank={index + 1}
                                topic={trend.topic} 
                                postCount={trend.count}
                            />
                        ))
                    ) : (
                        !isTrendsLoading && (
                            <div className="text-center p-10 text-gray-500">
                                {t('trends.empty')}
                            </div>
                        )
                    )}
                </div>

                <div className="text-center p-6 text-gray-500">
                    {t('trends.footer')}
                </div>
            </div>
        </div>
    );
}

export default TrendsPage;
