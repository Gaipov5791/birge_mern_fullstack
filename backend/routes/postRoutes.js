import express from "express";
import { 
    createPost, 
    getPosts, 
    getUserPosts, 
    likePost, 
    deletePost, 
    updatePost,
    getPostById,
    getTimelinePosts,
    getPostsByHashtag 
} from "../controllers/postController.js";
import { protect } from "../middleware/authMddleware.js";
import upload from "../config/cloudinaryConfig.js"; // Импорт middleware для загрузки файлов

const router = express.Router();

router.get("/timeline", protect, getTimelinePosts);

router.post("/create", protect, upload.array('files', 5), createPost);
router.get("/", protect, getPosts);
router.get("/hashtag/:tag_name", protect, getPostsByHashtag);
router.get("/user/:userId", protect, getUserPosts);
router.put("/like/:id", protect, likePost);
router.get("/:id", protect, getPostById); 
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);

export default router;