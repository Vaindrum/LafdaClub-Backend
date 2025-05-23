import Announcer from "../models/announcer.model.js";
import Character from "../models/character.model.js";
import Stage from "../models/stage.model.js";
import Weapon from "../models/weapon.model.js";
import simulateFight from "../lib/groq.js"

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
    const announcers = await Announcer.find();
    const characters = await Character.find();
    const stages = await Stage.find();
    const weapons = await Weapon.find();
    res.status(200).json({announcers: announcers, characters: characters, stages: stages, weapons: weapons});
  } catch (err) {
    console.log("getGameDetails error:", err.message);
    res.status(500).json({ message: "Failed to fetch game details" });
  }
};

export const startBattle = async(req,res) => {
  try{
    const {characterId1, weaponId1, characterId2, weaponId2, stageId, announcerId} = req.body;
    const character1 = await Character.findById(characterId1);
    const character2 = await Character.findById(characterId2);
    const weapon1 = await Weapon.findById(weaponId1);
    const weapon2 = await Weapon.findById(weaponId2);
    const stage = await Stage.findById(stageId);
    const announcer = await Announcer.findById(announcerId);

    // console.log("Battle request payload:", character1, character2, weapon1, weapon2, stage, announcer);

    const winner = Math.random() < 0.5 ? 'Player 1' : 'Player 2';

    console.log(winner);

    const prompt = `Create a battle scenario story between Player 1 (${character1}) and Player 2 (${character2}) where the final winner after a tough fought out battle is to be ${winner}: Player 1 description: ${character1.prompt} & Player 2 description: ${character2.prompt}. Player 1's weapon is ${weapon1.name} and its description is ${weapon1.prompt} & Player 2's weapon is ${weapon2.name} and its description is ${weapon2.prompt}. Player 1's stats - strength:${character1.strength}, agility:${character1.agility} , battleIq:${character1.battleIq} & Player 2's stats - strength:${character2.strength}, agility:${character2.agility}, battleIq:${character2.battleIq}. They are having an epic battle on the stage titled '${stage.name}' which has the following description: ${stage.description}. These details about the characters, weapons and stages are just for reference. Do not use them as it is in your story. Add some flair and use creative thinking to make up attacks or scenarios based up on those details.)`

    const result = await simulateFight({prompt, announcer});

    return res.json({result});
  } catch (err){
    console.log("startBattle error:", err.message);
    res.status(500).json({ message: "Failed to start battle" });
  }
}