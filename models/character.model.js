import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
    {
    name: {
        type: String, 
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    image:{
        type: String,
    },
    weapon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Weapon" 
    },
    strength: {
        type: Number,
        default: 50
    },
    agility: {
        type: Number,
        default: 50
    },
    intelligence: {
        type: Number,
        default: 50
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}
);

const Character = mongoose.model("Character", characterSchema);

export default Character;