import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '@utils/jwt';
import prisma from '@config/prisma';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { accountStatus: string };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication token missing', 401);
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, accountStatus: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User account not found', 401);
    }

    if (user.accountStatus === 'BANNED') {
      throw new AppError('Your account has been suspended', 403);
    }

    if (user.accountStatus === 'SUSPENDED') {
      throw new AppError('Your account has been temporarily suspended', 403);
    }

    req.user = { ...payload, accountStatus: user.accountStatus };
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401));
    } else {
      next(error);
    }
  }
};

export const requireVerified = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { emailVerified: true, mobileVerified: true },
    });

    if (!user?.emailVerified && !user?.mobileVerified) {
      throw new AppError('Please verify your email or mobile number to continue', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requirePremium = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      select: { plan: true, isActive: true, endDate: true },
    });

    const isPremium =
      subscription?.isActive &&
      subscription.plan !== 'FREE' &&
      (!subscription.endDate || subscription.endDate > new Date());

    if (!isPremium) {
      throw new AppError('This feature requires a premium subscription', 402);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { userId: req.user.userId },
      select: { role: true, permissions: true },
    });

    if (!admin) {
      throw new AppError('Admin access required', 403);
    }

    req.user = { ...req.user, role: admin.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    req.user = { ...payload, accountStatus: 'ACTIVE' };
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
