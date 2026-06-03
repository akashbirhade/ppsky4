import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/auth.service';
import { config } from '@config/index';

const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(
      req.body,
      req.ip,
      req.headers['user-agent']
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
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
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logoutAll(req.user!.userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
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
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const sendEmailOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await import('@config/prisma').then(m =>
      m.default.user.findUnique({ where: { id: req.user!.userId }, select: { email: true } })
    );
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await authService.sendEmailOtp(req.user!.userId, user.email);
    res.json({ success: true, message: 'OTP sent to your email address' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.verifyEmailOtp(req.user!.userId, req.body.otp);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, otp, password } = req.body;
    await authService.resetPassword(token, otp, password);
    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await import('@config/prisma').then(m =>
      m.default.user.findUnique({
        where: { id: req.user!.userId },
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
      })
    );

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
