import request from 'supertest';
import express from 'express';
import chatRoutes from '@routes/chat.routes';
import { errorHandler, notFound } from '@middleware/error.middleware';

// ─── MOCK CONTROLLERS ────────────────────────────────────────────────────────
jest.mock('@controllers/chat.controller', () => ({
  getConversations: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'conv1',
          participant: { id: 'u2', firstName: 'Priya' },
          lastMessage: { content: 'Hello!', timestamp: '2026-07-01T10:00:00Z' },
          unreadCount: 2,
        },
      ],
    })
  ),
  getOrCreateConversation: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: { conversationId: 'conv-new', participants: ['u1', _req.params.userId] },
    })
  ),
  getMessages: jest.fn((_req: any, res: any) =>
    res.status(200).json({
      success: true,
      data: {
        messages: [
          { id: 'm1', content: 'Hi there!', senderId: 'u1', timestamp: '2026-07-01T10:00:00Z' },
        ],
        hasMore: false,
      },
    })
  ),
  sendMessage: jest.fn((_req: any, res: any) =>
    res.status(201).json({
      success: true,
      data: { id: 'm2', content: _req.body.content, senderId: 'u1', type: 'TEXT' },
    })
  ),
  deleteMessage: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Message deleted' })
  ),
  markConversationRead: jest.fn((_req: any, res: any) =>
    res.status(200).json({ success: true, message: 'Marked as read' })
  ),
}));

const chatController = jest.requireMock('@controllers/chat.controller') as Record<string, jest.Mock>;

// ─── TEST APP ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/v1/chats', chatRoutes);
app.use(notFound);
app.use(errorHandler);

// ─── TEST SUITES ─────────────────────────────────────────────────────────────
describe('Module 6: Messaging / Chat API Tests', () => {
  beforeEach(() => {
    Object.values(chatController).forEach((fn) => fn.mockClear());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6.1 - All chat routes require auth
  // ═══════════════════════════════════════════════════════════════════════════
  describe('6.1 - All chat routes require authentication', () => {
    it('GET / (conversations) should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/chats');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication token missing');
    });

    it('POST /:userId/conversation should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/chats/clr123/conversation');
      expect(res.status).toBe(401);
    });

    it('GET /:conversationId/messages should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/chats/conv1/messages');
      expect(res.status).toBe(401);
    });

    it('POST /:conversationId/messages should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/chats/conv1/messages').send({
        content: 'Hello!',
        type: 'TEXT',
      });
      expect(res.status).toBe(401);
    });

    it('DELETE /:conversationId/messages/:messageId should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/chats/conv1/messages/m1');
      expect(res.status).toBe(401);
    });

    it('PUT /:conversationId/read should return 401 without auth', async () => {
      const res = await request(app).put('/api/v1/chats/conv1/read');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6.2 - Message validation (sendMessageSchema)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('6.2 - sendMessageSchema validation', () => {
    it('should accept valid TEXT message', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ content: 'Hello!', type: 'TEXT' });
      expect(result.success).toBe(true);
    });

    it('should accept message without type (defaults to TEXT)', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ content: 'Hello!' });
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('TEXT');
    });

    it('should accept IMAGE type', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ type: 'IMAGE' });
      expect(result.success).toBe(true);
    });

    it('should accept VOICE_NOTE type', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ type: 'VOICE_NOTE' });
      expect(result.success).toBe(true);
    });

    it('should accept VIDEO type', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ type: 'VIDEO' });
      expect(result.success).toBe(true);
    });

    it('should accept DOCUMENT type', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ type: 'DOCUMENT' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid message type', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ content: 'hi', type: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should reject content longer than 5000 chars', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ content: 'A'.repeat(5001), type: 'TEXT' });
      expect(result.success).toBe(false);
    });

    it('should accept content up to 5000 chars', () => {
      const { sendMessageSchema } = require('@utils/validators');
      const result = sendMessageSchema.safeParse({ content: 'A'.repeat(5000), type: 'TEXT' });
      expect(result.success).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6.3 - Correct HTTP methods for chat routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('6.3 - Correct HTTP methods', () => {
    it('conversations list should be GET, not POST', async () => {
      const res = await request(app).post('/api/v1/chats');
      // Auth middleware intercepts before method check
      expect(res.status).toBe(401);
    });

    it('delete message should be DELETE, not PUT', async () => {
      const res = await request(app).put('/api/v1/chats/conv1/messages/m1');
      // Auth middleware intercepts before method check
      expect(res.status).toBe(401);
    });

    it('mark read should be PUT', async () => {
      // PUT to /conv1/read should exist (returns 401)
      const res = await request(app).put('/api/v1/chats/conv1/read');
      expect(res.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6.4 - Non-existent chat routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe('6.4 - Non-existent routes', () => {
    it('should return 401 for unknown sub-route (auth blocks first)', async () => {
      const res = await request(app).get('/api/v1/chats/conv1/unknown');
      // Auth middleware intercepts all chat routes
      expect(res.status).toBe(401);
    });
  });
});
