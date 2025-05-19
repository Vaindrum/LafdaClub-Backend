import express from "express";
import { createProduct, getProduct, getProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct); // admin only
router.get("/", getProducts); // merch page
router.get("/:productId", getProduct); // product page

export default router;
