import React from 'react';
import { FaGoogle } from 'react-icons/fa';

// 1. Получаем базу URL API, которую мы настроили на Vercel
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Формируем полный, абсолютный URL для Google OAuth
// Мы знаем, что VITE_API_BASE_URL заканчивается на /api.
// Поэтому добавляем только /users/google
const GOOGLE_AUTH_URL = `${API_BASE_URL}/users/google`;

function GoogleAuthButton() {
    return (
        <a 
            // Перенаправляем пользователя на бэкенд, который инициирует Google OAuth
            href={GOOGLE_AUTH_URL} 
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-md transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
            <FaGoogle className="w-5 h-5 mr-3" />
            Войти через Google
        </a>
    );
}

export default GoogleAuthButton;