"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchFiltersSchema = exports.initiateCallSchema = exports.sendMessageSchema = exports.preferencesSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ─── AUTH ────────────────────────────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
    }),
    mobileNumber: zod_1.z.string().regex(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' }),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email or mobile number is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
exports.verifyOtpSchema = zod_1.z.object({
    otp: zod_1.z.string().length(6).regex(/^\d{6}$/),
    type: zod_1.z.enum(['email', 'mobile']),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});
// ─── PROFILE ─────────────────────────────────────────────────────────────────
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    height: zod_1.z.number().int().min(100).max(250).optional(),
    weight: zod_1.z.number().int().min(30).max(200).optional(),
    maritalStatus: zod_1.z
        .enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'])
        .optional(),
    motherTongue: zod_1.z.string().max(50).optional(),
    religion: zod_1.z.string().max(50).optional(),
    caste: zod_1.z.string().max(100).optional(),
    subCaste: zod_1.z.string().max(100).optional(),
    gothra: zod_1.z.string().max(100).optional(),
    education: zod_1.z.string().max(100).optional(),
    educationDetails: zod_1.z.string().max(255).optional(),
    institution: zod_1.z.string().max(255).optional(),
    profession: zod_1.z.string().max(100).optional(),
    company: zod_1.z.string().max(255).optional(),
    annualIncome: zod_1.z.number().int().min(0).optional(),
    bio: zod_1.z.string().max(1000).optional(),
    hobbies: zod_1.z.array(zod_1.z.string()).max(10).optional(),
    familyType: zod_1.z.string().max(50).optional(),
    familyStatus: zod_1.z.string().max(50).optional(),
    fatherOccupation: zod_1.z.string().max(100).optional(),
    motherOccupation: zod_1.z.string().max(100).optional(),
    siblings: zod_1.z.number().int().min(0).max(20).optional(),
    city: zod_1.z.string().max(100).optional(),
    district: zod_1.z.string().max(100).optional(),
    state: zod_1.z.string().max(100).optional(),
    pincode: zod_1.z.string().regex(/^\d{6}$/).optional(),
    whatsappNumber: zod_1.z
        .string()
        .regex(/^[6-9]\d{9}$/)
        .optional()
        .nullable(),
    whatsappVisible: zod_1.z.boolean().optional(),
});
// ─── PREFERENCES ─────────────────────────────────────────────────────────────
exports.preferencesSchema = zod_1.z.object({
    minAge: zod_1.z.number().int().min(18).max(70).optional(),
    maxAge: zod_1.z.number().int().min(18).max(70).optional(),
    minHeight: zod_1.z.number().int().min(100).max(250).optional().nullable(),
    maxHeight: zod_1.z.number().int().min(100).max(250).optional().nullable(),
    religion: zod_1.z.array(zod_1.z.string()).optional(),
    caste: zod_1.z.array(zod_1.z.string()).optional(),
    maritalStatus: zod_1.z.array(zod_1.z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'])).optional(),
    motherTongue: zod_1.z.array(zod_1.z.string()).optional(),
    education: zod_1.z.array(zod_1.z.string()).optional(),
    profession: zod_1.z.array(zod_1.z.string()).optional(),
    minIncome: zod_1.z.number().int().min(0).optional().nullable(),
    maxIncome: zod_1.z.number().int().min(0).optional().nullable(),
    preferredCities: zod_1.z.array(zod_1.z.string()).optional(),
    preferredDistricts: zod_1.z.array(zod_1.z.string()).optional(),
    preferredStates: zod_1.z.array(zod_1.z.string()).optional(),
    maxDistance: zod_1.z.number().int().min(0).max(1000).optional().nullable(),
});
// ─── MESSAGES ────────────────────────────────────────────────────────────────
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(5000).optional(),
    type: zod_1.z
        .enum(['TEXT', 'IMAGE', 'VOICE_NOTE', 'VIDEO', 'DOCUMENT'])
        .default('TEXT'),
});
// ─── CALLS ───────────────────────────────────────────────────────────────────
exports.initiateCallSchema = zod_1.z.object({
    receiverId: zod_1.z.string().cuid(),
    type: zod_1.z.enum(['AUDIO', 'VIDEO']),
});
// ─── FILTERS ─────────────────────────────────────────────────────────────────
exports.matchFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    minAge: zod_1.z.coerce.number().int().min(18).max(70).optional(),
    maxAge: zod_1.z.coerce.number().int().min(18).max(70).optional(),
    minHeight: zod_1.z.coerce.number().int().min(100).max(250).optional(),
    maxHeight: zod_1.z.coerce.number().int().min(100).max(250).optional(),
    religion: zod_1.z.string().optional(),
    caste: zod_1.z.string().optional(),
    motherTongue: zod_1.z.string().optional(),
    education: zod_1.z.string().optional(),
    profession: zod_1.z.string().optional(),
    minIncome: zod_1.z.coerce.number().int().optional(),
    maxIncome: zod_1.z.coerce.number().int().optional(),
    city: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    maritalStatus: zod_1.z.string().optional(),
    radius: zod_1.z.coerce.number().int().min(1).max(500).optional(), // km
    sort: zod_1.z.enum(['newest', 'recently_active', 'most_viewed', 'most_liked']).optional(),
});
//# sourceMappingURL=validators.js.map