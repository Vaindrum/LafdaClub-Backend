import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        googleId:{
            type: String,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            minlength: 8,
        },
        bio:{
            type: String,
            default:""
        },
        profilePic: {
            type: String,
            default: "",
        },
    },
    {timestamps: true}
    // for member since... / join date
)

const User = mongoose.model("User",userSchema);

export default User;