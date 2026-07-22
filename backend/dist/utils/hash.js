"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureToken = exports.generateOtp = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("@config/index");
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, index_1.config.security.bcryptSaltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateOtp = (length = 6) => {
    const crypto = require('crypto');
    return crypto.randomInt(10 ** (length - 1), 10 ** length - 1).toString();
};
exports.generateOtp = generateOtp;
const generateSecureToken = () => {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
};
exports.generateSecureToken = generateSecureToken;
//# sourceMappingURL=hash.js.map