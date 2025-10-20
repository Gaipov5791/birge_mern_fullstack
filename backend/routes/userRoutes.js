import express from 'express';
import passport from 'passport';
import { 
    registerUser, 
    loginUser, 
    followUser, 
    unfollowUser, 
    getUserMe,
    getUserProfile,
    getRecommendedUsers,
    updateUserProfile,
    uploadProfilePicture,
    googleAuthSuccess 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

// Маршрут для аутентификации через Google
router.get(
    '/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    // Сначала Passport.js обрабатывает ответ, аутентифицирует и ищет/создает пользователя
    passport.authenticate('google', { 
        failureRedirect: `${process.env.CLIENT_URL}/login?error=authfailed` // Перенаправление в случае сбоя
    }),
    // ⭐ Затем контроллер обрабатывает успех, генерирует JWT и перенаправляет
    googleAuthSuccess 
);

router.post('/register', registerUser);
router.post('/login', loginUser);

// ⭐⭐⭐ 1. Сначала специфичные маршруты (не содержащие ':id') ⭐⭐⭐
router.get('/recommended', protect, getRecommendedUsers); 

// Новые маршруты для подписок
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

// Маршруты для профиля текущего пользователя
router.put('/profile', protect, updateUserProfile); 
router.put(
    '/upload-profile-picture/:id', 
    protect, 
    upload.single('profilePicture'), 
    uploadProfilePicture
);

// ⭐ НОВЫЙ МАРШРУТ: Получение данных текущего пользователя
router.get('/me', protect, getUserMe);

// ⭐⭐⭐ 2. В конце — общий маршрут с параметром (жадный) ⭐⭐⭐
router.get('/:id', protect, getUserProfile); // Получение профиля пользователя по ID

export default router;