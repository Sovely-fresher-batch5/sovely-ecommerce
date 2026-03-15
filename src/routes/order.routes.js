import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
    placeOrder, 
    getMyOrders, 
    getOrderById, 
    cancelOrder, 
    updateOrderStatus, 
    getAllOrders,
    getAnalyticsStats 
} from '../controllers/order.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/admin/all', getAllOrders);
router.get('/analytics/stats', getAnalyticsStats);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', updateOrderStatus);

export default router;