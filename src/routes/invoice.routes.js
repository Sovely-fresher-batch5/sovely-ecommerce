import { Router } from 'express';
import {
    getInvoice,
    listMyInvoices,
    markAsPaidManual,
    generateInvoicePDF,
    getAllInvoices // NEW IMPORT
} from '../controllers/invoice.controller.js';
import { verifyJWT, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listMyInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', generateInvoicePDF);

// ADMIN ROUTES
router.get('/admin/all', authorize('ADMIN'), getAllInvoices); // NEW ROUTE
router.put('/:id/manual-payment', authorize('ADMIN'), markAsPaidManual);

export default router;