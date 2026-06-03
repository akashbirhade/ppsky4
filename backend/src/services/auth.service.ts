import prisma from '@config/prisma';
import { hashPassword, comparePassword, generateOtp, generateSecureToken } from '@utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken } from '@utils/jwt';
import { AppError } from '@middleware/error.middleware';
import { config } from '@config/index';
import nodemailer from 'nodemailer';
import logger from '@utils/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
}

export class AuthService {
  // ─── REGISTER ───────────────────────────────────────────────────────────────

  async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const { firstName, lastName, email, password, mobileNumber, gender, dateOfBirth } = input;

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobileNumber }] },
    });
    if (existing) {
      throw new AppError(
        existing.email === email ? 'Email already registered' : 'Mobile number already registered',
        409
      );
    }

    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) throw new AppError('You must be at least 18 years old to register', 400);

    const hashedPassword = await hashPassword(password);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Date.now().toString(36)}`;

    const user = await prisma.$transaction(async (tx) => {
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
    const { accessToken, refreshToken } = await this.issueTokens(
      user.id, user.email, user.gender, undefined, ipAddress, userAgent
    );

    // Send OTP
    await this.sendEmailOtp(user.id, email);

    return {
      user: { id: user.id, email: user.email, username: user.username, gender: user.gender },
      accessToken,
      refreshToken,
    };
  }

  // ─── LOGIN ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        gender: true,
        accountStatus: true,
        deletedAt: true,
        adminUser: { select: { role: true } },
      },
    });

    if (!user || user.deletedAt) throw new AppError('Invalid email or password', 401);
    if (user.accountStatus === 'BANNED') throw new AppError('Your account has been banned', 403);
    if (user.accountStatus === 'SUSPENDED') throw new AppError('Your account is suspended. Contact support.', 403);

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const role = user.adminUser?.role;
    const { accessToken, refreshToken } = await this.issueTokens(
      user.id, user.email, user.gender, role, ipAddress, userAgent
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), lastActive: new Date(), accountStatus: 'ACTIVE' },
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, gender: user.gender, role },
      accessToken,
      refreshToken,
    };
  }

  // ─── REFRESH TOKEN ──────────────────────────────────────────────────────────

  async refreshToken(token: string, ipAddress?: string, userAgent?: string) {
    let payload: { userId: string; tokenId: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, gender: true, accountStatus: true, adminUser: { select: { role: true } } } } },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      // Potential token theft — revoke all tokens for this user
      if (stored) {
        await prisma.refreshToken.updateMany({
          where: { userId: payload.userId },
          data: { isRevoked: true },
        });
      }
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const { user } = stored;
    if (user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
      throw new AppError('Account access denied', 403);
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    const role = user.adminUser?.role;
    const tokens = await this.issueTokens(user.id, user.email, user.gender, role, ipAddress, userAgent);

    return tokens;
  }

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  // ─── EMAIL OTP ──────────────────────────────────────────────────────────────

  async sendEmailOtp(userId: string, email: string): Promise<void> {
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpVerification.create({
      data: { userId, type: 'email', otp, expiresAt },
    });

    try {
      await transporter.sendMail({
        from: config.smtp.from,
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
    } catch (err) {
      logger.error('Failed to send email OTP', err);
      // Don't throw — user can request resend
    }
  }

  async verifyEmailOtp(userId: string, otp: string): Promise<void> {
    const record = await prisma.otpVerification.findFirst({
      where: { userId, type: 'email', used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new AppError('OTP expired or not found. Please request a new one.', 400);

    // Track attempts to prevent brute force
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (record.attempts >= 5) {
      await prisma.otpVerification.update({ where: { id: record.id }, data: { used: true } });
      throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
    }

    if (record.otp !== otp) throw new AppError('Invalid OTP', 400);

    await prisma.$transaction([
      prisma.otpVerification.update({ where: { id: record.id }, data: { used: true } }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, accountStatus: 'ACTIVE' },
      }),
      prisma.profile.update({
        where: { userId },
        data: { emailVerificationStatus: 'VERIFIED' },
      }),
    ]);
  }

  // ─── FORGOT / RESET PASSWORD ────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return; // Don't reveal if email exists

    const resetToken = signResetToken(user.id);

    // Store OTP record as reset type
    const otp = generateOtp(6);
    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        type: 'password_reset',
        otp,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${config.cors.allowedOrigins[0]}/reset-password?token=${resetToken}&otp=${otp}`;

    try {
      await transporter.sendMail({
        from: config.smtp.from,
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
    } catch (err) {
      logger.error('Failed to send password reset email', err);
    }
  }

  async resetPassword(token: string, otp: string, newPassword: string): Promise<void> {
    let userId: string;
    try {
      const payload = verifyResetToken(token);
      userId = payload.userId;
    } catch {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const record = await prisma.otpVerification.findFirst({
      where: { userId, type: 'password_reset', otp, used: false, expiresAt: { gt: new Date() } },
    });

    if (!record) throw new AppError('Invalid or expired reset OTP', 400);

    const hashed = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.otpVerification.update({ where: { id: record.id }, data: { used: true } }),
      prisma.user.update({ where: { id: userId }, data: { password: hashed } }),
      // Revoke all refresh tokens after password reset
      prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
    ]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) throw new AppError('User not found', 404);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { password: hashed } }),
      prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
    ]);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private async issueTokens(
    userId: string,
    email: string,
    gender: string,
    role?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const tokenId = generateSecureToken();
    const accessToken = signAccessToken({ userId, email, gender, role });
    const refreshToken = signRefreshToken({ userId, tokenId });

    await prisma.refreshToken.create({
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
