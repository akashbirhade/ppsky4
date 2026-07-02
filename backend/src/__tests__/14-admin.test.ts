import request from 'supertest';
import express from 'express';
import adminRoutes from '@routes/admin.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/admin.controller', () => ({
  getDashboardStats: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: { totalUsers: 5000, activeToday: 1200, premiumUsers: 350, newSignups: 45 },
    })
  ),
  getUsers: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { users: [], total: 0 } })
  ),
  getUserById: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { id: _req.params.id } })
  ),
  updateUserStatus: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'User status updated' })
  ),
  deleteUser: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'User deleted' })
  ),
  getReports: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  reviewReport: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Report reviewed' })
  ),
  getVerificationRequests: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  processVerification: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Verification processed' })
  ),
  getSubscriptions: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getAnalytics: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: {} })
  ),
  getAuditLogs: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
}));

const adminController = jest.requireMock('@controllers/admin.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 14: Admin Panel API Tests', () => {
  beforeEach(() => {
    Object.values(adminController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14.1 - All admin routes require auth + admin role
  // ═══════════════════════════════════════════════════════════════════════════
  describe('14.1 - All admin routes require authentication', () => {
    it('GET /dashboard should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /analytics should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/analytics');
      expect(res.status).toBe(401);
    });

    it('GET /audit-logs should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/audit-logs');
      expect(res.status).toBe(401);
    });

    it('GET /users should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.status).toBe(401);
    });

    it('GET /users/:id should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/users/u1');
      expect(res.status).toBe(401);
    });

    it('PUT /users/:id/status should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/admin/users/u1/status').send({ status: 'active' });
      expect(res.status).toBe(401);
    });

    it('DELETE /users/:id should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/admin/users/u1');
      expect(res.status).toBe(401);
    });

    it('GET /reports should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/reports');
      expect(res.status).toBe(401);
    });

    it('PUT /reports/:id/review should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/admin/reports/r1/review').send({ action: 'dismiss' });
      expect(res.status).toBe(401);
    });

    it('GET /verifications should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/verifications');
      expect(res.status).toBe(401);
    });

    it('PUT /verifications/:userId should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/admin/verifications/u1').send({ approved: true });
      expect(res.status).toBe(401);
    });

    it('GET /subscriptions should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/subscriptions');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14.2 - Correct HTTP methods
  // ═══════════════════════════════════════════════════════════════════════════
  describe('14.2 - Correct HTTP methods for admin routes (auth blocks first)', () => {
    it('POST /admin/dashboard should return 401 (auth required)', async () => {
      const res = await request(app).post('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('POST /admin/users should return 401 (auth required)', async () => {
      const res = await request(app).post('/api/v1/admin/users');
      expect(res.status).toBe(401);
    });

    it('GET /admin/users/:id/status should return 401 (auth required)', async () => {
      const res = await request(app).get('/api/v1/admin/users/u1/status');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14.3 - Non-existent admin routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('14.3 - Non-existent routes (admin auth blocks first)', () => {
    it('should return 401 for /admin/unknown (auth + admin required)', async () => {
      const res = await request(app).get('/api/v1/admin/unknown-route');
      expect(res.status).toBe(401);
    });
  });
});
