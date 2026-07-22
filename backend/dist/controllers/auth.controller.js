"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.verifyEmailOtp = exports.sendEmailOtp = exports.refreshToken = exports.logoutAll = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("@services/auth.service");
const index_1 = require("@config/index");
const authService = new auth_service_1.AuthService();
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: index_1.config.isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body, req.ip, req.headers['user-agent']);
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password, req.ip, req.headers['user-agent']);
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token) {
            await authService.logout(token);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
const logoutAll = async (req, res, next) => {
    try {
        await authService.logoutAll(req.user.userId);
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out from all devices' });
    }
    catch (err) {
        next(err);
    }
};
exports.logoutAll = logoutAll;
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            res.status(401).json({ success: false, message: 'Refresh token missing' });
            return;
        }
        const result = await authService.refreshToken(token, req.ip, req.headers['user-agent']);
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        res.json({
            success: true,
            data: { accessToken: result.accessToken, refreshToken: result.refreshToken },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
const sendEmailOtp = async (req, res, next) => {
    try {
        const user = await Promise.resolve().then(() => __importStar(require('@config/prisma'))).then(m => m.default.user.findUnique({ where: { id: req.user.userId }, select: { email: true } }));
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        await authService.sendEmailOtp(req.user.userId, user.email);
        res.json({ success: true, message: 'OTP sent to your email address' });
    }
    catch (err) {
        next(err);
    }
};
exports.sendEmailOtp = sendEmailOtp;
const verifyEmailOtp = async (req, res, next) => {
    try {
        await authService.verifyEmailOtp(req.user.userId, req.body.otp);
        res.json({ success: true, message: 'Email verified successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmailOtp = verifyEmailOtp;
const forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, otp, password } = req.body;
        await authService.resetPassword(token, otp, password);
        res.json({ success: true, message: 'Password reset successfully. Please login.' });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user.userId, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.changePassword = changePassword;
const getMe = async (req, res, next) => {
    try {
        const user = await Promise.resolve().then(() => __importStar(require('@config/prisma'))).then(m => m.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                gender: true,
                accountStatus: true,
                emailVerified: true,
                mobileVerified: true,
                lastLogin: true,
                createdAt: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        age: true,
                        city: true,
                        profileCompletionPercentage: true,
                        isVerified: true,
                    },
                },
                photos: { where: { isMain: true }, select: { url: true } },
                subscription: { select: { plan: true, isActive: true, endDate: true } },
            },
        }));
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map