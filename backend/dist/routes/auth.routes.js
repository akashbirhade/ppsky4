"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("@controllers/auth.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const validate_middleware_1 = require("@middleware/validate.middleware");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const validators_1 = require("@utils/validators");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', rateLimit_middleware_1.authRateLimit, (0, validate_middleware_1.validate)(validators_1.registerSchema), auth_controller_1.register);
router.post('/login', rateLimit_middleware_1.authRateLimit, (0, validate_middleware_1.validate)(validators_1.loginSchema), auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/forgot-password', rateLimit_middleware_1.authRateLimit, (0, validate_middleware_1.validate)(validators_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.post('/reset-password', (0, validate_middleware_1.validate)(validators_1.resetPasswordSchema), auth_controller_1.resetPassword);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/logout', auth_controller_1.logout);
router.post('/logout-all', auth_controller_1.logoutAll);
router.get('/me', auth_controller_1.getMe);
router.post('/send-email-otp', rateLimit_middleware_1.otpRateLimit, auth_controller_1.sendEmailOtp);
router.post('/verify-email', (0, validate_middleware_1.validate)(validators_1.verifyOtpSchema), auth_controller_1.verifyEmailOtp);
router.post('/change-password', (0, validate_middleware_1.validate)(validators_1.changePasswordSchema), auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map