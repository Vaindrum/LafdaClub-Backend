import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  character1: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
  character2: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
  weapon1: { type: mongoose.Schema.Types.ObjectId, ref: "Weapon" },
  weapon2: { type: mongoose.Schema.Types.ObjectId, ref: "Weapon" },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
  announcer: { type: mongoose.Schema.Types.ObjectId, ref: "Announcer" },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("GameHistory", gameHistorySchema);
