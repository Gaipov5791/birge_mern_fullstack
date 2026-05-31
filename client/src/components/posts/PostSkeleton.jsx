import React from 'react';
import { Trans } from 'react-i18next';

const SinglePostSkeleton = () => {
    
    const SkeletonLine = ({ width = 'w-full', height = 'h-4', margin = 'mb-2' }) => (
        <div className={`bg-neutral-700 rounded-lg animate-pulse ${width} ${height} ${margin}`}></div>
    );
    
    return (
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg transition duration-300">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                <SkeletonLine width="w-32" height="h-4" margin="mb-0" />
            </div>
            
            <div className="mb-4 space-y-2">
                <SkeletonLine width="w-full" height="h-5" />
                <SkeletonLine width="w-11/12" height="h-5" />
                <SkeletonLine width="w-3/4" height="h-5" />
            </div>

            <div className="w-full h-48 bg-neutral-800 rounded-lg animate-pulse mb-4"></div>

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
                <div className='mt-5 text-xl sm:text-3xl font-extrabold text-center mb-10 text-gray-100 uppercase tracking-wider'>
                    <Trans
                        i18nKey="dashboard.title"
                        components={{ 1: <span className="text-blue-400" /> }}
                    />
                </div>
                
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
