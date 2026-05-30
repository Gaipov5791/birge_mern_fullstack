import express from 'express';
import { getTrends } from '../controllers/trendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Получить список актуальных трендов
// @route   GET /api/trends
// @access  Public (Незащищенный, чтобы все могли видеть тренды)
router.get('/', getTrends); 


export default router;