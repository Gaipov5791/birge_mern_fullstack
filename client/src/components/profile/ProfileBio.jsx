import React from 'react';
// Импорт FaSave, FaTimes, FaSpinner заменены на встроенные SVG-компоненты для однофайлового режима.

// --- Встроенные компоненты иконок ---
const IconSave = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <path d="M17 21v-8H7v8" />
        <path d="M7 3v5h12" />
    </svg>
);

const IconTimes = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const IconSpinner = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
);
// ---

function ProfileBio({ 
    userProfile, 
    isCurrentUserProfile, 
    editedBio, 
    setEditedBio, 
    isSavingProfile, 
    handleSaveProfile, 
    handleCancelEdit 
}) {
    // Временно пропустим проверку загрузки данных, так как вы запросили только редизайн.
    const bioText = userProfile?.bio || "Пользователь пока ничего не написал о себе.";

    return (
        // ⭐ РЕДИЗАЙН: Тёмный контейнер с акцентной нижней границей и тенью
        <div className="bg-neutral-800 rounded-3xl shadow-xl shadow-neutral-900/50 p-6 mb-8 border-b-4 border-indigo-600">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 border-b border-neutral-700 pb-3">
                <span className="text-indigo-400 mr-2">/</span>
                Биография
            </h2>
            {isCurrentUserProfile ? (
                <div className="mb-4">
                    <textarea
                        // ⭐ РЕДИЗАЙН: Тёмное поле ввода, светлый текст, акцентный фокус
                        className="
                            w-full p-4 border border-neutral-600 rounded-xl bg-neutral-700 
                            text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none 
                            focus:ring-4 
                            focus:ring-indigo-500/50 resize-none transition-colors
                        "
                        rows="5"
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        placeholder="Напишите что-нибудь о себе..."
                        disabled={isSavingProfile}
                    ></textarea>
                    <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0 mt-4">
                        <button
                            onClick={handleSaveProfile}
                            // ⭐ РЕДИЗАЙН: Стилизованная "pill"-кнопка (зелёная)
                            className="
                                w-full sm:w-auto
                                bg-green-600 text-white 
                                px-5 py-2.5 rounded-full  
                                hover:bg-green-500 flex items-center justify-center 
                                font-semibold text-sm  
                                shadow-md transition-colors 
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            disabled={isSavingProfile}
                        >
                            {isSavingProfile ? (
                                <IconSpinner className="animate-spin mr-2 w-4 h-4" />
                            ) : (
                                <IconSave className="mr-2 w-4 h-4" />
                            )}
                            {isSavingProfile ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            onClick={handleCancelEdit} 
                            // ⭐ РЕДИЗАЙН: Стилизованная "pill"-кнопка (серая)
                            className="
                                w-full sm:w-auto
                                bg-neutral-600 text-gray-300 
                                px-5 py-2.5 rounded-full 
                                hover:bg-neutral-500 flex items-center justify-center 
                                font-semibold text-sm
                                shadow-md transition-colors 
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            disabled={isSavingProfile}
                        >
                            <IconTimes className="mr-2 w-4 h-4" /> Отмена
                        </button>
                    </div>
                </div>
            ) : (
                // ⭐ РЕДИЗАЙН: Светлый, легко читаемый текст в тёмной теме
                <p className="text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">
                    {bioText}
                </p>
            )}
        </div>
    );
}

export default ProfileBio;