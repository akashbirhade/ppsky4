import request from 'supertest';
import express from 'express';
import profileRoutes from '@routes/profile.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/profile.controller', () => ({
  getMyProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: {
        id: 'clr123',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@test.com',
        gender: 'MALE',
        city: 'Mumbai',
        photos: [],
      },
    })
  ),
  getProfileById: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { id: _req.params.id, firstName: 'Priya' } })
  ),
  updateProfile: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Profile updated', data: _req.body })
  ),
  uploadPhoto: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { photoId: 'photo123', url: 'http://img.url' } })
  ),
  setMainPhoto: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Main photo updated' })
  ),
  deletePhoto: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Photo deleted' })
  ),
  getPreferences: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { minAge: 22, maxAge: 30 } })
  ),
  updatePreferences: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Preferences updated' })
  ),
  getMyProfileViews: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: [] })
  ),
  searchProfiles: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, data: { profiles: [], total: 0 } })
  ),
}));

const profileController = jest.requireMock('@controllers/profile.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/profiles', profileRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 3: Profile Management API Tests', () => {
  beforeEach(() => {
    Object.values(profileController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3.1 - Auth protection (all profile routes need auth)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('3.1 - All profile routes require authentication', () => {
    it('GET /me should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/profiles/me');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication token missing');
    });

    it('PUT /me should return 401 without token', async () => {
      const res = await request(app).put('/api/v1/profiles/me').send({ firstName: 'Test' });
      expect(res.status).toBe(401);
    });

    it('GET /search should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/profiles/search');
      expect(res.status).toBe(401);
    });

    it('GET /preferences should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/profiles/preferences');
      expect(res.status).toBe(401);
    });

    it('PUT /preferences should return 401 without token', async () => {
      const res = await request(app).put('/api/v1/profiles/preferences').send({ minAge: 22 });
      expect(res.status).toBe(401);
    });

    it('POST /photos should return 401 without token', async () => {
      const res = await request(app).post('/api/v1/profiles/photos');
      expect(res.status).toBe(401);
    });

    it('GET /:id should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/profiles/clr123');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3.2 - Update profile validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('3.2 - Update profile validation (schema)', () => {
    // Note: These tests verify the validate middleware rejects bad data
    // Auth middleware will block first, so these validate the schema itself

    it('should reject height below 100cm via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ height: 50 });
      expect(result.success).toBe(false);
    });

    it('should reject height above 250cm via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ height: 300 });
      expect(result.success).toBe(false);
    });

    it('should accept valid height via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ height: 175 });
      expect(result.success).toBe(true);
    });

    it('should reject invalid pincode format via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ pincode: '123' });
      expect(result.success).toBe(false);
    });

    it('should accept valid 6-digit pincode via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ pincode: '411001' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid maritalStatus value via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ maritalStatus: 'SINGLE' });
      expect(result.success).toBe(false);
    });

    it('should accept valid maritalStatus values via schema', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const valid = ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'];
      valid.forEach((status) => {
        const result = updateProfileSchema.safeParse({ maritalStatus: status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject whatsappNumber with invalid format', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ whatsappNumber: '12345' });
      expect(result.success).toBe(false);
    });

    it('should accept valid Indian whatsapp number', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ whatsappNumber: '9876543210' });
      expect(result.success).toBe(true);
    });

    it('should reject bio longer than 1000 chars', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({ bio: 'A'.repeat(1001) });
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 hobbies', () => {
      const { updateProfileSchema } = require('@utils/validators');
      const result = updateProfileSchema.safeParse({
        hobbies: Array(11).fill('hobby'),
      });
      expect(result.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3.3 - Preferences validation
  // ═══════════════════════════════════════════════════════════════════════════
  describe('3.3 - Preferences validation (schema)', () => {
    it('should reject minAge below 18', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ minAge: 16 });
      expect(result.success).toBe(false);
    });

    it('should reject maxAge above 70', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ maxAge: 80 });
      expect(result.success).toBe(false);
    });

    it('should accept valid age range', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ minAge: 22, maxAge: 32 });
      expect(result.success).toBe(true);
    });

    it('should reject maxDistance above 1000km', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ maxDistance: 1500 });
      expect(result.success).toBe(false);
    });

    it('should accept valid maxDistance', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ maxDistance: 50 });
      expect(result.success).toBe(true);
    });

    it('should accept array of religions', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({ religion: ['Hindu', 'Jain'] });
      expect(result.success).toBe(true);
    });

    it('should accept array of marital statuses', () => {
      const { preferencesSchema } = require('@utils/validators');
      const result = preferencesSchema.safeParse({
        maritalStatus: ['NEVER_MARRIED', 'DIVORCED'],
      });
      expect(result.success).toBe(true);
    });
  });
});
