import Announcer from "../models/announcer.model.js";
import Character from "../models/character.model.js";
import Stage from "../models/stage.model.js";
import Weapon from "../models/weapon.model.js";
import simulateFight from "../lib/groq.js"
import GameHistory from "../models/gamehistory.model.js";

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
    res.status(200).json({ announcers: announcers, characters: characters, stages: stages, weapons: weapons });
  } catch (err) {
    console.log("getGameDetails error:", err.message);
    res.status(500).json({ message: "Failed to fetch game details" });
  }
};

export const startBattle = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    console.log("User ID: ", userId);
    const { characterId1, weaponId1, characterId2, weaponId2, stageId, announcerId } = req.body;
    const character1 = await Character.findById(characterId1);
    const character2 = await Character.findById(characterId2);
    const weapon1 = await Weapon.findById(weaponId1);
    const weapon2 = await Weapon.findById(weaponId2);
    const stage = await Stage.findById(stageId);
    const announcer = await Announcer.findById(announcerId);

    // console.log("Battle request payload:", character1, character2, weapon1, weapon2, stage, announcer);

    const winnerId = Math.random() < 0.5 ? characterId1 : characterId2;
    const winnerPlayer = winnerId === characterId1 ? 'Player 1' : 'Player 2'; 
    const winnerWeapon = winnerId === characterId1 ? weaponId1 : weaponId2;
    const loserId = winnerId === characterId1 ? characterId2 : characterId1;

    console.log("Winner: ", winnerId);

    const prompt = `Create a battle scenario story between Player 1 (${character1.name}) and Player 2 (${character2.name}), with ${winnerPlayer} as the winner. Use the following details for reference only (do not copy verbatim):

• Player 1 description: ${character1.prompt}  
• Player 2 description: ${character2.prompt}  

• Player 1’s weapon: ${weapon1.name} (${weapon1.prompt})  
• Player 2’s weapon: ${weapon2.name} (${weapon2.prompt})  

• Player 1’s stats: strength ${character1.strength}, agility ${character1.agility}, battleIQ ${character1.battleIq}  
• Player 2’s stats: strength ${character2.strength}, agility ${character2.agility}, battleIQ ${character2.battleIq}  

They fight on the stage titled “${stage.name}” (description: ${stage.description}). Keep in mind all characters are male. Add creative flair and invent attacks based on these details.

STRUCTURE and INSTRUCTIONS:  
1. Randomly choose 1, 2, or 3 phases.  
2. Write five sections: Intro, Phase 1, if(Phase 2), if(Phase 3), and Conclusion.  
• Tag the Intro paragraph with <intro>…</intro>.  
• Tag each Phase paragraph with <para>…</para>.  
• If the number of phases chosen > 1, then in each Phase paragraph, begin with:  
Phase {number}: **{Phase title}**. , then describe that phase’s content.  
• Start the Conclusion paragraph with <conc>.  
• Do NOT treat the last phase as the conclusion—they are separate.
3. If any word or sentence is to be capitalised, then capitalise it.
4. If any word or sentence is to be bold, then surround it by **{word/sentence to be bold}**.
• In the conclusion paragraph, make the winner character name bold.

WORD LIMIT: Maximum around 400 words total and do NOT abruptly cut off sentences in the end.

NARRATION: Speak as a ${announcer.name} bot (description: ${announcer.description}), Your narration should be in ${announcer.voiceStyle} style.  

Make sure that all instructions are followed for consistency. Start output generation only after thorough checking of all the instructions. Recheck if necessary before submitting final story.
`

    const result = await simulateFight({ prompt, announcer });

    if (userId) {
    await GameHistory.create({
      user: userId,
      character1: characterId1,
      character2: characterId2,
      weapon1: weaponId1,
      weapon2: weaponId2,
      stage: stageId,
      announcer: announcerId,
      winner: winnerId,
      loser: loserId,
      winnerWeapon: winnerWeapon
    });
  }
    return res.json({ result: result, winner: winnerPlayer });
  } catch (err) {
    console.log("startBattle error:", err.message);
    res.status(500).json({ message: "Failed to start battle" });
  }
}