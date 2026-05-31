import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_AUTH_URL = `${API_BASE_URL}/users/google`;

function GoogleAuthButton() {
    const { t } = useTranslation();

    return (
        <a 
            href={GOOGLE_AUTH_URL} 
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 shadow-md transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
            <FaGoogle className="w-5 h-5 mr-3" />
            {t('auth.googleLogin')}
        </a>
    );
}

export default GoogleAuthButton;
