"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = setupChatSocket;
const prisma_1 = __importDefault(require("@config/prisma"));
const logger_1 = __importDefault(require("@utils/logger"));
function setupChatSocket(io, socket, userId) {
    // ─── JOIN CONVERSATION ROOM ──────────────────────────────────────────────────
    socket.on('chat:join', async ({ conversationId }) => {
        try {
            // Verify access
            const conv = await prisma_1.default.conversation.findUnique({ where: { id: conversationId } });
            if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId))
                return;
            socket.join(`conversation:${conversationId}`);
            socket.emit('chat:joined', { conversationId });
        }
        catch (err) {
            logger_1.default.error('chat:join error', err);
        }
    });
    // ─── LEAVE CONVERSATION ROOM ─────────────────────────────────────────────────
    socket.on('chat:leave', ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`);
    });
    // ─── SEND MESSAGE ────────────────────────────────────────────────────────────
    socket.on('chat:message', async ({ conversationId, content, type = 'TEXT', tempId, }) => {
        try {
            const conv = await prisma_1.default.conversation.findUnique({ where: { id: conversationId } });
            if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId))
                return;
            const isUser1 = conv.user1Id === userId;
            const otherUserId = isUser1 ? conv.user2Id : conv.user1Id;
            // Save message
            const message = await prisma_1.default.message.create({
                data: {
                    conversationId,
                    senderId: userId,
                    content,
                    type: type,
                    isDelivered: false,
                },
                include: { sender: { select: { id: true, gender: true } } },
            });
            // Update conversation
            await prisma_1.default.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: content?.substring(0, 100) || `[${type}]`,
                    lastMessageAt: message.createdAt,
                    lastMessageBy: userId,
                    user1UnreadCount: isUser1 ? 0 : { increment: 1 },
                    user2UnreadCount: isUser1 ? { increment: 1 } : 0,
                },
            });
            // Emit to all in conversation room (sender gets confirmation)
            io.to(`conversation:${conversationId}`).emit('chat:message', {
                ...message,
                tempId, // client can match this to optimistic update
            });
            // Mark delivered if recipient is in conversation room
            const recipientSocket = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
            const recipientOnline = recipientSocket && recipientSocket.size > 1;
            if (recipientOnline) {
                await prisma_1.default.message.update({
                    where: { id: message.id },
                    data: { isDelivered: true, deliveredAt: new Date() },
                });
                io.to(`conversation:${conversationId}`).emit('chat:delivered', {
                    messageId: message.id,
                    conversationId,
                });
            }
            // Send notification to recipient's personal room
            io.to(`user:${otherUserId}`).emit('notification:message', {
                conversationId,
                message: { id: message.id, content, type },
                from: { userId },
            });
        }
        catch (err) {
            logger_1.default.error('chat:message error', err);
            socket.emit('chat:error', { message: 'Failed to send message' });
        }
    });
    // ─── MESSAGE READ RECEIPT ────────────────────────────────────────────────────
    socket.on('chat:read', async ({ conversationId, messageIds }) => {
        try {
            await prisma_1.default.message.updateMany({
                where: {
                    id: { in: messageIds },
                    conversationId,
                    senderId: { not: userId },
                    isRead: false,
                },
                data: { isRead: true, readAt: new Date() },
            });
            socket.to(`conversation:${conversationId}`).emit('chat:read', {
                conversationId,
                messageIds,
                readBy: userId,
                readAt: new Date(),
            });
        }
        catch (err) {
            logger_1.default.error('chat:read error', err);
        }
    });
    // ─── MESSAGE DELIVERED ────────────────────────────────────────────────────────
    socket.on('chat:delivered', async ({ messageId }) => {
        try {
            const msg = await prisma_1.default.message.update({
                where: { id: messageId },
                data: { isDelivered: true, deliveredAt: new Date() },
            });
            io.to(`conversation:${msg.conversationId}`).emit('chat:delivered', {
                messageId,
                conversationId: msg.conversationId,
            });
        }
        catch {
            // Ignore delivery confirmation errors
        }
    });
}
//# sourceMappingURL=chat.socket.js.map