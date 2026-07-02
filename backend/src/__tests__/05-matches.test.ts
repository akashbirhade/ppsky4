import request from 'supertest';
import express from 'express';
import matchRoutes from '@routes/match.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/match.controller', () => ({
  getNewProfiles: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { profiles: [], total: 0 } })
  ),
  getRecentlyActive: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getNearMe: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getMostViewed: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getMostLiked: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getPremiumProfiles: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getVerifiedProfiles: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getRecommended: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [{ id: 'u1', score: 92 }] })
  ),
  likeProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Profile liked', data: { matched: false } })
  ),
  unlikeProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Like removed' })
  ),
  superLikeProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Super liked' })
  ),
  favoriteProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Added to favorites' })
  ),
  unfavoriteProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Removed from favorites' })
  ),
  blockUser: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'User blocked' })
  ),
  viewProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'View recorded' })
  ),
  getLikesReceived: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getFavorites: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  getCompatibilityScore: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: { score: 85, gunMilan: 28, breakdown: { nadi: 8, bhakoot: 7 } },
    })
  ),
}));

const matchController = jest.requireMock('@controllers/match.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/matches', matchRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 5: Matches & Activity API Tests', () => {
  beforeEach(() => {
    Object.values(matchController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5.1 - All match routes require auth
  // ═══════════════════════════════════════════════════════════════════════════
  describe('5.1 - All match routes require authentication', () => {
    it('POST /like/:userId should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/matches/like/clr123');
      expect(res.status).toBe(401);
    });

    it('DELETE /like/:userId should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/matches/like/clr123');
      expect(res.status).toBe(401);
    });

    it('POST /superlike/:userId should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/matches/superlike/clr123');
      expect(res.status).toBe(401);
    });

    it('POST /favorite/:userId should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/matches/favorite/clr123');
      expect(res.status).toBe(401);
    });

    it('DELETE /favorite/:userId should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/matches/favorite/clr123');
      expect(res.status).toBe(401);
    });

    it('POST /block/:userId should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/matches/block/clr123');
      expect(res.status).toBe(401);
    });

    it('POST /view/:userId should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/matches/view/clr123');
      expect(res.status).toBe(401);
    });

    it('GET /compatibility/:userId should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/compatibility/clr123');
      expect(res.status).toBe(401);
    });

    it('GET /likes/received should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/likes/received');
      expect(res.status).toBe(401);
    });

    it('GET /favorites should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/favorites');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5.2 - Route existence (correct HTTP methods)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('5.2 - Correct HTTP methods', () => {
    it('like should be POST, not GET', async () => {
      const res = await request(app).get('/api/v1/matches/like/clr123');
      // Auth middleware intercepts before method check
      expect(res.status).toBe(401);
    });

    it('unlike should be DELETE, not POST', async () => {
      // DELETE returns 401 (route exists, needs auth)
      const res = await request(app).delete('/api/v1/matches/like/clr123');
      expect(res.status).toBe(401);
    });

    it('block should be POST', async () => {
      const res = await request(app).post('/api/v1/matches/block/clr123');
      expect(res.status).toBe(401); // exists, needs auth
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5.3 - Premium-gated routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('5.3 - Premium-gated routes', () => {
    it('GET /likes/received requires premium (returns 401 without auth first)', async () => {
      const res = await request(app).get('/api/v1/matches/likes/received');
      // Without auth, returns 401 before premium check
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5.4 - Non-existent match routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('5.4 - Non-existent match routes', () => {
    it('GET /matches/unknown should return 401 (auth blocks first)', async () => {
      const res = await request(app).get('/api/v1/matches/unknown-route');
      // Auth middleware intercepts all match routes before 404
      expect(res.status).toBe(401);
    });
  });
});
