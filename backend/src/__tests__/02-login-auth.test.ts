import request from 'supertest';
import express from 'express';
import authRoutes from '@routes/auth.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/auth.controller', () => ({
  register: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, data: { user: { id: 'clr123' }, accessToken: 'tok' } })
  ),
  login: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: { id: 'clr123', email: 'test@test.com' }, accessToken: 'mock-access-token' },
    })
  ),
  logout: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  ),
  logoutAll: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Logged out from all devices' })
  ),
  refreshToken: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { accessToken: 'new-access-token' } })
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
    res.status(200).json({ success: true, data: { id: 'clr123', email: 'test@test.com' } })
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
describe('Module 2: Login & Authentication API Tests', () => {
  beforeEach(() => {
    Object.values(authController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.1 - Email/Password Login
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.1 - Email/Password Login', () => {
    it('should login with valid email and password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'rahul@test.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('user');
      expect(authController.login).toHaveBeenCalledTimes(1);
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'not-an-email',
        password: 'Test@1234',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(authController.login).not.toHaveBeenCalled();
    });

    it('should reject login with empty password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@test.com',
        password: '',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with missing email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        password: 'Test@1234',
      });

      expect(res.status).toBe(422);
    });

    it('should reject login with missing password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@test.com',
      });

      expect(res.status).toBe(422);
    });

    it('should reject login with empty body', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});

      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.2 - Token Refresh
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.2 - Token Refresh', () => {
    it('should refresh token with valid refresh token in body', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: 'valid-refresh-token',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(authController.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should accept refresh token from cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', ['refreshToken=cookie-refresh-token'])
        .send({});

      expect(res.status).toBe(200);
      expect(authController.refreshToken).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.3 - Forgot Password
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.3 - Forgot Password', () => {
    it('should send reset link for valid email', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'user@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authController.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'invalid-email',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(authController.forgotPassword).not.toHaveBeenCalled();
    });

    it('should reject empty email', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: '',
      });

      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.4 - Reset Password
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.4 - Reset Password', () => {
    it('should reset password with valid token and strong password', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        token: 'valid-reset-token-abc123',
        password: 'NewStr0ng@Pass',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(authController.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should reject weak password on reset', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        token: 'valid-token',
        password: 'weak',
      });

      expect(res.status).toBe(422);
      expect(authController.resetPassword).not.toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        password: 'NewStr0ng@Pass',
      });

      expect(res.status).toBe(422);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.5 - Protected Routes (Auth Required)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.5 - Protected routes require authentication', () => {
    it('GET /me should return 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authentication token missing');
    });

    it('POST /logout should return 401 without auth token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /logout-all should return 401 without auth token', async () => {
      const res = await request(app).post('/api/v1/auth/logout-all');

      expect(res.status).toBe(401);
    });

    it('POST /send-email-otp should return 401 without auth token', async () => {
      const res = await request(app).post('/api/v1/auth/send-email-otp');

      expect(res.status).toBe(401);
    });

    it('POST /verify-email should return 401 without auth token', async () => {
      const res = await request(app).post('/api/v1/auth/verify-email').send({
        otp: '123456',
        type: 'email',
      });

      expect(res.status).toBe(401);
    });

    it('POST /change-password should return 401 without auth token', async () => {
      const res = await request(app).post('/api/v1/auth/change-password').send({
        currentPassword: 'Old@1234',
        newPassword: 'New@1234',
      });

      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.6 - OTP Verification
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.6 - OTP Verification validation', () => {
    it('should reject OTP shorter than 6 digits (without auth)', async () => {
      const res = await request(app).post('/api/v1/auth/verify-email').send({
        otp: '1234',
        type: 'email',
      });

      // Should be 401 (auth required) before validation
      expect(res.status).toBe(401);
    });

    it('should reject non-numeric OTP (without auth)', async () => {
      const res = await request(app).post('/api/v1/auth/verify-email').send({
        otp: 'abcdef',
        type: 'email',
      });

      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2.7 - Invalid routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2.7 - Non-existent routes', () => {
    it('should return 401 for unknown auth route (auth middleware blocks first)', async () => {
      const res = await request(app).get('/api/v1/auth/unknown-route');

      // Auth middleware intercepts before 404 for protected routes
      expect([401, 404]).toContain(res.status);
    });

    it('should not allow GET on /login (POST only)', async () => {
      const res = await request(app).get('/api/v1/auth/login');

      // Auth middleware or 404 - either is acceptable
      expect([401, 404]).toContain(res.status);
    });
  });
});
