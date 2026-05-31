import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kg from '../locales/kg';
import ru from '../locales/ru';
import en from '../locales/en';

const STORAGE_KEY = 'birge_language';
const savedLanguage = localStorage.getItem(STORAGE_KEY);

i18n.use(initReactI18next).init({
    resources: {
        kg: { translation: kg },
        ru: { translation: ru },
        en: { translation: en },
    },
    lng: savedLanguage || 'kg',
    fallbackLng: 'kg',
    interpolation: {
        escapeValue: false,
    },
});

i18n.on('languageChanged', (lng) => {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language;

export default i18n;
