import React from 'react';
import { FaChevronLeft, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FeedbackForm from '../components/FeedbackForm';

function FeedbackPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

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
                        <FaEnvelope className="mr-3 text-blue-400" /> {t('feedback.title')}
                    </h1>
                </header>

                <div className="p-4 sm:p-6">
                    <p className="text-gray-400 mb-6">
                        {t('feedback.intro')}
                    </p>
                    
                    <FeedbackForm />

                    <div className="mt-8 p-4 bg-neutral-800 rounded-lg text-sm text-gray-500">
                        <p>{t('feedback.note')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedbackPage;
