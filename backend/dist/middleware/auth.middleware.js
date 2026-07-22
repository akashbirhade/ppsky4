"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.requirePremium = exports.requireVerified = exports.authenticate = void 0;
const jwt_1 = require("@utils/jwt");
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("./error.middleware");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw new error_middleware_1.AppError('Authentication token missing', 401);
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Verify user still exists and is active
        const user = await prisma_1.default.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, accountStatus: true, deletedAt: true },
        });
        if (!user || user.deletedAt) {
            throw new error_middleware_1.AppError('User account not found', 401);
        }
        if (user.accountStatus === 'BANNED') {
            throw new error_middleware_1.AppError('Your account has been suspended', 403);
        }
        if (user.accountStatus === 'SUSPENDED') {
            throw new error_middleware_1.AppError('Your account has been temporarily suspended', 403);
        }
        req.user = { ...payload, accountStatus: user.accountStatus };
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new error_middleware_1.AppError('Invalid or expired token', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const requireVerified = async (req, _res, next) => {
    try {
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { emailVerified: true, mobileVerified: true },
        });
        if (!user?.emailVerified && !user?.mobileVerified) {
            throw new error_middleware_1.AppError('Please verify your email or mobile number to continue', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireVerified = requireVerified;
const requirePremium = async (req, _res, next) => {
    try {
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        const subscription = await prisma_1.default.subscription.findUnique({
            where: { userId: req.user.userId },
            select: { plan: true, isActive: true, endDate: true },
        });
        const isPremium = subscription?.isActive &&
            subscription.plan !== 'FREE' &&
            (!subscription.endDate || subscription.endDate > new Date());
        if (!isPremium) {
            throw new error_middleware_1.AppError('This feature requires a premium subscription', 402);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requirePremium = requirePremium;
const requireAdmin = async (req, _res, next) => {
    try {
        if (!req.user) {
            throw new error_middleware_1.AppError('Not authenticated', 401);
        }
        const admin = await prisma_1.default.adminUser.findUnique({
            where: { userId: req.user.userId },
            select: { role: true, permissions: true },
        });
        if (!admin) {
            throw new error_middleware_1.AppError('Admin access required', 403);
        }
        req.user = { ...req.user, role: admin.role };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = { ...payload, accountStatus: 'ACTIVE' };
    }
    catch {
        // Silently ignore invalid tokens for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map