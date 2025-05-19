// models/announcer.model.js
import mongoose from "mongoose";

const announcerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true }, // personality or tone ("sarcastic AI", "epic deep voice")
  voiceStyle: { type: String }, // optional: "dark", "funny", "epic"
  avatar: { type: String }, 
  isAvailable: { type: Boolean, default: true }
});

export default mongoose.model("Announcer", announcerSchema);
