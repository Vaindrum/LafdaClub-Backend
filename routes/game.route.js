import express from "express";
import {
  createAnnouncer,
  createCharacter,
  createStage,
  createWeapon,
  getAnnouncers,
  getCharacters,
  getStages,
  getWeapons
} from "../controllers/game.controller.js";

const router = express.Router();

router.post("/announcer", createAnnouncer);
router.post("/character", createCharacter);
router.post("/stage", createStage);
router.post("/weapon", createWeapon);

router.get("/announcers", getAnnouncers);
router.get("/characters", getCharacters);
router.get("/stages", getStages);
router.get("/weapons", getWeapons);

export default router;
