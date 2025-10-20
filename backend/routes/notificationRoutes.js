import express from "express";
import { protect } from "../middleware/authMddleware.js";
import { getUnreadConversationsSummary } from "../controllers/notificationController.js";

const router = express.Router();

// @desc    Получить количество непрочитанных сообщений для текущего пользователя
// @route   GET /api/notifications/unread-summary
// @access  Private
router.get('/unread-summary', protect, getUnreadConversationsSummary);

export default router;