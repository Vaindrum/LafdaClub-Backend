import Announcer from "../models/announcer.model.js";
import Character from "../models/character.model.js";
import Stage from "../models/stage.model.js";
import Weapon from "../models/weapon.model.js";

export const createAnnouncer = async (req, res) => {
  try {
    const announcer = await Announcer.create(req.body);
    res.status(201).json(announcer);
  } catch (err) {
    console.log("createAnnouncer error:", err.message);
    res.status(500).json({ message: "Failed to create announcer" });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const character = await Character.create(req.body);
    res.status(201).json(character);
  } catch (err) {
    console.log("createCharacter error:", err.message);
    res.status(500).json({ message: "Failed to create character" });
  }
};

export const createStage = async (req, res) => {
  try {
    const stage = await Stage.create(req.body);
    res.status(201).json(stage);
  } catch (err) {
    console.log("createStage error:", err.message);
    res.status(500).json({ message: "Failed to create stage" });
  }
};

export const createWeapon = async (req, res) => {
  try {
    const weapon = await Weapon.create(req.body);
    res.status(201).json(weapon);
  } catch (err) {
    console.log("createWeapon error:", err.message);
    res.status(500).json({ message: "Failed to create weapon" });
  }
};


export const getGameDetails = async (req, res) => {
  try {
    // const announcers = await Announcer.find();
    const characters = await Character.find();
    const stages = await Stage.find();
    const weapons = await Weapon.find();
    res.status(200).json({characters: characters, stages: stages, weapons: weapons});
  } catch (err) {
    console.log("getGameDetails error:", err.message);
    res.status(500).json({ message: "Failed to fetch game details" });
  }
};
