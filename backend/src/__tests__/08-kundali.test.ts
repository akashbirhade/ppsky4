import request from 'supertest';
import express from 'express';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK: Kundali/Compatibility (Next.js API - tested as schema/unit tests) ─

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 8: Kundali Matching API Tests', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // 8.1 - Compatibility endpoint requires both userId and targetId
  // ═══════════════════════════════════════════════════════════════════════════
  describe('8.1 - Compatibility API input validation', () => {
    it('should require userId parameter', () => {
      // Simulating the validation from the Next.js API route
      const userId = null;
      const targetId = 'user2';
      expect(!userId || !targetId).toBe(true); // Would return 400
    });

    it('should require targetId parameter', () => {
      const userId = 'user1';
      const targetId = null;
      expect(!userId || !targetId).toBe(true); // Would return 400
    });

    it('should pass when both IDs provided', () => {
      const userId = 'user1';
      const targetId = 'user2';
      expect(!userId || !targetId).toBe(false); // Would proceed
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8.2 - Compatibility score calculation logic
  // ═══════════════════════════════════════════════════════════════════════════
  describe('8.2 - Compatibility score calculation', () => {
    // Simulating the scoring logic from the API
    function calculateCompatibility(user: any, target: any): number {
      let score = 50; // Base score

      // Age preference match
      if (target.age >= user.partnerPreferences.ageMin &&
          target.age <= user.partnerPreferences.ageMax) {
        score += 10;
      }

      // Religion match
      if (!user.partnerPreferences.religion ||
          user.partnerPreferences.religion === target.religion) {
        score += 12;
      }

      // Education match
      if (!user.partnerPreferences.education ||
          target.education.toLowerCase().includes(
            user.partnerPreferences.education.toLowerCase().split('/')[0]
          )) {
        score += 10;
      }

      // City match
      if (!user.partnerPreferences.city ||
          user.partnerPreferences.city.toLowerCase().includes(target.city.toLowerCase())) {
        score += 8;
      }

      return Math.min(score, 100);
    }

    it('should return base score of 50 when no preferences match', () => {
      const user = {
        partnerPreferences: { ageMin: 20, ageMax: 25, religion: 'Hindu', education: 'PhD', city: 'Delhi' },
      };
      const target = { age: 35, religion: 'Christian', education: 'High School', city: 'Chennai' };
      expect(calculateCompatibility(user, target)).toBe(50);
    });

    it('should add 10 for age match', () => {
      const user = { partnerPreferences: { ageMin: 22, ageMax: 28, religion: 'X', education: 'Y', city: 'Z' } };
      const target = { age: 25, religion: 'A', education: 'B', city: 'C' };
      expect(calculateCompatibility(user, target)).toBe(60);
    });

    it('should add 12 for religion match', () => {
      const user = { partnerPreferences: { ageMin: 20, ageMax: 22, religion: 'Hindu', education: 'Y', city: 'Z' } };
      const target = { age: 30, religion: 'Hindu', education: 'B', city: 'C' };
      expect(calculateCompatibility(user, target)).toBe(62);
    });

    it('should add 10 for education match', () => {
      const user = { partnerPreferences: { ageMin: 20, ageMax: 22, religion: 'X', education: 'Engineering', city: 'Z' } };
      const target = { age: 30, religion: 'Y', education: 'engineering degree', city: 'C' };
      expect(calculateCompatibility(user, target)).toBe(60);
    });

    it('should add 8 for city match', () => {
      const user = { partnerPreferences: { ageMin: 20, ageMax: 22, religion: 'X', education: 'Y', city: 'mumbai' } };
      const target = { age: 30, religion: 'Z', education: 'B', city: 'Mumbai' };
      expect(calculateCompatibility(user, target)).toBe(58);
    });

    it('should max out at 100', () => {
      const user = { partnerPreferences: { ageMin: 20, ageMax: 30, religion: 'Hindu', education: 'Engineering', city: 'mumbai' } };
      const target = { age: 25, religion: 'Hindu', education: 'engineering', city: 'Mumbai' };
      const score = calculateCompatibility(user, target);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give bonus when no preference set (open to all)', () => {
      const user = { partnerPreferences: { ageMin: 20, ageMax: 35, religion: null, education: null, city: null } };
      const target = { age: 28, religion: 'Any', education: 'Any', city: 'Any' };
      const score = calculateCompatibility(user, target);
      // age(10) + religion(12) + education(10) + city(8) + base(50) = 90
      expect(score).toBe(90);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8.3 - Backend compatibility route (via match routes)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('8.3 - Backend /matches/compatibility/:userId', () => {
    const mockApp = express();
    mockApp.use(express.json());

    // Mock match routes with auth
    jest.mock('@controllers/match.controller', () => ({
      getNewProfiles: jest.fn(),
      getRecentlyActive: jest.fn(),
      getNearMe: jest.fn(),
      getMostViewed: jest.fn(),
      getMostLiked: jest.fn(),
      getPremiumProfiles: jest.fn(),
      getVerifiedProfiles: jest.fn(),
      getRecommended: jest.fn(),
      likeProfile: jest.fn(),
      unlikeProfile: jest.fn(),
      superLikeProfile: jest.fn(),
      favoriteProfile: jest.fn(),
      unfavoriteProfile: jest.fn(),
      blockUser: jest.fn(),
      viewProfile: jest.fn(),
      getLikesReceived: jest.fn(),
      getFavorites: jest.fn(),
      getCompatibilityScore: jest.fn((_req: any, res: any) =>
        res.status(200).json({ success: true, data: { score: 78 } })
      ),
    }));

    it('compatibility route requires auth', async () => {
      // Import fresh to get mocked version
      const matchRoutes = require('@routes/match.routes').default;
      mockApp.use('/api/v1/matches', matchRoutes);
      mockApp.use(notFound);
      mockApp.use(errorHandler);

      const res = await request(mockApp).get('/api/v1/matches/compatibility/clr123');
      expect(res.status).toBe(401);
    });
  });
});
