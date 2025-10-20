import exppress from 'express';
import { sendFeedback } from '../controllers/feedbackController.js';

const router = exppress.Router();

// @route   POST /api/feedback
// @desc    Отправить отзыв разработчику
// @access  Public
router.post('/', sendFeedback);
export default router;
