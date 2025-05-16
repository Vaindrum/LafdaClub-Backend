import jwt from "jsonwebtoken";

export const generateToken = (userId,userRole,res) => {
    const token = jwt.sign({userId, userRole}, process.env.JWT_SECRET, {
        expiresIn:"7d"
    });

    res.cookie("jwt",token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        secure:true,
        sameSite: "None",
    })

    return token;
};