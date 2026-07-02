import request from 'supertest';
import express from 'express';
import authRoutes from '@routes/auth.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/auth.controller', () => ({
  register: jest.fn((_req: any, res: any) =>
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: { id: 'clr123', email: 'test@example.com', firstName: 'Test' },
        accessToken: 'mock-access-token',
      },
    })
  ),
  login: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: { id: 'clr123' }, accessToken: 'mock-access-token' },
    })
  ),
  logout: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  ),
  logoutAll: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Logged out from all devices' })
  ),
  refreshToken: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { accessToken: 'new-token' } })
  ),
  sendEmailOtp: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'OTP sent' })
  ),
  verifyEmailOtp: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Email verified' })
  ),
  forgotPassword: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Reset link sent' })
  ),
  resetPassword: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Password reset successful' })
  ),
  changePassword: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Password changed' })
  ),
  getMe: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { id: 'clr123', email: 'test@example.com' } })
  ),
}));

const authController = jest.requireMock('@controllers/auth.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 1: Registration & Onboarding API Tests', () => {
  beforeEach(() => {
    Object.values(authController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.1 - OTP-based registration (phone number)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.1 - Registration with valid mobile number', () => {
    it('should accept valid Indian mobile number (starts with 6-9)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(authController.register).toHaveBeenCalledTimes(1);
    });

    it('should reject mobile number starting with 0-5', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        password: 'Test@1234',
        mobileNumber: '5876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(authController.register).not.toHaveBeenCalled();
    });

    it('should reject mobile number with less than 10 digits', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        password: 'Test@1234',
        mobileNumber: '98765432',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject mobile number with more than 10 digits', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        password: 'Test@1234',
        mobileNumber: '98765432101',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.2 - Email registration validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.2 - Email validation on registration', () => {
    it('should accept valid email format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@gmail.com',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(201);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'invalid-email',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should reject empty email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: '',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.3 - Password strength validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.3 - Password strength validation', () => {
    const basePayload = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@test.com',
      mobileNumber: '9876543210',
      gender: 'MALE',
      dateOfBirth: '1995-06-15',
    };

    it('should accept strong password (uppercase, lowercase, digit, special)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'Str0ng@Pass',
      });
      expect(res.status).toBe(201);
    });

    it('should reject password without uppercase', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'weak@1234',
      });
      expect(res.status).toBe(422);
    });

    it('should reject password without lowercase', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'WEAK@1234',
      });
      expect(res.status).toBe(422);
    });

    it('should reject password without digit', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'Weak@pass',
      });
      expect(res.status).toBe(422);
    });

    it('should reject password without special character', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'Weak1234a',
      });
      expect(res.status).toBe(422);
    });

    it('should reject password shorter than 8 chars', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        password: 'Te@1',
      });
      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.4 - Gender validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.4 - Gender validation', () => {
    const basePayload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'Test@1234',
      mobileNumber: '9876543210',
      dateOfBirth: '1995-06-15',
    };

    it('should accept MALE gender', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        gender: 'MALE',
      });
      expect(res.status).toBe(201);
    });

    it('should accept FEMALE gender', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        gender: 'FEMALE',
      });
      expect(res.status).toBe(201);
    });

    it('should accept OTHER gender', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        gender: 'OTHER',
      });
      expect(res.status).toBe(201);
    });

    it('should reject invalid gender value', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        gender: 'INVALID',
      });
      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.5 - Name validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.5 - Name validation', () => {
    const basePayload = {
      email: 'test@test.com',
      password: 'Test@1234',
      mobileNumber: '9876543210',
      gender: 'MALE',
      dateOfBirth: '1995-06-15',
    };

    it('should reject firstName shorter than 2 chars', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        firstName: 'A',
        lastName: 'Sharma',
      });
      expect(res.status).toBe(422);
    });

    it('should reject lastName shorter than 2 chars', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        firstName: 'Rahul',
        lastName: 'S',
      });
      expect(res.status).toBe(422);
    });

    it('should reject firstName longer than 50 chars', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        firstName: 'A'.repeat(51),
        lastName: 'Sharma',
      });
      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.6 - Date of birth validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.6 - Date of birth validation', () => {
    const basePayload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'Test@1234',
      mobileNumber: '9876543210',
      gender: 'MALE',
    };

    it('should accept valid date format YYYY-MM-DD', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        dateOfBirth: '1995-06-15',
      });
      expect(res.status).toBe(201);
    });

    it('should accept valid datetime format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        dateOfBirth: '1995-06-15T00:00:00.000Z',
      });
      expect(res.status).toBe(201);
    });

    it('should reject invalid date format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...basePayload,
        dateOfBirth: '15-06-1995',
      });
      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.7 - Missing required fields
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.7 - Missing required fields', () => {
    it('should reject when firstName is missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        lastName: 'Sharma',
        email: 'test@test.com',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });
      expect(res.status).toBe(422);
    });

    it('should reject when email is missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });
      expect(res.status).toBe(422);
    });

    it('should reject when password is missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'test@test.com',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });
      expect(res.status).toBe(422);
    });

    it('should reject completely empty body', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});
      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1.8 - Response structure
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1.8 - Registration response structure', () => {
    it('should return user object and accessToken on success', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        password: 'Test@1234',
        mobileNumber: '9876543210',
        gender: 'MALE',
        dateOfBirth: '1995-06-15',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data.user');
      expect(res.body).toHaveProperty('data.accessToken');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('email');
    });

    it('should return validation error details on failure', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'invalid',
      });

      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body).toHaveProperty('details');
      expect(Array.isArray(res.body.details)).toBe(true);
    });
  });
});
