import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        volume: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
    },
    {
        timestamps: true,
    }
);

export const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
