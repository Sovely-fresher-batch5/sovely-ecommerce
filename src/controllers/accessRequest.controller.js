import { AccessRequest } from '../models/AccessRequest.js';

export const createAccessRequest = async (req, res, next) => {
    try {
        const { name, email, company, volume, message } = req.body;

        const newRequest = await AccessRequest.create({
            name,
            email,
            company,
            volume,
            message,
        });

        return res.status(201).json({
            success: true,
            message: 'Access request submitted successfully.',
            data: newRequest,
        });
    } catch (error) {
        next(error);
    }
};

export const getAccessRequests = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status.toUpperCase();
        }

        const requests = await AccessRequest.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAccessRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            const error = new Error('Invalid status.');
            error.statusCode = 400;
            throw error;
        }

        if (status === 'REJECTED') {
            const deletedRequest = await AccessRequest.findByIdAndDelete(id);
            if (!deletedRequest) {
                const error = new Error('Access request not found.');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                success: true,
                message: 'Access request has been rejected and deleted successfully.',
            });
        }

        const updatedRequest = await AccessRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            const error = new Error('Access request not found.');
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Access request status updated successfully.',
            data: updatedRequest,
        });
    } catch (error) {
        next(error);
    }
};
