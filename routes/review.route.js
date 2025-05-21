import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createReview, deleteReview, getReview, getReviews, reportReview, toggleDislikeReview, toggleLikeReview } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createReview); 
router.post("/delete/:reviewId", protectRoute, deleteReview);
router.post("/report/:reviewId", protectRoute, reportReview);
router.post("/like/:reviewId", protectRoute, toggleLikeReview);
router.post("/dislike/:reviewId", protectRoute, toggleDislikeReview);
router.get("/reviews/:productId", getReviews); 
router.get("/:reviewId", getReview);

export default router;