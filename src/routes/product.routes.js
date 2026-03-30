import { Router } from 'express';
import multer from 'multer';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllAdminProducts,
    validateBulkOrder,
} from '../controllers/product.controller.js';
import { importProductsFromCSV } from '../controllers/productImport.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { productValidation } from '../validations/product.validation.js';

// Multer: store CSV in memory (max 50MB for large catalogs)
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

// --- Connectivity Check (Public) ---
router.get('/health', (req, res) => res.json({ status: 'ok', route: '/products/health' }));

// --- Public / Reseller Browsing ---
router.get('/', getProducts);
router.post('/validate-bulk', verifyJWT, validateBulkOrder);

// --- Admin Only Routes (must be BEFORE /:id wildcard) ---
router.get('/admin/all', verifyJWT, authorizeRoles('ADMIN'), getAllAdminProducts);

// CSV Product Mass Import (ADMIN)
router.post(
    '/import-csv',
    verifyJWT,
    authorizeRoles('ADMIN'),
    csvUpload.single('csvFile'),
    importProductsFromCSV
);

router.post(
    '/',
    verifyJWT,
    authorizeRoles('ADMIN'),
    validate(productValidation.createProduct),
    createProduct
);

// --- Wildcard route MUST be last ---
router.get('/:id', getProductById);
router.put('/:id', verifyJWT, authorizeRoles('ADMIN'), updateProduct);
router.delete('/:id', verifyJWT, authorizeRoles('ADMIN'), deleteProduct);

export default router;
