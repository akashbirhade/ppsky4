import request from 'supertest';
import express from 'express';
import profileRoutes from '@routes/profile.routes';
import matchRoutes from '@routes/match.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/profile.controller', () => ({
  getMyProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getProfileById: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  updateProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  uploadPhoto: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  setMainPhoto: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  deletePhoto: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getPreferences: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  updatePreferences: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getMyProfileViews: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  searchProfiles: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: {
        profiles: [
          { id: 'p1', firstName: 'Priya', city: 'Mumbai', age: 25 },
          { id: 'p2', firstName: 'Neha', city: 'Pune', age: 28 },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    })
  ),
}));

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
    res.status(200).json({ success: true, data: [] })
  ),
  likeProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  unlikeProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  superLikeProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  favoriteProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  unfavoriteProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  blockUser: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  viewProfile: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getLikesReceived: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, data: [] })),
  getFavorites: jest.fn((_req: any, res: any) => res.status(200).json({ success: true, data: [] })),
  getCompatibilityScore: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { score: 85, breakdown: {} } })
  ),
}));

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 4: Search & Filters API Tests', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // 4.1 - Search requires authentication
  // ═══════════════════════════════════════════════════════════════════════════
  describe('4.1 - Search route auth protection', () => {
    it('GET /profiles/search should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/profiles/search');
      expect(res.status).toBe(401);
    });

    it('GET /matches/new should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/new');
      expect(res.status).toBe(401);
    });

    it('GET /matches/near-me should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/near-me');
      expect(res.status).toBe(401);
    });

    it('GET /matches/recommended should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/matches/recommended');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.2 - Filter schema validation (matchFiltersSchema)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('4.2 - matchFiltersSchema validation', () => {
    it('should accept valid age range filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ minAge: 22, maxAge: 32 });
      expect(result.success).toBe(true);
    });

    it('should reject minAge below 18', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ minAge: 16 });
      expect(result.success).toBe(false);
    });

    it('should reject maxAge above 70', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ maxAge: 75 });
      expect(result.success).toBe(false);
    });

    it('should accept valid height range filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ minHeight: 150, maxHeight: 180 });
      expect(result.success).toBe(true);
    });

    it('should reject minHeight below 100', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ minHeight: 50 });
      expect(result.success).toBe(false);
    });

    it('should reject maxHeight above 250', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ maxHeight: 300 });
      expect(result.success).toBe(false);
    });

    it('should accept religion filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ religion: 'Hindu' });
      expect(result.success).toBe(true);
    });

    it('should accept caste filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ caste: 'Brahmin' });
      expect(result.success).toBe(true);
    });

    it('should accept motherTongue filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ motherTongue: 'Marathi' });
      expect(result.success).toBe(true);
    });

    it('should accept education filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ education: 'Engineering' });
      expect(result.success).toBe(true);
    });

    it('should accept profession filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ profession: 'Software Engineer' });
      expect(result.success).toBe(true);
    });

    it('should accept income range filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ minIncome: 500000, maxIncome: 2000000 });
      expect(result.success).toBe(true);
    });

    it('should accept city/state/district filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({
        city: 'Mumbai',
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
      });
      expect(result.success).toBe(true);
    });

    it('should accept radius filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ radius: 50 });
      expect(result.success).toBe(true);
    });

    it('should reject radius above 500km', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ radius: 600 });
      expect(result.success).toBe(false);
    });

    it('should accept valid sort options', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const sorts = ['newest', 'recently_active', 'most_viewed', 'most_liked'];
      sorts.forEach((sort) => {
        const result = matchFiltersSchema.safeParse({ sort });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid sort option', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ sort: 'invalid_sort' });
      expect(result.success).toBe(false);
    });

    it('should accept pagination params', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
    });

    it('should reject limit above 100', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });

    it('should accept maritalStatus filter', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({ maritalStatus: 'NEVER_MARRIED' });
      expect(result.success).toBe(true);
    });

    it('should accept combination of all filters', () => {
      const { matchFiltersSchema } = require('@utils/validators');
      const result = matchFiltersSchema.safeParse({
        minAge: 22,
        maxAge: 30,
        minHeight: 155,
        maxHeight: 175,
        religion: 'Hindu',
        caste: 'Brahmin',
        motherTongue: 'Hindi',
        education: 'MBA',
        profession: 'Doctor',
        minIncome: 1000000,
        maxIncome: 5000000,
        city: 'Delhi',
        state: 'Delhi',
        maritalStatus: 'NEVER_MARRIED',
        radius: 100,
        sort: 'newest',
        page: 1,
        limit: 20,
      });
      expect(result.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4.3 - Discovery feed routes exist
  // ═══════════════════════════════════════════════════════════════════════════
  describe('4.3 - Discovery feed routes exist (auth blocked)', () => {
    const feeds = [
      '/api/v1/matches/new',
      '/api/v1/matches/recently-active',
      '/api/v1/matches/near-me',
      '/api/v1/matches/most-viewed',
      '/api/v1/matches/most-liked',
      '/api/v1/matches/premium',
      '/api/v1/matches/verified',
      '/api/v1/matches/recommended',
    ];

    feeds.forEach((route) => {
      it(`GET ${route} should exist (returns 401 without auth)`, async () => {
        const res = await request(app).get(route);
        // 401 means route exists but needs auth
        expect(res.status).toBe(401);
      });
    });
  });
});
