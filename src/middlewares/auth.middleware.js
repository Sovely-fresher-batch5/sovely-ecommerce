import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract the token from the cookies OR the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Use your fallback secret to match the one in User.js
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_secret');

        const user = await User.findById(decodedToken?._id).select("-passwordHash");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// FIX: Added the missing authorize middleware back in!
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized request"));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "You do not have permission to perform this action"));
        }
        
        next();
    };
};