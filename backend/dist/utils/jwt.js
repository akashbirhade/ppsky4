"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signResetToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("@config/index");
const signAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, index_1.config.jwt.accessSecret, {
        expiresIn: index_1.config.jwt.accessExpiry,
        issuer: 'soulmate-sync',
        audience: 'soulmate-sync-client',
    });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, index_1.config.jwt.refreshSecret, {
        expiresIn: index_1.config.jwt.refreshExpiry,
        issuer: 'soulmate-sync',
        audience: 'soulmate-sync-client',
    });
};
exports.signRefreshToken = signRefreshToken;
const signResetToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, index_1.config.jwt.resetSecret, {
        expiresIn: index_1.config.jwt.resetExpiry,
        issuer: 'soulmate-sync',
    });
};
exports.signResetToken = signResetToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_1.config.jwt.accessSecret, {
        issuer: 'soulmate-sync',
        audience: 'soulmate-sync-client',
    });
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_1.config.jwt.refreshSecret, {
        issuer: 'soulmate-sync',
        audience: 'soulmate-sync-client',
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyResetToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_1.config.jwt.resetSecret, {
        issuer: 'soulmate-sync',
    });
};
exports.verifyResetToken = verifyResetToken;
//# sourceMappingURL=jwt.js.map