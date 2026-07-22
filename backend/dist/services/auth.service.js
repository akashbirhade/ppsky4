"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("@config/prisma"));
const hash_1 = require("@utils/hash");
const jwt_1 = require("@utils/jwt");
const error_middleware_1 = require("@middleware/error.middleware");
const index_1 = require("@config/index");
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("@utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: index_1.config.smtp.host,
    port: index_1.config.smtp.port,
    secure: index_1.config.smtp.secure,
    auth: { user: index_1.config.smtp.user, pass: index_1.config.smtp.pass },
});
class AuthService {
    // ─── REGISTER ───────────────────────────────────────────────────────────────
    async register(input, ipAddress, userAgent) {
        const { firstName, lastName, email, password, mobileNumber, gender, dateOfBirth } = input;
        // Check duplicates
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { mobileNumber }] },
        });
        if (existing) {
            throw new error_middleware_1.AppError(existing.email === email ? 'Email already registered' : 'Mobile number already registered', 409);
        }
        const dob = new Date(dateOfBirth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18)
            throw new error_middleware_1.AppError('You must be at least 18 years old to register', 400);
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Date.now().toString(36)}`;
        const user = await prisma_1.default.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    username,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    mobileNumber,
                    gender,
                    accountStatus: 'PENDING_VERIFICATION',
                },
            });
            await tx.profile.create({
                data: {
                    userId: newUser.id,
                    firstName,
                    lastName,
                    dateOfBirth: dob,
                    age,
                    height: 165,
                    religion: 'Hindu',
                    caste: 'General',
                    motherTongue: 'Marathi',
                    education: 'Graduate',
                    profession: 'Not specified',
                    annualIncome: 0,
                    state: 'Maharashtra',
                    district: 'Pune',
                    city: 'Pune',
                    latitude: 18.5204,
                    longitude: 73.8567,
                    profileCompletionPercentage: 20,
                },
            });
            await tx.preference.create({
                data: {
                    userId: newUser.id,
                    minAge: gender === 'MALE' ? 18 : 21,
                    maxAge: gender === 'MALE' ? 35 : 45,
                },
            });
            await tx.subscription.create({
                data: { userId: newUser.id, plan: 'FREE', isActive: false },
            });
            return newUser;
        });
        // Issue tokens
        const { accessToken, refreshToken } = await this.issueTokens(user.id, user.email, user.gender, undefined, ipAddress, userAgent);
        // Send OTP
        await this.sendEmailOtp(user.id, email);
        return {
            user: { id: user.id, email: user.email, username: user.username, gender: user.gender },
            accessToken,
            refreshToken,
        };
    }
    // ─── LOGIN ──────────────────────────────────────────────────────────────────
    async login(identifier, password, ipAddress, userAgent) {
        // Support login by email OR mobile number
        const isEmail = identifier.includes('@');
        const user = await prisma_1.default.user.findFirst({
            where: isEmail
                ? { email: identifier.toLowerCase() }
                : { mobileNumber: identifier.replace(/\s+/g, '') },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                gender: true,
                mobileNumber: true,
                accountStatus: true,
                deletedAt: true,
                adminUser: { select: { role: true } },
                profile: { select: { firstName: true, lastName: true, age: true, city: true, religion: true, education: true, profession: true, isVerified: true, height: true, bio: true } },
                subscription: { select: { plan: true, isActive: true } },
                photos: { select: { url: true }, take: 5, orderBy: { order: 'asc' } },
            },
        });
        if (!user || user.deletedAt)
            throw new error_middleware_1.AppError('Invalid email/mobile or password', 401);
        if (user.accountStatus === 'BANNED')
            throw new error_middleware_1.AppError('Your account has been banned', 403);
        if (user.accountStatus === 'SUSPENDED')
            throw new error_middleware_1.AppError('Your account is suspended. Contact support.', 403);
        const isValid = await (0, hash_1.comparePassword)(password, user.password);
        if (!isValid)
            throw new error_middleware_1.AppError('Invalid email/mobile or password', 401);
        const role = user.adminUser?.role;
        const { accessToken, refreshToken } = await this.issueTokens(user.id, user.email, user.gender, role, ipAddress, userAgent);
        // Update last login
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date(), lastActive: new Date(), accountStatus: 'ACTIVE' },
        });
        return {
            user: {
                id: user.id, email: user.email, username: user.username, gender: user.gender, role,
                mobileNumber: user.mobileNumber,
                profile: user.profile,
                subscription: user.subscription,
                photos: user.photos || [],
            },
            accessToken,
            refreshToken,
        };
    }
    // ─── REFRESH TOKEN ──────────────────────────────────────────────────────────
    async refreshToken(token, ipAddress, userAgent) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(token);
        }
        catch {
            throw new error_middleware_1.AppError('Invalid refresh token', 401);
        }
        const stored = await prisma_1.default.refreshToken.findUnique({
            where: { token },
            include: { user: { select: { id: true, email: true, gender: true, accountStatus: true, adminUser: { select: { role: true } } } } },
        });
        if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
            // Potential token theft — revoke all tokens for this user
            if (stored) {
                await prisma_1.default.refreshToken.updateMany({
                    where: { userId: payload.userId },
                    data: { isRevoked: true },
                });
            }
            throw new error_middleware_1.AppError('Invalid or expired refresh token', 401);
        }
        const { user } = stored;
        if (user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
            throw new error_middleware_1.AppError('Account access denied', 403);
        }
        // Revoke old token (rotation)
        await prisma_1.default.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });
        const role = user.adminUser?.role;
        const tokens = await this.issueTokens(user.id, user.email, user.gender, role, ipAddress, userAgent);
        return tokens;
    }
    // ─── LOGOUT ─────────────────────────────────────────────────────────────────
    async logout(refreshToken) {
        await prisma_1.default.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { isRevoked: true },
        });
    }
    async logoutAll(userId) {
        await prisma_1.default.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
    }
    // ─── EMAIL OTP ──────────────────────────────────────────────────────────────
    async sendEmailOtp(userId, email) {
        const otp = (0, hash_1.generateOtp)(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await prisma_1.default.otpVerification.create({
            data: { userId, type: 'email', otp, expiresAt },
        });
        try {
            await transporter.sendMail({
                from: index_1.config.smtp.from,
                to: email,
                subject: 'Verify your Soulmate Sync account',
                html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#7c3aed">Soulmate Sync</h2>
            <p>Your verification OTP is:</p>
            <h1 style="letter-spacing:8px;color:#7c3aed;font-size:40px">${otp}</h1>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color:#888;font-size:12px">If you did not request this, please ignore this email.</p>
          </div>`,
            });
        }
        catch (err) {
            logger_1.default.error('Failed to send email OTP', err);
            // Don't throw — user can request resend
        }
    }
    async verifyEmailOtp(userId, otp) {
        const record = await prisma_1.default.otpVerification.findFirst({
            where: { userId, type: 'email', used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!record)
            throw new error_middleware_1.AppError('OTP expired or not found. Please request a new one.', 400);
        // Track attempts to prevent brute force
        await prisma_1.default.otpVerification.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },
        });
        if (record.attempts >= 5) {
            await prisma_1.default.otpVerification.update({ where: { id: record.id }, data: { used: true } });
            throw new error_middleware_1.AppError('Too many failed attempts. Please request a new OTP.', 429);
        }
        if (record.otp !== otp)
            throw new error_middleware_1.AppError('Invalid OTP', 400);
        await prisma_1.default.$transaction([
            prisma_1.default.otpVerification.update({ where: { id: record.id }, data: { used: true } }),
            prisma_1.default.user.update({
                where: { id: userId },
                data: { emailVerified: true, accountStatus: 'ACTIVE' },
            }),
            prisma_1.default.profile.update({
                where: { userId },
                data: { emailVerificationStatus: 'VERIFIED' },
            }),
        ]);
    }
    // ─── FORGOT / RESET PASSWORD ────────────────────────────────────────────────
    async forgotPassword(email) {
        const user = await prisma_1.default.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user)
            return; // Don't reveal if email exists
        const resetToken = (0, jwt_1.signResetToken)(user.id);
        // Store OTP record as reset type
        const otp = (0, hash_1.generateOtp)(6);
        await prisma_1.default.otpVerification.create({
            data: {
                userId: user.id,
                type: 'password_reset',
                otp,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });
        const resetUrl = `${index_1.config.cors.allowedOrigins[0]}/reset-password?token=${resetToken}&otp=${otp}`;
        try {
            await transporter.sendMail({
                from: index_1.config.smtp.from,
                to: email,
                subject: 'Reset your Soulmate Sync password',
                html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#7c3aed">Password Reset</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
            <p>This link expires in <strong>1 hour</strong>.</p>
            <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
          </div>`,
            });
        }
        catch (err) {
            logger_1.default.error('Failed to send password reset email', err);
        }
    }
    async resetPassword(token, otp, newPassword) {
        let userId;
        try {
            const payload = (0, jwt_1.verifyResetToken)(token);
            userId = payload.userId;
        }
        catch {
            throw new error_middleware_1.AppError('Invalid or expired reset token', 400);
        }
        const record = await prisma_1.default.otpVerification.findFirst({
            where: { userId, type: 'password_reset', otp, used: false, expiresAt: { gt: new Date() } },
        });
        if (!record)
            throw new error_middleware_1.AppError('Invalid or expired reset OTP', 400);
        const hashed = await (0, hash_1.hashPassword)(newPassword);
        await prisma_1.default.$transaction([
            prisma_1.default.otpVerification.update({ where: { id: record.id }, data: { used: true } }),
            prisma_1.default.user.update({ where: { id: userId }, data: { password: hashed } }),
            // Revoke all refresh tokens after password reset
            prisma_1.default.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
        ]);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId }, select: { password: true } });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        const isValid = await (0, hash_1.comparePassword)(currentPassword, user.password);
        if (!isValid)
            throw new error_middleware_1.AppError('Current password is incorrect', 400);
        const hashed = await (0, hash_1.hashPassword)(newPassword);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({ where: { id: userId }, data: { password: hashed } }),
            prisma_1.default.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
        ]);
    }
    // ─── HELPERS ─────────────────────────────────────────────────────────────────
    async issueTokens(userId, email, gender, role, ipAddress, userAgent) {
        const tokenId = (0, hash_1.generateSecureToken)();
        const accessToken = (0, jwt_1.signAccessToken)({ userId, email, gender, role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId, tokenId });
        await prisma_1.default.refreshToken.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress,
                userAgent,
            },
        });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map