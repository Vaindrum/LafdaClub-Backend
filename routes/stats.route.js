import express from "express";
import { announcerLeaderboards, characterLeaderboards, getUserStats, stageLeaderboards, userLeaderboards, weaponLeaderboards } from "../controllers/stats.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/user/:userId", getUserStats);
router.get("/userLeaderboards", userLeaderboards);
router.get("/characterLeaderboards", characterLeaderboards);
router.get("/weaponLeaderboards", weaponLeaderboards);
router.get("/stageLeaderboards", stageLeaderboards);
router.get("/announcerLeaderboards", announcerLeaderboards);

export default router;