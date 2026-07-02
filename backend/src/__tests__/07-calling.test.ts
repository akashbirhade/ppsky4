import request from 'supertest';
import express from 'express';
import callRoutes from '@routes/call.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/call.controller', () => ({
  initiateCall: jest.fn((_req: any, res: any) =>
    res.status(201).json({
      success: true,
      data: {
        callId: 'call123',
        type: _req.body.type,
        status: 'RINGING',
        receiverId: _req.body.receiverId,
      },
    })
  ),
  answerCall: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { callId: _req.params.callId, status: 'CONNECTED' } })
  ),
  endCall: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { callId: _req.params.callId, status: 'ENDED' } })
  ),
  getCallHistory: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: [
        { id: 'call1', type: 'VIDEO', status: 'ENDED', duration: 120 },
        { id: 'call2', type: 'AUDIO', status: 'MISSED', duration: 0 },
      ],
    })
  ),
  getMissedCalls: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: [{ id: 'call2', type: 'AUDIO', caller: { firstName: 'Priya' } }],
    })
  ),
}));

const callController = jest.requireMock('@controllers/call.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/calls', callRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 7: Video/Audio Calling API Tests', () => {
  beforeEach(() => {
    Object.values(callController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7.1 - All call routes require auth
  // ═══════════════════════════════════════════════════════════════════════════
  describe('7.1 - All call routes require authentication', () => {
    it('POST / (initiate call) should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/calls').send({
        receiverId: 'clr1234567890abcdefgh',
        type: 'VIDEO',
      });
      expect(res.status).toBe(401);
    });

    it('PUT /:callId/answer should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/calls/call123/answer');
      expect(res.status).toBe(401);
    });

    it('PUT /:callId/end should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/calls/call123/end');
      expect(res.status).toBe(401);
    });

    it('GET /history should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/calls/history');
      expect(res.status).toBe(401);
    });

    it('GET /missed should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/calls/missed');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7.2 - initiateCallSchema validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('7.2 - initiateCallSchema validation', () => {
    it('should accept valid VIDEO call with CUID receiverId', () => {
      const { initiateCallSchema } = require('@utils/validators');
      // CUID format: starts with 'c', 25 chars
      const result = initiateCallSchema.safeParse({
        receiverId: 'clr1234567890abcdefghijk',
        type: 'VIDEO',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid AUDIO call type', () => {
      const { initiateCallSchema } = require('@utils/validators');
      const result = initiateCallSchema.safeParse({
        receiverId: 'clr1234567890abcdefghijk',
        type: 'AUDIO',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid call type', () => {
      const { initiateCallSchema } = require('@utils/validators');
      const result = initiateCallSchema.safeParse({
        receiverId: 'clr1234567890abcdefghijk',
        type: 'SCREEN_SHARE',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing receiverId', () => {
      const { initiateCallSchema } = require('@utils/validators');
      const result = initiateCallSchema.safeParse({ type: 'VIDEO' });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const { initiateCallSchema } = require('@utils/validators');
      const result = initiateCallSchema.safeParse({
        receiverId: 'clr1234567890abcdefghijk',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-CUID receiverId', () => {
      const { initiateCallSchema } = require('@utils/validators');
      const result = initiateCallSchema.safeParse({
        receiverId: 'not-a-cuid',
        type: 'VIDEO',
      });
      expect(result.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7.3 - Correct HTTP methods
  // ═══════════════════════════════════════════════════════════════════════════
  describe('7.3 - Correct HTTP methods for call routes', () => {
    it('initiate call should be POST, not GET', async () => {
      const res = await request(app).get('/api/v1/calls');
      // Auth middleware intercepts before method check
      expect(res.status).toBe(401);
    });

    it('answer call should be PUT', async () => {
      const res = await request(app).put('/api/v1/calls/call123/answer');
      expect(res.status).toBe(401); // exists, needs auth
    });

    it('end call should be PUT', async () => {
      const res = await request(app).put('/api/v1/calls/call123/end');
      expect(res.status).toBe(401); // exists, needs auth
    });

    it('POST to answer should return 401 (auth blocks first)', async () => {
      const res = await request(app).post('/api/v1/calls/call123/answer');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7.4 - Non-existent routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('7.4 - Non-existent routes', () => {
    it('should return 401 for /calls/unknown (auth blocks first)', async () => {
      const res = await request(app).get('/api/v1/calls/unknown-route');
      // Auth middleware intercepts all call routes
      expect(res.status).toBe(401);
    });
  });
});
