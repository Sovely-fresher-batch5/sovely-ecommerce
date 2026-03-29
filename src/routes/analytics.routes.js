import { Router } from 'express';
import {
    getDashboardAnalytics,
    getResellerAnalytics, // <-- Import the new controller
} from '../controllers/analytics.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Existing admin dashboard route (protect this with an admin middleware if you have one!)
router.route('/dashboard').get(verifyJWT, authorizeRoles('ADMIN'), getDashboardAnalytics);

// --- NEW: Reseller Analytics Hub ---
// Protected by verifyJWT so req.user._id is populated
router.route('/reseller').get(verifyJWT, getResellerAnalytics);

export default router;
