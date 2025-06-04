import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createComment, deleteComment, reportComment } from "../controllers/comment.controller.js";
import { toggleDislikeComment, toggleLikeComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createComment);
router.delete("/delete/:commentId", protectRoute, deleteComment);
router.post("/like/:commentId", protectRoute, toggleLikeComment);
router.post("/dislike/:commentId", protectRoute, toggleDislikeComment);
router.post("/report", protectRoute, reportComment);

export default router;