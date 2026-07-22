"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markConversationRead = exports.deleteMessage = exports.sendMessage = exports.getMessages = exports.getOrCreateConversation = exports.getConversations = void 0;
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("@middleware/error.middleware");
// ─── GET CONVERSATIONS ──────────────────────────────────────────────────────
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const [conversations, total] = await Promise.all([
            prisma_1.default.conversation.findMany({
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
            prisma_1.default.conversation.count({
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
    }
    catch (err) {
        next(err);
    }
};
exports.getConversations = getConversations;
// ─── GET OR CREATE CONVERSATION ──────────────────────────────────────────────
const getOrCreateConversation = async (req, res, next) => {
    try {
        const myId = req.user.userId;
        const { userId } = req.params;
        if (myId === userId)
            throw new error_middleware_1.AppError('Cannot chat with yourself', 400);
        // Check block status
        const blocked = await prisma_1.default.block.findFirst({
            where: { OR: [{ blockerId: myId, blockedId: userId }, { blockerId: userId, blockedId: myId }] },
        });
        if (blocked)
            throw new error_middleware_1.AppError('Cannot start a conversation with this user', 403);
        // Ensure consistent ordering for uniqueness
        const [user1Id, user2Id] = [myId, userId].sort();
        const conversation = await prisma_1.default.conversation.upsert({
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
    }
    catch (err) {
        next(err);
    }
};
exports.getOrCreateConversation = getOrCreateConversation;
// ─── GET MESSAGES ────────────────────────────────────────────────────────────
const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        // Verify access
        const conversation = await prisma_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation)
            throw new error_middleware_1.AppError('Conversation not found', 404);
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            throw new error_middleware_1.AppError('Access denied', 403);
        }
        const [messages, total] = await Promise.all([
            prisma_1.default.message.findMany({
                where: { conversationId, deletedAt: null },
                include: { attachments: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.message.count({ where: { conversationId, deletedAt: null } }),
        ]);
        // Mark messages from other user as read
        await prisma_1.default.message.updateMany({
            where: { conversationId, senderId: { not: userId }, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        // Reset unread count for this user
        await prisma_1.default.conversation.update({
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
    }
    catch (err) {
        next(err);
    }
};
exports.getMessages = getMessages;
// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;
        const { content, type = 'TEXT' } = req.body;
        const conversation = await prisma_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation)
            throw new error_middleware_1.AppError('Conversation not found', 404);
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            throw new error_middleware_1.AppError('Access denied', 403);
        }
        const isUser1 = conversation.user1Id === userId;
        const message = await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (err) {
        next(err);
    }
};
exports.sendMessage = sendMessage;
// ─── DELETE MESSAGE ──────────────────────────────────────────────────────────
const deleteMessage = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;
        const message = await prisma_1.default.message.findUnique({ where: { id: messageId } });
        if (!message)
            throw new error_middleware_1.AppError('Message not found', 404);
        if (message.senderId !== userId)
            throw new error_middleware_1.AppError('Cannot delete others\' messages', 403);
        // Soft delete
        await prisma_1.default.message.update({
            where: { id: messageId },
            data: { deletedAt: new Date(), content: null },
        });
        res.json({ success: true, message: 'Message deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteMessage = deleteMessage;
// ─── MARK CONVERSATION READ ───────────────────────────────────────────────────
const markConversationRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;
        const conversation = await prisma_1.default.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation)
            throw new error_middleware_1.AppError('Conversation not found', 404);
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            throw new error_middleware_1.AppError('Access denied', 403);
        }
        await prisma_1.default.conversation.update({
            where: { id: conversationId },
            data: {
                user1UnreadCount: conversation.user1Id === userId ? 0 : undefined,
                user2UnreadCount: conversation.user2Id === userId ? 0 : undefined,
            },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.markConversationRead = markConversationRead;
//# sourceMappingURL=chat.controller.js.map