import mongoose from "mongoose";

const weaponSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["melee", "ranged", "magic"], required: true },
  description: { type: String, required: true }, 
  prompt: { type: String, required: true },
  image: { type: String },
});

export default mongoose.model("Weapon", weaponSchema);
