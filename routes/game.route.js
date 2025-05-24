import express from "express";
import {
  createAnnouncer,
  createCharacter,
  createStage,
  createWeapon,
  getGameDetails,
  startBattle,
} from "../controllers/game.controller.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { tryAuth } from "../middleware/guest.middleware.js";

const router = express.Router();

router.post("/announcer", adminMiddleware, createAnnouncer);
router.post("/character", adminMiddleware, createCharacter);
router.post("/stage", adminMiddleware, createStage);
router.post("/weapon", adminMiddleware, createWeapon);

router.get("/details", getGameDetails);

router.get("/fight", tryAuth, startBattle);

export default router;
