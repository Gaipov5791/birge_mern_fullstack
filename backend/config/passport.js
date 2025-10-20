// config/passport.js

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Ваша модель пользователя
import dotenv from 'dotenv';

dotenv.config();

// Убедитесь, что в .env есть:
// CLIENT_DOMAIN=http://localhost:5000 
// GOOGLE_CALLBACK_URL=/api/users/google/callback

// Настройка Google-стратегии
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // ⭐ ИСПРАВЛЕНИЕ: Передаем полный абсолютный URL
        callbackURL: process.env.CLIENT_DOMAIN + process.env.GOOGLE_CALLBACK_URL,
        // ⭐ ДОБАВЛЕНИЕ: Запрашиваем необходимые разрешения
        scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("------------------------------------------");
        console.log("PASSPORT GOOGLE AUTH DEBUG:");
        console.log("Client ID (Первые 5 символов):", process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 5) : 'НЕТ');
        console.log("Client Secret (Длина):", process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 'НЕТ');
        // ⭐ ЛОГ: Проверяем, какой полный URL используется
        console.log("Полный Callback URL, используемый стратегией:", process.env.CLIENT_DOMAIN + process.env.GOOGLE_CALLBACK_URL);
        console.log("------------------------------------------");

        try {
            // Этот лог сработает, только если обмен кода на токен успешен
            if (!accessToken) {
                console.error("DEBUG ERROR: Не удалось получить accessToken. Сбой обмена токенов.");
                return done(null, false, { message: 'Сбой обмена токенов (AccessToken отсутствует).' });
            }
            console.log("🟢 Access Token получен. Начинается поиск/создание пользователя.");
            
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                console.log(`✅ Пользователь найден: ${existingUser.username} (${existingUser._id})`);
                return done(null, existingUser); 
            } else {
                console.log(`⭐ Создание нового пользователя: ${profile.displayName}`);
                const newUser = await User.create({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0]?.value, 
                    profilePicture: profile.photos?.[0]?.value,
                });
                return done(null, newUser);
            }
        } catch (err) {
            console.error("❌ Ошибка при аутентификации через Google:", err);
            return done(err, null);
        }
    })
);

// Passport требует сериализации/десериализации для работы с сессиями.
// Хотя мы в основном используем JWT, эти функции все равно должны быть определены.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;