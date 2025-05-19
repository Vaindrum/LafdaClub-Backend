import mongoose from "mongoose";

const weaponSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["melee", "ranged", "magic"], required: true },
  description: { type: String, required: true }, 
  damage: { type: Number, default: 25 },
  accuracy: { type: Number, default: 50 },
  image: { type: String },
  isLegendary: { type: Boolean, default: false }
});

export default mongoose.model("Weapon", weaponSchema);
