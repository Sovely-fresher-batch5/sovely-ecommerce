import { Router } from 'express';
import {
    createAccessRequest,
    getAccessRequests,
    updateAccessRequestStatus,
} from '../controllers/accessRequest.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to submit a new access request
router.post('/', createAccessRequest);

// Admin route to view all access requests
router.get('/', verifyJWT, authorizeRoles('ADMIN'), getAccessRequests);

// Admin route to update the status of an access request
router.put('/:id/status', verifyJWT, authorizeRoles('ADMIN'), updateAccessRequestStatus);

export default router;
