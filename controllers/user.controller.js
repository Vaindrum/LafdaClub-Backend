import User from "../models/user.model.js";

export const getUserProfile = async (req,res) => {
    try {
        
        // const {userId} = req.params;
        const user = await User.findById(req.userId).select("-password");
        
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        
        console.log(`Fetched profile for user: ${req.userId}`);
        res.status(200).json(user);

    } catch (error) {
        console.error("Error in getUserProfile controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}