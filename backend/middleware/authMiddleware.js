// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    if (res.headersSent) {
        return next();
    }

    if (req.method === 'OPTIONS') {
        return next();
    }

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (token === 'undefined' || token === '' || token === 'null') {
                console.error('КРИТИЧЕСКАЯ ОШИБКА: Заголовок Bearer содержит:', token);
                return res.status(401).json({ message: 'Заголовок пуст или содержит undefined' });
            }

            if (!token) {
                return res.status(401).json({ message: 'Не авторизован, токен отсутствует' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Не авторизован, пользователь не найден' });
            }

            return next();

        } catch (error) {
            console.error('Ошибка верификации JWT:', error.message);
            return res.status(401).json({ message: 'Не авторизован, токен недействителен' });
        }
    }

    return res.status(401).json({ message: 'Не авторизован, заголовок отсутствует' });
};

export { protect };
