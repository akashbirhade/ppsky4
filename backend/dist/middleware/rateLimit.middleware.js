"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRateLimit = exports.otpRateLimit = exports.authRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_1 = require("@config/index");
const error_middleware_1 = require("./error.middleware");
const createHandler = (message) => (_req, _res, next) => next(new error_middleware_1.AppError(message, 429));
// General API rate limiter
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: index_1.config.rateLimit.windowMs,
    max: index_1.config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createHandler('Too many requests. Please try again later.'),
    skip: () => index_1.config.env === 'test',
});
// Strict limiter for auth endpoints
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: index_1.config.rateLimit.authMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'unknown',
    handler: createHandler('Too many authentication attempts. Please wait 15 minutes.'),
    skip: () => index_1.config.env === 'test' || index_1.config.env === 'development',
});
// OTP rate limiter
exports.otpRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createHandler('Too many OTP requests. Please wait 10 minutes.'),
    skip: () => index_1.config.env === 'test',
});
// Upload rate limiter
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createHandler('Upload limit reached. Please try again in 1 hour.'),
    skip: () => index_1.config.env === 'test',
});
//# sourceMappingURL=rateLimit.middleware.js.map