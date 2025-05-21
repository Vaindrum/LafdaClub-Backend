import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { getAllOrders, getOrder, getOrders, submitOrder, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

// admin
router.post("/update", protectRoute, adminMiddleware, updateOrderStatus);
router.get("/allorders", protectRoute, adminMiddleware, getAllOrders);

router.post("/submit", protectRoute, submitOrder); 
router.get("/", protectRoute, getOrders); 
router.get("/:orderId", protectRoute, getOrder);



export default router;