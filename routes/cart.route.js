import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addToCart, getCart, removeFromCart, updateCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", protectRoute, addToCart); 
router.post("/remove", protectRoute, removeFromCart);
router.post("/update", protectRoute, updateCart);
router.get("/", protectRoute, getCart); 

export default router;