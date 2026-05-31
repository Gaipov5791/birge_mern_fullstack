import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function LoadingLogoPage() {
    const { t } = useTranslation();

    return (
        <>
            <style>
                {`
                @keyframes flip-y {
                    0%, 100% {
                        transform: perspective(600px) rotateY(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: perspective(600px) rotateY(180deg);
                        opacity: 0.2;
                    }
                }
                .animate-flip-y-loop {
                    animation: flip-y 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                `}
            </style>
            
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 transition-opacity duration-500">
                <FaGlobe 
                    className='text-7xl text-blue-400 mb-6 animate-pulse' 
                />

                <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-100 uppercase tracking-widest transition-colors duration-300 animate-flip-y-loop">
                    {t('brand')}
                </h1>

                <div className="mt-10 flex space-x-2">
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0s', animationDuration: '1s' }}
                    ></div>
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.2s', animationDuration: '1s' }}
                    ></div>
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.4s', animationDuration: '1s' }}
                    ></div>
                </div>
                
            </div>
        </>
    );
}

export default LoadingLogoPage;
