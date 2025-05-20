import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { getAllOrders, getOrder, getOrders, submitOrder, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/submit", protectRoute, submitOrder); 
router.get("/:orderId", protectRoute, getOrder);
router.get("/", protectRoute, getOrders); 
router.get("/orders", protectRoute, adminMiddleware, getAllOrders);
router.post("/status", protectRoute, adminMiddleware, updateOrderStatus);



export default router;