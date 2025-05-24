import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const tryAuth = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        req.user = null;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }
        req.user = await User.findById(decoded.userId).select("-password");
        next();
    } catch (err) {
        console.log("Error in tryAuth middleware: ", err.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};
