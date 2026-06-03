import rateLimit from 'express-rate-limit';
import { config } from '@config/index';
import { AppError } from './error.middleware';

const createHandler = (message: string) =>
  (_req: any, _res: any, next: any) =>
    next(new AppError(message, 429));

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many requests. Please try again later.'),
  skip: () => config.env === 'test',
});

// Strict limiter for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  handler: createHandler('Too many authentication attempts. Please wait 15 minutes.'),
  skip: () => config.env === 'test',
});

// OTP rate limiter
export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many OTP requests. Please wait 10 minutes.'),
  skip: () => config.env === 'test',
});

// Upload rate limiter
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Upload limit reached. Please try again in 1 hour.'),
  skip: () => config.env === 'test',
});
