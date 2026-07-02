import request from 'supertest';
import express from 'express';
import hostRoutes from '@routes/host.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/host.controller', () => ({
  createHost: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, data: { id: 'h1', name: 'Mumbai Singles' } })
  ),
  getHosts: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [{ id: 'h1', name: 'Mumbai Singles' }] })
  ),
  getHostById: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { id: _req.params.id, name: 'Test Host' } })
  ),
  updateHost: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Host updated' })
  ),
  deleteHost: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Host deleted' })
  ),
  assignMember: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Member assigned' })
  ),
  removeMember: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Member removed' })
  ),
  transferMember: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Member transferred' })
  ),
  getHostMembers: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  createHostEvent: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, data: { id: 'ev1', title: 'Speed Dating' } })
  ),
  getHostEvents: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  updateHostEvent: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Event updated' })
  ),
  deleteHostEvent: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Event deleted' })
  ),
  createInterest: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, message: 'Interest registered' })
  ),
  getHostInterests: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  updateInterestStatus: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Interest status updated' })
  ),
  getHostStats: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { totalMembers: 50, activeEvents: 3 } })
  ),
}));

const hostController = jest.requireMock('@controllers/host.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/hosts', hostRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 11: Community & Events (Hosts) API Tests', () => {
  beforeEach(() => {
    Object.values(hostController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11.1 - Public routes (no auth needed)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('11.1 - Public host routes', () => {
    it('GET /hosts should be accessible without auth', async () => {
      const res = await request(app).get('/api/v1/hosts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(hostController.getHosts).toHaveBeenCalledTimes(1);
    });

    it('GET /hosts/:id should be accessible without auth', async () => {
      const res = await request(app).get('/api/v1/hosts/h1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'h1');
    });

    it('GET /hosts/:id/events should be accessible without auth', async () => {
      const res = await request(app).get('/api/v1/hosts/h1/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11.2 - Authenticated host routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('11.2 - Authenticated host routes', () => {
    it('POST /hosts should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hosts').send({ name: 'New Group' });
      expect(res.status).toBe(401);
    });

    it('PUT /hosts/:id should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/hosts/h1').send({ name: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('DELETE /hosts/:id should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/hosts/h1');
      expect(res.status).toBe(401);
    });

    it('GET /hosts/:id/members should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/hosts/h1/members');
      expect(res.status).toBe(401);
    });

    it('POST /hosts/:id/members should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hosts/h1/members').send({ userId: 'u1' });
      expect(res.status).toBe(401);
    });

    it('DELETE /hosts/:id/members/:userId should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/hosts/h1/members/u1');
      expect(res.status).toBe(401);
    });

    it('POST /hosts/:id/events should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hosts/h1/events').send({ title: 'Event' });
      expect(res.status).toBe(401);
    });

    it('PUT /hosts/:id/events/:eventId should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/hosts/h1/events/ev1').send({ title: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('DELETE /hosts/:id/events/:eventId should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/hosts/h1/events/ev1');
      expect(res.status).toBe(401);
    });

    it('POST /hosts/:id/interests should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hosts/h1/interests');
      expect(res.status).toBe(401);
    });

    it('GET /hosts/:id/stats should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/hosts/h1/stats');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11.3 - Member transfer route
  // ═══════════════════════════════════════════════════════════════════════════
  describe('11.3 - Member transfer route', () => {
    it('POST /hosts/:id/members/transfer should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hosts/h1/members/transfer').send({
        userId: 'u1',
        targetHostId: 'h2',
      });
      expect(res.status).toBe(401);
    });
  });
});
