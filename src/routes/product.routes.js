import { Router } from "express";
import { getProducts, getProductById, getBestDeals } from "../controllers/product.controller.js";

const router = Router();

// Public routes for product catalog
router.get("/deals", getBestDeals); // Top priority
router.get("/", getProducts);
router.get("/:productId", getProductById);

export default router;
