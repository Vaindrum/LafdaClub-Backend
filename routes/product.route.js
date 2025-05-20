import express from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js"; 

const router = express.Router();

router.post("/create", protectRoute, adminMiddleware, createProduct); 
router.post("/update/:productId", protectRoute, adminMiddleware, updateProduct); 
router.post("/delete/:productId", protectRoute, adminMiddleware, deleteProduct); 
router.get("/", getProducts); // merch page
router.get("/:productId", getProduct); // product page

export default router;
