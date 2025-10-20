import express from 'express';
import { protect } from '../middleware/authMddleware.js';
import { addCommentToPost, getCommentsForPost, deleteComment, updateComment } from '../controllers/commentController.js';

const router = express.Router();

router.route('/:postId')
    .post(protect, addCommentToPost) 
    .get(protect, getCommentsForPost);
router.route('/:id')
    .delete(protect, deleteComment)
    .put(protect, updateComment);


export default router;