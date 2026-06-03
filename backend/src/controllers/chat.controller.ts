import { Request, Response, NextFunction } from 'express';
import prisma from '@config/prisma';
import { AppError } from '@middleware/error.middleware';

// ─── GET CONVERSATIONS ──────────────────────────────────────────────────────

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          isActive: true,
        },
        include: {
          user1: {
            select: {
              id: true, gender: true, lastActive: true,
              profile: { select: { firstName: true, lastName: true, city: true } },
              photos: { where: { isMain: true }, select: { url: true }, take: 1 },
            },
          },
          user2: {
            select: {
              id: true, gender: true, lastActive: true,
              profile: { select: { firstName: true, lastName: true, city: true } },
              photos: { where: { isMain: true }, select: { url: true }, take: 1 },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.conversation.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }], isActive: true },
      }),
    ]);

    // Add unread count for the current user
    const formatted = conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.user1Id === userId ? conv.user1UnreadCount : conv.user2UnreadCount,
      otherUser: conv.user1Id === userId ? conv.user2 : conv.user1,
      user1: undefined,
      user2: undefined,
    }));

    res.json({ success: true, data: { conversations: formatted, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ─── GET OR CREATE CONVERSATION ──────────────────────────────────────────────

export const getOrCreateConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const myId = req.user!.userId;
    const { userId } = req.params;

    if (myId === userId) throw new AppError('Cannot chat with yourself', 400);

    // Check block status
    const blocked = await prisma.block.findFirst({
      where: { OR: [{ blockerId: myId, blockedId: userId }, { blockerId: userId, blockedId: myId }] },
    });
    if (blocked) throw new AppError('Cannot start a conversation with this user', 403);

    // Ensure consistent ordering for uniqueness
    const [user1Id, user2Id] = [myId, userId].sort();

    const conversation = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      create: { user1Id, user2Id },
      update: { isActive: true },
      include: {
        user1: {
          select: {
            id: true, gender: true,
            profile: { select: { firstName: true, lastName: true } },
            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
          },
        },
        user2: {
          select: {
            id: true, gender: true,
            profile: { select: { firstName: true, lastName: true } },
            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
          },
        },
      },
    });

    res.json({ success: true, data: conversation });
  } catch (err) { next(err); }
};

// ─── GET MESSAGES ────────────────────────────────────────────────────────────

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    // Verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new AppError('Conversation not found', 404);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        include: { attachments: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId, deletedAt: null } }),
    ]);

    // Mark messages from other user as read
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    // Reset unread count for this user
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        user1UnreadCount: conversation.user1Id === userId ? 0 : undefined,
        user2UnreadCount: conversation.user2Id === userId ? 0 : undefined,
      },
    });

    res.json({
      success: true,
      data: { messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { content, type = 'TEXT' } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new AppError('Conversation not found', 404);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const isUser1 = conversation.user1Id === userId;

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: { conversationId, senderId: userId, content, type, isDelivered: false },
        include: { attachments: true },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content?.substring(0, 100) || `[${type}]`,
          lastMessageAt: new Date(),
          lastMessageBy: userId,
          user1UnreadCount: isUser1 ? 0 : { increment: 1 },
          user2UnreadCount: isUser1 ? { increment: 1 } : 0,
        },
      });

      return msg;
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

// ─── DELETE MESSAGE ──────────────────────────────────────────────────────────

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new AppError('Message not found', 404);
    if (message.senderId !== userId) throw new AppError('Cannot delete others\' messages', 403);

    // Soft delete
    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), content: null },
    });

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};

// ─── MARK CONVERSATION READ ───────────────────────────────────────────────────

export const markConversationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new AppError('Conversation not found', 404);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        user1UnreadCount: conversation.user1Id === userId ? 0 : undefined,
        user2UnreadCount: conversation.user2Id === userId ? 0 : undefined,
      },
    });

    res.json({ success: true });
  } catch (err) { next(err); }
};
