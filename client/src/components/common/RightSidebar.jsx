import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaChevronRight, FaChartLine, FaSpinner } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { useTranslation } from 'react-i18next';

import UserCard from './UserCard';
import TrendItem from './TrendItem';

import { getRecommendedUsers } from '../../redux/features/users/userThunks'; 
import { getTrends } from '../../redux/features/trends/trendThunks';


function RightSidebar() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { 
        recommendedUsers, 
        isRecommendedLoading 
    } = useSelector((state) => state.users);
    const { 
        trends, 
        isLoading: isTrendsLoading 
    } = useSelector((state) => state.trends);

    useEffect(() => {
        dispatch(getRecommendedUsers());
        dispatch(getTrends());
    }, [dispatch]);

    const displayedUsers = recommendedUsers.slice(0, 3);
    const displayedTrends = trends.slice(0, 3);
    
    const renderLoadingPlaceholder = () => (
        <div className="flex justify-center items-center py-4 text-gray-400">
            <FaSpinner className="animate-spin mr-2" /> {t('common.loading')}
        </div>
    );

    return (
        <div className="hidden lg:block w-72 min-h-screen p-4 sticky top-[80px] self-start space-y-6
                        border border-neutral-700 hover:border-blue-600 
                        transform transition-all duration-700 ease-out rounded-xl">

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-3">
                <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center">
                    <FaUserPlus className="mr-2 text-blue-400" /> {t('sidebar.whoToFollow')}
                </h3>
                
                <div className='space-y-1'>
                    {isRecommendedLoading && displayedUsers.length === 0 ? (
                        renderLoadingPlaceholder()
                    ) : (
                        displayedUsers.map(user => {
                            if (!user) return null; 
                            
                            return (
                                <UserCard 
                                    key={user._id} 
                                    user={user}
                                    size="small"
                                />
                            );
                        })
                    )}
                    
                    {(!isRecommendedLoading && displayedUsers.length === 0) && (
                        <p className="text-gray-500 text-sm p-2 text-center">
                            {t('sidebar.noRecommendations')}
                        </p>
                    )}
                </div>

                <Link to="/discover/users" className="text-blue-500 hover:text-blue-400 text-sm mt-3 p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between">
                    {t('sidebar.showMore')}
                    <FaChevronRight className="text-xs ml-1" />
                </Link>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-3">
                <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center">
                    <FaChartLine className="mr-2 text-red-400" /> {t('trends.sidebarTitle')}
                </h3>

                <div className='space-y-1'>
                    {isTrendsLoading && displayedTrends.length === 0 ? (
                        renderLoadingPlaceholder()
                    ) : (
                        displayedTrends.map((trend, index) => (
                            <TrendItem 
                                key={trend.topic || index}
                                topic={trend.topic} 
                                postCount={trend.count}
                            />
                        ))
                    )}

                    {(!isTrendsLoading && displayedTrends.length === 0) && (
                        <p className="text-gray-500 text-sm p-2 text-center">
                            {t('trends.noTrends')}
                        </p>
                    )}
                </div>
                
                <Link to="/discover/trends" className="text-blue-500 hover:text-blue-400 text-sm mt-3 p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between">
                    {t('trends.allTrends')}
                    <FaChevronRight className="text-xs ml-1" />
                </Link>
            </div>

            <footer className="text-xs text-gray-600 pt-2 px-2">
                <p>{t('sidebar.footer')}</p>
            </footer>
        </div>
    );
}

export default RightSidebar;
