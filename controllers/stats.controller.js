import GameHistory from "../models/gamehistory.model.js";
import Character from "../models/character.model.js";
import Weapon from "../models/weapon.model.js";
import Stage from "../models/stage.model.js";
import Announcer from "../models/announcer.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const fetchUserStats = async (userId) => {
    const totalBattles = await GameHistory.countDocuments({ user: userId });

    const recentBattles = await GameHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("character1 character2 weapon1 weapon2 stage announcer winner loser");

    const favoriteCharacterAgg = await GameHistory.aggregate([
        { $match: { user: userId } },
        {
            $facet: {
                character1: [{ $group: { _id: "$character1", count: { $sum: 1 } } }],
                character2: [{ $group: { _id: "$character2", count: { $sum: 1 } } }]
            }
        },
        { $project: { all: { $concatArrays: ["$character1", "$character2"] } } },
        { $unwind: "$all" },
        { $group: { _id: "$all._id", total: { $sum: "$all.count" } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
    ]);

    let favoriteCharacter = null;
    if (favoriteCharacterAgg.length > 0) {
        favoriteCharacter = await Character.findById(favoriteCharacterAgg[0]._id);
    }

    const favoriteWeaponAgg = await GameHistory.aggregate([
        { $match: { user: userId } },
        {
            $facet: {
                weapon1: [{ $group: { _id: "$weapon1", count: { $sum: 1 } } }],
                weapon2: [{ $group: { _id: "$weapon2", count: { $sum: 1 } } }]
            }
        },
        { $project: { all: { $concatArrays: ["$weapon1", "$weapon2"] } } },
        { $unwind: "$all" },
        { $group: { _id: "$all._id", total: { $sum: "$all.count" } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
    ]);

    let favoriteWeapon = null;
    if (favoriteWeaponAgg.length > 0) {
        favoriteWeapon = await Weapon.findById(favoriteWeaponAgg[0]._id);
    }

    const favoriteStageAgg = await GameHistory.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    let favoriteStage = null;
    if (favoriteStageAgg.length > 0) {
        favoriteStage = await Stage.findById(favoriteStageAgg[0]._id);
    }

    const favoriteAnnouncerAgg = await GameHistory.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$announcer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    let favoriteAnnouncer = null;
    if (favoriteAnnouncerAgg.length > 0) {
        favoriteAnnouncer = await Announcer.findById(favoriteAnnouncerAgg[0]._id);
    }

    return {
        totalBattles,
        recentBattles,
        favoriteCharacter,
        favoriteWeapon,
        favoriteStage,
        favoriteAnnouncer
    };
};

export const getUserStats = async (req, res) => {
    try {
        const userIdParam = req.params.userId;
        const userId = new mongoose.Types.ObjectId(userIdParam);
        console.log(userIdParam);
        console.log(userId);
        const stats = await fetchUserStats(userId);
        console.log(stats);
        res.status(200).json(stats);
    } catch (err) {
        console.log("getUserStats error:", err.message);
        res.status(500).json({ message: "Failed to get User's stats" });
    }
};

export const userLeaderboards = async (req, res) => {
    try {
        const topUsersAgg = await GameHistory.aggregate([
            { $group: { _id: "$user", totalBattles: { $sum: 1 } } },
            { $sort: { totalBattles: -1 } },
            { $limit: 10 }
        ]);

        const topUsers = await Promise.all(topUsersAgg.map(async (entry) => {
            const userStats = await fetchUserStats(entry._id);
            const userDetails = await User.findById(entry._id).select("username profilePic");
            return {
                user: userDetails,
                totalBattles: entry.totalBattles,
                ...userStats
            };
        }));

        return res.status(200).json({ topUsers });
    } catch (err) {
        console.log("userLeaderboards error:", err.message);
        res.status(500).json({ message: "Failed to get user Leaderboards" });
    }
};

export const characterLeaderboards = async (req, res) => {
  try {
    const charAgg = await GameHistory.aggregate([
      {
        $facet: {
          asCharacter1: [
            { $group: { _id: "$character1", played: { $sum: 1 } } }
          ],
          asCharacter2: [
            { $group: { _id: "$character2", played: { $sum: 1 } } }
          ],
          wins: [
            { $group: { _id: "$winner", wins: { $sum: 1 } } }
          ]
        }
      },
      {
        $project: {
          allCharacters: { $concatArrays: ["$asCharacter1", "$asCharacter2"] },
          wins: "$wins"
        }
      },
      { $unwind: "$allCharacters" },
      {
        $group: {
          _id: "$allCharacters._id",
          played: { $sum: "$allCharacters.played" }
        }
      },
      {
        $lookup: {
          from: "gamehistories", // not strictly needed since we have "wins" facet, but this ensures correct wins count
          let: { charId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$winner", "$$charId"] } } },
            { $group: { _id: null, wins: { $sum: 1 } } },
            { $project: { _id: 0, wins: 1 } }
          ],
          as: "winData"
        }
      },
      {
        $addFields: {
          wins: { $ifNull: [{ $arrayElemAt: ["$winData.wins", 0] }, 0] },
          winRatio: {
             $round: [
              {
                $cond: [
                  { $eq: ["$played", 0] },
                  0,
                  { $divide: [{ $ifNull: [{ $arrayElemAt: ["$winData.wins", 0] }, 0] }, "$played"] }
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { winRatio: -1 } },
      { $limit: 10 },
      {
        // Lookup each character’s name & image
        $lookup: {
          from: "characters", // make sure this matches your Characters collection name
          localField: "_id",
          foreignField: "_id",
          as: "characterInfo"
        }
      },
      { $unwind: "$characterInfo" },
      {
        // Final projection to include exactly the fields you want
        $project: {
          _id: 1,
          name: "$characterInfo.name",
          image: "$characterInfo.image",
          played: 1,
          wins: 1,
          winRatio: 1
        }
      }
    ]);

    return res.status(200).json({topCharacters: charAgg});
  } catch (err) {
    console.log("characterLeaderboards error:", err.message);
    return res.status(500).json({ message: "Failed to get character Leaderboards" });
  }
};


export const weaponLeaderboards = async (req, res) => {
  try {
    const weaponAgg = await GameHistory.aggregate([
      {
        $facet: {
          asWeapon1: [
            { $group: { _id: "$weapon1", played: { $sum: 1 } } }
          ],
          asWeapon2: [
            { $group: { _id: "$weapon2", played: { $sum: 1 } } }
          ],
          wins: [
            { $group: { _id: "$winner", wins: { $sum: 1 } } }
          ]
        }
      },
      {
        $project: {
          allWeapons: { $concatArrays: ["$asWeapon1", "$asWeapon2"] },
          wins: "$wins"
        }
      },
      { $unwind: "$allWeapons" },
      {
        $group: {
          _id: "$allWeapons._id",
          played: { $sum: "$allWeapons.played" }
        }
      },
      {
        $lookup: {
          from: "gamehistories",
          let: { weaponId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$winnerWeapon", "$$weaponId"] } } },
            { $group: { _id: null, wins: { $sum: 1 } } },
            { $project: { _id: 0, wins: 1 } }
          ],
          as: "winData"
        }
      },
      {
        $addFields: {
          wins: { $ifNull: [{ $arrayElemAt: ["$winData.wins", 0] }, 0] },
          winRatio: {
             $round: [
              {
                $cond: [
                  { $eq: ["$played", 0] },
                  0,
                  { $divide: [{ $ifNull: [{ $arrayElemAt: ["$winData.wins", 0] }, 0] }, "$played"] }
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { winRatio: -1 } },
      { $limit: 10 },
      {
        // Lookup each character’s name & image
        $lookup: {
          from: "weapons", // make sure this matches your Characters collection name
          localField: "_id",
          foreignField: "_id",
          as: "weaponInfo"
        }
      },
      { $unwind: "$weaponInfo" },
      {
        // Final projection to include exactly the fields you want
        $project: {
          _id: 1,
          name: "$weaponInfo.name",
          image: "$weaponInfo.image",
          played: 1,
          wins: 1,
          winRatio: 1
        }
      }
    ]);

    return res.status(200).json({topWeapons: weaponAgg});
  } catch (err) {
    console.log("weaponLeaderboards error:", err.message);
    return res.status(500).json({ message: "Failed to get weapon Leaderboards" });
  }
};

export const stageLeaderboards = async (req, res) => {
    try {
        const topStages = await GameHistory.aggregate([
            { $group: { _id: "$stage", timesPicked: { $sum: 1 } } },
            { $sort: { timesPicked: -1 } },
            { $limit: 10 },
            {
        // Lookup each character’s name & image
        $lookup: {
          from: "stages", // make sure this matches your Characters collection name
          localField: "_id",
          foreignField: "_id",
          as: "stageInfo"
        }
      },
      { $unwind: "$stageInfo" },
            {
        // Final projection to include exactly the fields you want
        $project: {
          _id: 1,
          name: "$stageInfo.name",
          image: "$stageInfo.image",
          timesPicked: 1
        }
      }
        ]);

        return res.status(200).json({
            topStages: topStages
        })
    } catch (err) {
        console.log("stageLeaderboards error:", err.message);
        res.status(500).json({ message: "Failed to get stage Leaderboards" });
    }
}

export const announcerLeaderboards = async (req, res) => {
    try {
        const topAnnouncers = await GameHistory.aggregate([
            { $group: { _id: "$announcer", timesPicked: { $sum: 1 } } },
            { $sort: { timesPicked: -1 } },
            { $limit: 5 },
            {
        // Lookup each character’s name & image
        $lookup: {
          from: "announcers", // make sure this matches your Characters collection name
          localField: "_id",
          foreignField: "_id",
          as: "announcerInfo"
        }
      },
      { $unwind: "$announcerInfo" },
            {
        // Final projection to include exactly the fields you want
        $project: {
          _id: 1,
          name: "$announcerInfo.name",
          image: "$announcerInfo.image",
          timesPicked: 1
        }
      }
        ]);

        return res.status(200).json({
            topAnnouncers: topAnnouncers
        })
    } catch (err) {
        console.log("announcerLeaderboards error:", err.message);
        res.status(500).json({ message: "Failed to get announcer Leaderboards" });
    }
}