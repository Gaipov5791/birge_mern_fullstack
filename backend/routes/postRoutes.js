import express from "express";
import multer from "multer";
import {
    createPost,
    getPosts,
    getUserPosts,
    likePost,
    deletePost,
    updatePost,
    getPostById,
    getTimelinePosts,
    getPostsByHashtag,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinaryConfig.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.array('files', 5)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Файл слишком большой (максимум 10 МБ)' });
            }
            return res.status(400).json({ message: err.message });
        }
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.get("/timeline", protect, getTimelinePosts);

router.post('/create', protect, handleUpload, createPost);router.get("/", protect, getPosts);
router.get("/hashtag/:tag_name", protect, getPostsByHashtag);
router.get("/user/:userId", protect, getUserPosts);
router.put("/like/:id", protect, likePost);
router.get("/:id", protect, getPostById); 
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);

export default router;