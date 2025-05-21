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


export const getAnnouncers = async (req, res) => {
  try {
    const announcers = await Announcer.find();
    res.status(200).json(announcers);
  } catch (err) {
    console.log("getAnnouncers error:", err.message);
    res.status(500).json({ message: "Failed to fetch announcers" });
  }
};

export const getCharacters = async (req, res) => {
  try {
    const characters = await Character.find();
    res.status(200).json(characters);
  } catch (err) {
    console.log("getCharacters error:", err.message);
    res.status(500).json({ message: "Failed to fetch characters" });
  }
};

export const getStages = async (req, res) => {
  try {
    const stages = await Stage.find();
    res.status(200).json(stages);
  } catch (err) {
    console.log("getStages error:", err.message);
    res.status(500).json({ message: "Failed to fetch stages" });
  }
};

export const getWeapons = async (req, res) => {
  try {
    const weapons = await Weapon.find();
    res.status(200).json(weapons);
  } catch (err) {
    console.log("getWeapons error:", err.message);
    res.status(500).json({ message: "Failed to fetch weapons" });
  }
};
