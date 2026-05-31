import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const LoadingModal = ({ isOpen, message }) => {
    const { t } = useTranslation();
    const displayMessage = message ?? t('common.loading');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-neutral-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-solid border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm sm:text-base">{displayMessage}</p>
            </div>
        </div>
    );
};

LoadingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    message: PropTypes.string,
};

export default LoadingModal;
