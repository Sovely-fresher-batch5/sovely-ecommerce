import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
    resellerProfit: { type: Number, default: 0 },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    qty: { type: Number, required: true, min: 1 }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, required: true },
    comment: { type: String },
    date: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, 
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    }, 
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    statusHistory: [statusHistorySchema],
    tracking: {
        courierName: { type: String },
        trackingNumber: { type: String },
        trackingUrl: { type: String }
    },
    paymentTerms: {
        type: String,
        enum: ['DUE_ON_RECEIPT', 'NET_15', 'NET_30'],
        default: 'DUE_ON_RECEIPT'
    },
    paymentMethod: {
        type: String,
        enum: ['RAZORPAY', 'WALLET', 'BANK_TRANSFER'],
        default: 'RAZORPAY'
    },
    totalAmount: { type: Number, required: true },
    resellerProfit: { type: Number, default: 0 },
    items: [orderItemSnapshotSchema],
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({ status: this.status, comment: 'Order placed successfully' });
    }
    if (!this.isNew && this.isModified('status')) {
        this.statusHistory.push({ status: this.status, comment: `Order marked as ${this.status}` });
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);