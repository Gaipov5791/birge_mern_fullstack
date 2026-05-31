import { ru, enUS } from 'date-fns/locale';

const localeMap = {
    kg: ru,
    ru,
    en: enUS,
};

export function getDateLocale(language) {
    return localeMap[language] || localeMap.kg;
}
