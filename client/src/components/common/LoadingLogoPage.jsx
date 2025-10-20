import React from 'react';
import { FaGlobe } from 'react-icons/fa'; // Используем иконку, как на DiscoverPage

function LoadingLogoPage() {
    return (
        <>
            {/* // ⭐ 1. Кастомная CSS-анимация для вращения по оси Y (flip-y)
            // Мы используем <style> для инъекции keyframes, поскольку для 3D-вращения
            // требуется пользовательский CSS, не входящий в стандартный набор Tailwind.
            */}
            <style>
                {`
                @keyframes flip-y {
                    0%, 100% {
                        transform: perspective(600px) rotateY(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: perspective(600px) rotateY(180deg);
                        opacity: 0.2; /* Делаем текст полупрозрачным в середине вращения */
                    }
                }
                .animate-flip-y-loop {
                    animation: flip-y 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; /* 2.5 секунды, плавное ускорение/замедление */
                }
                `}
            </style>
            
            {/* ⭐ Тёмный фон (neutral-950) с высоким Z-индексом, чтобы перекрыть весь контент */}
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 transition-opacity duration-500">
                
                {/* Иконка: Акцентный синий, крупный размер, плавная пульсация */}
                <FaGlobe 
                    className='text-7xl text-blue-400 mb-6 animate-pulse' 
                />

                {/* Логотип: Теперь с анимацией вращения */}
                <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-100 uppercase tracking-widest transition-colors duration-300 animate-flip-y-loop">
                    Бирге
                </h1>

                {/* Современный, циклический индикатор загрузки (3 "скачущие" точки) */}
                <div className="mt-10 flex space-x-2">
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0s', animationDuration: '1s' }} // Первая точка
                    ></div>
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.2s', animationDuration: '1s' }} // Вторая точка с задержкой
                    ></div>
                    <div 
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                        style={{ animationDelay: '0.4s', animationDuration: '1s' }} // Третья точка с задержкой
                    ></div>
                </div>
                
            </div>
        </>
    );
}

export default LoadingLogoPage;