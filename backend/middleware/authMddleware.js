// backend/middleware/authMddleware.js

import jwt from 'jsonwebtoken'; // 👈 ДОБАВИТЬ ЭТО
import User from '../models/User.js'; // 👈 ДОБАВИТЬ ЭТО (путь может отличаться)

const protect = async (req, res, next) => {
    
    // ⭐ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Блокируем, если ответ уже отправлен...
    if (res.headersSent) {
        return next(); 
    }
    
    // 1. Исключаем OPTIONS
    if (req.method === 'OPTIONS') {
        return next(); 
    }
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // ⭐ ВРЕМЕННОЕ ЛОГИРОВАНИЕ
        if (token === 'undefined' || token === '' || token === 'null') {
             console.error('КРИТИЧЕСКАЯ ОШИБКА: Заголовок Bearer содержит:', token);
             // НЕ РЕКОМЕНДУЕТСЯ В ПРОДАКШЕНЕ, но временно для диагностики:
             return res.status(401).json({ message: 'Заголовок пуст или содержит undefined' });
        }
            
            if (!token) { 
                 return res.status(401).json({ message: 'Не авторизован, токен отсутствует' });
            }
            
            // ⭐ 1. ВЕРИФИКАЦИЯ ТОКЕНА
            // КОД В ЭТОМ МЕСТЕ ИСПРАВЛЕН
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            
            // ⭐ 2. ПОИСК ПОЛЬЗОВАТЕЛЯ И УСТАНОВКА req.user
            // КОД В ЭТОМ МЕСТЕ ИСПРАВЛЕН
            req.user = await User.findById(decoded.id).select('-password'); 

            // ⭐ 3. ПРОВЕРКА: Если пользователь не найден после верификации токена
            if (!req.user) {
                // Если токен верен, но пользователь удален или не найден
                return res.status(401).json({ message: 'Не авторизован, пользователь не найден' });
            }
            
            // ⭐ УСПЕХ: Гарантируем выход
            return next(); 

        } catch (error) {
            // ОШИБКА ВЕРИФИКАЦИИ
            console.error('Ошибка верификации JWT:', error.message);
            // ⭐ ПРОВАЛ: Гарантируем отправку ответа
            return res.status(401).json({ message: 'Не авторизован, токен недействителен' });
        }
    } 
    
    // ⭐ ПРОВАЛ: Если нет заголовка. Гарантируем отправку ответа
    return res.status(401).json({ message: 'Не авторизован, заголовок отсутствует' });
};

export { protect };