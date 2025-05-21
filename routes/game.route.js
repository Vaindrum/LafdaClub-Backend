import express from "express";
import {
  createAnnouncer,
  createCharacter,
  createStage,
  createWeapon,
  getGameDetails,
} from "../controllers/game.controller.js";

const router = express.Router();

router.post("/announcer", createAnnouncer);
router.post("/character", createCharacter);
router.post("/stage", createStage);
router.post("/weapon", createWeapon);

router.get("/details", getGameDetails);

export default router;
