import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getUnreadCount,
    getNotifications,
    markAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-as-read', protect, markAsRead);
router.get('/', protect, getNotifications);

export default router;
