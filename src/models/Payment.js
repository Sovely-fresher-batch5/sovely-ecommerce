import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    // We make this optional (required: false) so we can use this 
    // same model for Wallet Recharges which don't have an invoice.
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: false 
    }, 
    paymentMethod: { 
        type: String, 
        enum: ['WALLET', 'BANK', 'CARD', 'RAZORPAY'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['SUCCESS', 'FAILED', 'PENDING'], 
        required: true 
    },
    amount: { type: Number, required: true }, // The amount being paid/recharged
    currency: { type: String, default: 'INR' },
    referenceId: { type: String, required: true, unique: true }, // Your internal tracking ID
    
    // Razorpay specific fields for verification and auditing
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);