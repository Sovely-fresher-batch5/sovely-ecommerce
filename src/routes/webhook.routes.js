import { Router } from 'express';
import { handleLogisticsWebhook, razorpayWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Endpoint: POST /api/webhooks/logistics
router.post('/logistics', handleLogisticsWebhook);

// Endpoint: POST /api/webhooks/razorpay
router.post('/razorpay', razorpayWebhook);

export default router;
