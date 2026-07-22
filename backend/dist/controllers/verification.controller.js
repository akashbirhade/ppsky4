"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationStatus = exports.submitVerification = void 0;
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("@middleware/error.middleware");
const submitVerification = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { type, documentUrl, selfieUrl } = req.body;
        if (!type || !documentUrl || !selfieUrl) {
            throw new error_middleware_1.AppError('type, documentUrl, and selfieUrl are required', 400);
        }
        const validTypes = ['aadhaar', 'passport', 'driving_license', 'voter_id'];
        if (!validTypes.includes(type)) {
            throw new error_middleware_1.AppError(`Invalid document type. Must be one of: ${validTypes.join(', ')}`, 400);
        }
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId },
            select: { govtIdVerificationStatus: true },
        });
        if (!profile)
            throw new error_middleware_1.AppError('Profile not found', 404);
        if (profile.govtIdVerificationStatus === 'VERIFIED') {
            return res.json({ success: true, message: 'Already verified', status: 'VERIFIED' });
        }
        await prisma_1.default.profile.update({
            where: { userId },
            data: {
                govtIdVerificationStatus: 'PENDING',
                govtIdType: type,
            },
        });
        res.json({
            success: true,
            message: 'Verification submitted successfully. We will review within 24-48 hours.',
            status: 'PENDING',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.submitVerification = submitVerification;
const getVerificationStatus = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma_1.default.profile.findUnique({
            where: { userId },
            select: {
                govtIdVerificationStatus: true,
                isVerified: true,
                verificationBadge: true,
                profileVerifiedAt: true,
            },
        });
        if (!profile)
            throw new error_middleware_1.AppError('Profile not found', 404);
        res.json({
            success: true,
            data: {
                status: profile.govtIdVerificationStatus || 'NOT_SUBMITTED',
                isVerified: profile.isVerified,
                hasBadge: profile.verificationBadge,
                verifiedAt: profile.profileVerifiedAt,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getVerificationStatus = getVerificationStatus;
//# sourceMappingURL=verification.controller.js.map