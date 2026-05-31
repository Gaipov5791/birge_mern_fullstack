import React from 'react';
import { useTranslation } from 'react-i18next';

function LoadingLogoPage() {
    const { t } = useTranslation();

    return (
        <>
            <style>
                {`
                @keyframes brand-gradient-flow {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                @keyframes brand-glow-pulse {
                    0%, 100% {
                        opacity: 0.35;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.55;
                        transform: scale(1.05);
                    }
                }
                .brand-logo-text {
                    background: linear-gradient(
                        90deg,
                        #60a5fa 0%,
                        #818cf8 22%,
                        #3b82f6 45%,
                        #6366f1 68%,
                        #60a5fa 100%
                    );
                    background-size: 220% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    color: transparent;
                    animation: brand-gradient-flow 3.5s ease-in-out infinite;
                }
                .brand-logo-glow {
                    background: radial-gradient(
                        ellipse at center,
                        rgba(59, 130, 246, 0.35) 0%,
                        rgba(99, 102, 241, 0.15) 45%,
                        transparent 70%
                    );
                    animation: brand-glow-pulse 3.5s ease-in-out infinite;
                }
                `}
            </style>

            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950 transition-opacity duration-500">
                <div className="relative flex items-center justify-center">
                    <div
                        className="brand-logo-glow absolute inset-0 -m-16 sm:-m-24 pointer-events-none"
                        aria-hidden="true"
                    />
                    <h1 className="relative text-5xl sm:text-7xl font-extrabold uppercase tracking-widest brand-logo-text select-none">
                        {t('brand')}
                    </h1>
                </div>
            </div>
        </>
    );
}

export default LoadingLogoPage;
