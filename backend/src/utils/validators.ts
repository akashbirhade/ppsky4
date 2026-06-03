import { z } from 'zod';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message:
        'Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
    }),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6).regex(/^\d{6}$/),
  type: z.enum(['email', 'mobile']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  height: z.number().int().min(100).max(250).optional(),
  weight: z.number().int().min(30).max(200).optional(),
  maritalStatus: z
    .enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'])
    .optional(),
  motherTongue: z.string().max(50).optional(),
  religion: z.string().max(50).optional(),
  caste: z.string().max(100).optional(),
  subCaste: z.string().max(100).optional(),
  gothra: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  educationDetails: z.string().max(255).optional(),
  institution: z.string().max(255).optional(),
  profession: z.string().max(100).optional(),
  company: z.string().max(255).optional(),
  annualIncome: z.number().int().min(0).optional(),
  bio: z.string().max(1000).optional(),
  hobbies: z.array(z.string()).max(10).optional(),
  familyType: z.string().max(50).optional(),
  familyStatus: z.string().max(50).optional(),
  fatherOccupation: z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),
  siblings: z.number().int().min(0).max(20).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .nullable(),
  whatsappVisible: z.boolean().optional(),
});

// ─── PREFERENCES ─────────────────────────────────────────────────────────────

export const preferencesSchema = z.object({
  minAge: z.number().int().min(18).max(70).optional(),
  maxAge: z.number().int().min(18).max(70).optional(),
  minHeight: z.number().int().min(100).max(250).optional().nullable(),
  maxHeight: z.number().int().min(100).max(250).optional().nullable(),
  religion: z.array(z.string()).optional(),
  caste: z.array(z.string()).optional(),
  maritalStatus: z.array(z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'])).optional(),
  motherTongue: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  profession: z.array(z.string()).optional(),
  minIncome: z.number().int().min(0).optional().nullable(),
  maxIncome: z.number().int().min(0).optional().nullable(),
  preferredCities: z.array(z.string()).optional(),
  preferredDistricts: z.array(z.string()).optional(),
  preferredStates: z.array(z.string()).optional(),
  maxDistance: z.number().int().min(0).max(1000).optional().nullable(),
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  type: z
    .enum(['TEXT', 'IMAGE', 'VOICE_NOTE', 'VIDEO', 'DOCUMENT'])
    .default('TEXT'),
});

// ─── CALLS ───────────────────────────────────────────────────────────────────

export const initiateCallSchema = z.object({
  receiverId: z.string().cuid(),
  type: z.enum(['AUDIO', 'VIDEO']),
});

// ─── FILTERS ─────────────────────────────────────────────────────────────────

export const matchFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  minAge: z.coerce.number().int().min(18).max(70).optional(),
  maxAge: z.coerce.number().int().min(18).max(70).optional(),
  minHeight: z.coerce.number().int().min(100).max(250).optional(),
  maxHeight: z.coerce.number().int().min(100).max(250).optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  motherTongue: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  minIncome: z.coerce.number().int().optional(),
  maxIncome: z.coerce.number().int().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  maritalStatus: z.string().optional(),
  radius: z.coerce.number().int().min(1).max(500).optional(), // km
  sort: z.enum(['newest', 'recently_active', 'most_viewed', 'most_liked']).optional(),
});
