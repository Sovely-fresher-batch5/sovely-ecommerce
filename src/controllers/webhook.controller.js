import mongoose from 'mongoose';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { Invoice } from '../models/Invoice.js'; // NEW IMPORT
import { Payment } from '../models/Payment.js'; // NEW IMPORT
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Handle incoming logistics status updates
 * @route   POST /api/webhooks/logistics
 */
export const handleLogisticsWebhook = asyncHandler(async (req, res) => {
    // 1. --- SECURITY: Verify the Webhook Signature ---
    const signature = req.headers['x-logistics-signature'];
    const webhookSecret = process.env.LOGISTICS_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        throw new ApiError(401, 'Missing webhook signature or secret');
    }

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        throw new ApiError(401, 'Invalid webhook signature');
    }

    // 2. Extract Data
    const { order_id: orderId, awb, current_status, remarks } = req.body;

    const statusMap = {
        PICKED_UP: 'SHIPPED',
        IN_TRANSIT: 'SHIPPED',
        DELIVERED: 'DELIVERED',
        UNDELIVERED: 'NDR',
        RTO_DELIVERED: 'RTO',
        CANCELLED: 'CANCELLED',
    };

    const newInternalStatus = statusMap[current_status?.toUpperCase()];

    if (!newInternalStatus) {
        return res.status(200).json({ received: true, message: 'Status ignored' });
    }

    // 3. Find the Order
    const order = await Order.findOne({ orderId });
    if (!order) {
        return res.status(200).json({ received: true, message: 'Order not found in our system' });
    }

    // 4. --- IDEMPOTENCY CHECK ---
    if (
        order.status === newInternalStatus ||
        ['PROFIT_CREDITED', 'CANCELLED', 'RTO'].includes(order.status)
    ) {
        return res
            .status(200)
            .json({ received: true, message: 'Status already updated previously' });
    }

    // 5. Update Status History
    order.statusHistory.push({
        status: newInternalStatus,
        comment: remarks || `Automated update from courier: ${current_status}`,
    });

    // 6. Handle Specific Business Logic based on Status
    if (newInternalStatus === 'NDR') {
        order.ndrDetails = {
            attemptCount: (order.ndrDetails?.attemptCount || 0) + 1,
            reason: remarks || 'Customer Unavailable (Automated)',
            resellerAction: 'PENDING',
        };
        order.status = 'NDR';
        await order.save();
        return res.status(200).json({ received: true });
    }

    // 7. --- PROFIT PAYOUT LOGIC (ACID Transaction) ---
    if (newInternalStatus === 'DELIVERED') {
        order.status = 'DELIVERED';

        if (order.resellerProfitMargin > 0 && order.paymentMethod === 'COD') {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const updatedReseller = await User.findByIdAndUpdate(
                    order.resellerId,
                    { $inc: { walletBalance: order.resellerProfitMargin } },
                    { new: true, session }
                );

                await WalletTransaction.create(
                    [
                        {
                            resellerId: order.resellerId,
                            type: 'CREDIT',
                            purpose: 'PROFIT_CREDIT',
                            amount: order.resellerProfitMargin,
                            closingBalance: updatedReseller.walletBalance,
                            referenceId: order.orderId,
                            description: `Profit margin credited for automated COD delivery of ${order.orderId}`,
                            status: 'COMPLETED',
                        },
                    ],
                    { session }
                );

                order.statusHistory.push({
                    status: 'PROFIT_CREDITED',
                    comment: `₹${order.resellerProfitMargin} auto-credited to wallet on delivery`,
                });
                order.status = 'PROFIT_CREDITED';

                await order.save({ session });
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                console.error(`Failed to process auto-payout for ${orderId}:`, error);
                throw new ApiError(500, 'Webhook processed but payout failed');
            }
        } else {
            await order.save();
        }
    } else {
        order.status = newInternalStatus;
        await order.save();
    }

    return res.status(200).json({ received: true, status: newInternalStatus });
});

/**
 * @desc    Handle Razorpay successful payment captures
 * @route   POST /api/webhooks/razorpay
 */
export const razorpayWebhook = async (req, res) => {
    // 1. Verify the signature to ensure the request is actually from Razorpay
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If there is no secret configured, fail safely
    if (!secret) {
        console.error('⚠️ Missing RAZORPAY_WEBHOOK_SECRET in .env');
        return res.status(500).json({ status: 'error', message: 'Server configuration error' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
        console.error('⚠️ SECURITY ALERT: Invalid Razorpay Webhook Signature');
        return res.status(400).json({ status: 'error', message: 'Invalid signature' });
    }

    const event = req.body.event;

    // We only care about successful captures for the wallet
    if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check Idempotency: Did the frontend already process this?
            const existingPayment = await Payment.findOne({
                referenceId: razorpayPaymentId,
            }).session(session);
            if (existingPayment) {
                await session.abortTransaction();
                session.endSession();
                return res
                    .status(200)
                    .json({ status: 'ok', message: 'Already processed by frontend' });
            }

            // Find the original invoice via the Razorpay Order ID
            const invoice = await Invoice.findOne({ razorpayOrderId }).session(session);
            if (!invoice || invoice.paymentStatus === 'PAID') {
                await session.abortTransaction();
                session.endSession();
                return res
                    .status(200)
                    .json({ status: 'ok', message: 'Invoice not found or already paid' });
            }

            // --- PROCESS THE LEDGER ---
            await Payment.create(
                [
                    {
                        userId: invoice.resellerId,
                        invoiceId: invoice._id,
                        paymentMethod: 'RAZORPAY',
                        status: 'SUCCESS',
                        referenceId: razorpayPaymentId,
                    },
                ],
                { session }
            );

            invoice.paymentStatus = 'PAID';
            await invoice.save({ session });

            if (invoice.invoiceType === 'WALLET_TOPUP') {
                const updatedUser = await User.findByIdAndUpdate(
                    invoice.resellerId,
                    { $inc: { walletBalance: invoice.grandTotal } },
                    { new: true, session }
                );

                await WalletTransaction.create(
                    [
                        {
                            resellerId: invoice.resellerId,
                            type: 'CREDIT',
                            purpose: 'WALLET_RECHARGE',
                            amount: invoice.grandTotal,
                            closingBalance: updatedUser.walletBalance,
                            referenceId: razorpayPaymentId,
                            description: `Wallet top-up via Webhook Fallback (${razorpayPaymentId})`,
                            status: 'COMPLETED',
                        },
                    ],
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();
            console.log(`✅ Webhook Processed: Wallet Top-up for Order ${razorpayOrderId}`);

            return res.status(200).json({ status: 'ok' });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('❌ Webhook processing error:', error);
            return res.status(500).json({ status: 'error' });
        }
    }

    return res.status(200).json({ status: 'ok' });
};
