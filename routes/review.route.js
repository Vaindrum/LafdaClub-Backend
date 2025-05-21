import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createReview, deleteReview, getReview, getReviews, reportReview, toggleDislikeReview, toggleLikeReview, getReports } from "../controllers/review.controller.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createReview); 
router.post("/delete/:reviewId", protectRoute, deleteReview);
router.post("/like/:reviewId", protectRoute, toggleLikeReview);
router.post("/dislike/:reviewId", protectRoute, toggleDislikeReview);

router.post("/report", protectRoute, reportReview);
router.get("/reports", protectRoute, adminMiddleware, getReports);

router.get("/reviews/:productId", getReviews);
router.get("/:reviewId", getReview);

export default router;