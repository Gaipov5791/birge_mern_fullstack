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
    googleAuthSuccess,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=authfailed`,
    }),
    googleAuthSuccess
);

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

router.get('/recommended', protect, getRecommendedUsers);

router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

router.put('/profile', protect, updateUserProfile);
router.put(
    '/upload-profile-picture/:id',
    protect,
    upload.single('profilePicture'),
    uploadProfilePicture
);

router.get('/me', protect, getUserMe);

router.get('/:id', protect, getUserProfile);

export default router;
