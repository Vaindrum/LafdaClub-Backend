import mongoose from "mongoose";

const stageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true }
});

export default mongoose.model("Stage", stageSchema);
