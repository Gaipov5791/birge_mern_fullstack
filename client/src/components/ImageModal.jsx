import React from 'react';
// import { FaTimes } from 'react-icons/fa'; // Заменен на встроенный SVG для компиляции

// --- Встроенный компонент иконки (замена FaTimes) ---
const IconTimes = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
// ---

function ImageModal({ isOpen, imageUrl, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            // ⭐ РЕДИЗАЙН: Глубокий, размытый фон
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
            <div
                className="relative flex items-center justify-center bg-transparent max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ⭐ РЕДИЗАЙН: Акцентная кнопка закрытия с тенью */}
                <button
                    className="absolute top-4 right-4 text-white text-3xl font-bold bg-indigo-600 rounded-full p-2 hover:bg-red-600 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400/50 w-10 h-10 flex items-center justify-center"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    <IconTimes className="w-6 h-6" />
                </button>
                <img
                    src={imageUrl}
                    alt="Профиль"
                    // ⭐ РЕДИЗАЙН: Скругленные углы и контрастный ободок
                    className="max-w-full max-h-screen h-auto max-h-[80vh] object-contain w-auto rounded-xl shadow-2xl border-2 border-neutral-700 ring-4 ring-indigo-500/30"
                />
            </div>
        </div>
    );
}

export default ImageModal;
