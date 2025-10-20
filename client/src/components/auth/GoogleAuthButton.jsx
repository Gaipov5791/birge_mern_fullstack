import React from 'react';
import { FaGoogle } from 'react-icons/fa';

// ⭐ ВАЖНО: URL вашего бэкенд-маршрута для Google OAuth
const GOOGLE_AUTH_URL = '/api/users/google'; 
// Если ваш фронтенд и бэкенд работают на одном домене, достаточно относительного пути. 
// Если нет, используйте полный: 'http://localhost:5000/api/users/google'

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