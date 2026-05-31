import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLanguage } from 'react-icons/fa';

const LANGUAGES = [
    { code: 'kg', label: 'КГ' },
    { code: 'ru', label: 'РУ' },
    { code: 'en', label: 'EN' },
];

function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-colors hover:bg-neutral-800 text-gray-300 hover:text-blue-400 focus:outline-none"
                aria-label={t('language.switch')}
                title={t('language.switch')}
            >
                <FaLanguage className="text-2xl" />
                <span className="text-sm font-semibold">{currentLang.label}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 z-50 overflow-hidden">
                    {LANGUAGES.map(({ code, label }) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => handleSelect(code)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-neutral-700 ${
                                i18n.language === code
                                    ? 'text-blue-400 bg-neutral-700/50 font-semibold'
                                    : 'text-gray-300'
                            }`}
                        >
                            {t(`language.${code}`)} ({label})
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;
