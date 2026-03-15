import { Router } from "express";
import { getProducts, getProductById, getBestDeals, getAdminProducts, updateAdminProduct, bulkUploadProducts, generateSampleTemplate } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get("/deals", getBestDeals);
router.get("/", getProducts);
router.get("/:productId", getProductById);

router.use('/admin', verifyJWT);

router.get("/admin/all", getAdminProducts);
router.put("/admin/:id", updateAdminProduct);
router.post("/admin/bulk-upload", upload.single("file"), bulkUploadProducts);
router.get("/admin/template", generateSampleTemplate);

export default router;