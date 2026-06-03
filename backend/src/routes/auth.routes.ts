import { Router } from 'express';
import {
  register, login, logout, logoutAll, refreshToken,
  sendEmailOtp, verifyEmailOtp, forgotPassword, resetPassword, changePassword, getMe,
} from '@controllers/auth.controller';
import { authenticate } from '@middleware/auth.middleware';
import { validate } from '@middleware/validate.middleware';
import { authRateLimit, otpRateLimit } from '@middleware/rateLimit.middleware';
import {
  registerSchema, loginSchema, verifyOtpSchema,
  forgotPasswordSchema, resetPasswordSchema, changePasswordSchema,
} from '@utils/validators';

const router = Router();

// Public routes
router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/me', getMe);
router.post('/send-email-otp', otpRateLimit, sendEmailOtp);
router.post('/verify-email', validate(verifyOtpSchema), verifyEmailOtp);
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
