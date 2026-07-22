"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.AppError = void 0;
const logger_1 = __importDefault(require("@utils/logger"));
const index_1 = require("@config/index");
class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 422;
        message = err.message;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (err.code === 'P2002') {
        // Prisma unique constraint violation
        statusCode = 409;
        const field = err.meta?.target?.[0] || 'field';
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    else if (err.code === 'P2025') {
        // Prisma record not found
        statusCode = 404;
        message = 'Record not found';
    }
    // Log errors
    if (statusCode >= 500) {
        logger_1.default.error({
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
        });
    }
    else {
        logger_1.default.warn({ message, url: req.url, method: req.method, statusCode });
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(details ? { details } : {}),
        ...(index_1.config.env === 'development' && statusCode >= 500
            ? { stack: err.stack }
            : {}),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, _res, next) => {
    next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
};
exports.notFound = notFound;
//# sourceMappingURL=error.middleware.js.map