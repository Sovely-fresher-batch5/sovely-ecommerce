import { WalletTransaction } from '../models/WalletTransaction.js';
import { Customer } from '../models/Customer.js';
import { Counter } from '../models/Counter.js';
import { Invoice } from '../models/Invoice.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { razorpayInstance } from './payment.controller.js';

export const getBalance = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ userId: req.user._id });

    if (!customer) {
        throw new ApiError(404, "Customer profile not found");
    }

    return res.status(200).json(new ApiResponse(200, { 
        balance: customer.walletBalance || 0 
    }, "Wallet balance fetched"));
});

export const getTransactionHistory = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
        throw new ApiError(404, "Customer profile not found");
    }

    const transactions = await WalletTransaction.find({ customerId: customer._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, transactions, "Transaction history fetched"));
});

export const addMoney = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    
    // Find the customer profile first
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
        throw new ApiError(404, "Customer profile not found");
    }

    const customerId = customer._id;

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required to add money");
    }

    // 1. Generate Invoice representation for the Top-up
    const invoiceNumSeq = await Counter.getNextSequenceValue('invoiceNumber');
    const invoiceNumStr = `INV-${invoiceNumSeq.toString().padStart(6, '0')}`;

    const invoice = await Invoice.create({
        invoiceNumber: invoiceNumStr,
        customerId,
        invoiceType: 'WALLET_TOPUP',
        totalAmount: amount,
        paymentTerms: 'DUE_ON_RECEIPT',
        dueDate: new Date(), // Due immediately
        status: 'UNPAID'
    });

    // 2. Create Razorpay Order matching the exact amount (convert to paise)
    const options = {
        amount: Math.round(amount * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: invoiceNumStr,
        payment_capture: 1 // AUTO capture
    };

    try {
        const order = await razorpayInstance.orders.create(options);

        // Send back everything the frontend needs to open the checkout widget
        return res.status(200).json(new ApiResponse(200, {
            invoiceId: invoice._id,
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
        }, "Razorpay order created for wallet topup"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to initialize Razorpay payment");
    }
});
