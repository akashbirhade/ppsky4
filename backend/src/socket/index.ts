import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '@utils/jwt';
import { config } from '@config/index';
import prisma from '@config/prisma';
import logger from '@utils/logger';
import { setupChatSocket } from './chat.socket';
import { setupCallSocket } from './call.socket';

// Track online users: userId -> Set<socketId>
export const onlineUsers = new Map<string, Set<string>>();

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // ─── JWT Authentication Middleware ──────────────────────────────────────────
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) return next(new Error('Authentication token required'));

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, accountStatus: true, gender: true },
      });

      if (!user || user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
        return next(new Error('Account not authorized'));
      }

      (socket as any).userId = payload.userId;
      (socket as any).gender = user.gender;
      next();
    } catch {
      next(new Error('Invalid authentication token'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', async (socket: Socket) => {
    const userId: string = (socket as any).userId;
    logger.info(`Socket connected: ${userId} [${socket.id}]`);

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Update DB last active
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    }).catch(() => {});

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Notify contacts that this user is online
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }], isActive: true },
      select: { user1Id: true, user2Id: true },
    }).catch(() => []);

    const contactIds = conversations.map((c) =>
      c.user1Id === userId ? c.user2Id : c.user1Id
    );

    contactIds.forEach((contactId) => {
      io.to(`user:${contactId}`).emit('user:online', { userId, isOnline: true });
    });

    // ─── Setup Domain Handlers ─────────────────────────────────────────────────
    setupChatSocket(io, socket, userId);
    setupCallSocket(io, socket, userId);

    // ─── Typing Indicators ────────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId, conversationId });
    });

    socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId, conversationId });
    });

    // ─── Online Status Query ──────────────────────────────────────────────────
    socket.on('user:is-online', ({ targetUserId }: { targetUserId: string }, callback) => {
      const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId)!.size > 0;
      if (typeof callback === 'function') callback({ isOnline });
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${userId} [${socket.id}] - ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Update last active
          await prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date() },
          }).catch(() => {});

          // Notify contacts user went offline
          contactIds.forEach((contactId) => {
            io.to(`user:${contactId}`).emit('user:online', { userId, isOnline: false });
          });
        }
      }
    });
  });

  logger.info('Socket.io initialized');
  return io;
}
