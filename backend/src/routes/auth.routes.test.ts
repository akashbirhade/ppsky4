import express from 'express';
import request from 'supertest';
import authRoutes from './auth.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

jest.mock('@controllers/auth.controller', () => ({
  register: jest.fn((_req: any, res: any) => res.status(201).json({ success: true, route: 'register' })),
  login: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'login' })),
  logout: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'logout' })),
  logoutAll: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'logout-all' })),
  refreshToken: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'refresh-token' })),
  sendEmailOtp: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'send-email-otp' })),
  verifyEmailOtp: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'verify-email' })),
  forgotPassword: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'forgot-password' })),
  resetPassword: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'reset-password' })),
  changePassword: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'change-password' })),
  getMe: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, route: 'me' })),
}));

const authController = jest.requireMock('@controllers/auth.controller') as Record<string, jest.Mock>;

describe('auth routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use(notFound);
  app.use(errorHandler);

  beforeEach(() => {
    Object.values(authController).forEach((fn) => fn.mockClear());
  });

  it('rejects invalid forgot-password payload with 422', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'invalid-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(authController.forgotPassword).not.toHaveBeenCalled();
  });

  it('accepts valid forgot-password payload and reaches controller', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: 'forgot-password' });
    expect(authController.forgotPassword).toHaveBeenCalledTimes(1);
  });

  it('allows refresh-token route without validate middleware', async () => {
    const res = await request(app)
      .post('/auth/refresh-token')
      .send({ refreshToken: 'some-token' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: 'refresh-token' });
    expect(authController.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('protects /me route without auth token', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication token missing');
    expect(authController.getMe).not.toHaveBeenCalled();
  });
});
