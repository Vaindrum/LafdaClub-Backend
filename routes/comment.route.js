import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createComment, deleteComment, reportComment } from "../controllers/comment.controller.js";
import { toggleDislikeComment, toggleLikeComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createComment);
router.post("/delete/:commentId", protectRoute, deleteComment);
router.post("/report/:commentId", protectRoute, reportComment);
router.post("/like/:commentId", protectRoute, toggleLikeComment);
router.post("/dislike/:commentId", protectRoute, toggleDislikeComment);

export default router;