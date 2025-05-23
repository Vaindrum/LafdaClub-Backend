import express from "express";
import {
  createAnnouncer,
  createCharacter,
  createStage,
  createWeapon,
  getGameDetails,
  startBattle,
} from "../controllers/game.controller.js";

const router = express.Router();

router.post("/announcer", createAnnouncer);
router.post("/character", createCharacter);
router.post("/stage", createStage);
router.post("/weapon", createWeapon);

router.get("/details", getGameDetails);

router.get("/fight", startBattle);

export default router;
