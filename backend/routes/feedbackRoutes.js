import express from 'express';
import { sendFeedback } from '../controllers/feedbackController.js';
import { feedbackLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Отправить отзыв разработчику
// @access  Public
router.post('/', feedbackLimiter, sendFeedback);

export default router;
