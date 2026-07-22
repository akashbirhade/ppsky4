"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
exports.setupSocketIO = setupSocketIO;
const socket_io_1 = require("socket.io");
const jwt_1 = require("@utils/jwt");
const index_1 = require("@config/index");
const prisma_1 = __importDefault(require("@config/prisma"));
const logger_1 = __importDefault(require("@utils/logger"));
const chat_socket_1 = require("./chat.socket");
const call_socket_1 = require("./call.socket");
// Track online users: userId -> Set<socketId>
exports.onlineUsers = new Map();
function setupSocketIO(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: index_1.config.cors.allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
    });
    // ─── JWT Authentication Middleware ──────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token)
                return next(new Error('Authentication token required'));
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const user = await prisma_1.default.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, accountStatus: true, gender: true },
            });
            if (!user || user.accountStatus === 'BANNED' || user.accountStatus === 'SUSPENDED') {
                return next(new Error('Account not authorized'));
            }
            socket.userId = payload.userId;
            socket.gender = user.gender;
            next();
        }
        catch {
            next(new Error('Invalid authentication token'));
        }
    });
    // ─── Connection Handler ─────────────────────────────────────────────────────
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        logger_1.default.info(`Socket connected: ${userId} [${socket.id}]`);
        // Track online presence
        if (!exports.onlineUsers.has(userId)) {
            exports.onlineUsers.set(userId, new Set());
        }
        exports.onlineUsers.get(userId).add(socket.id);
        // Update DB last active
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { lastActive: new Date() },
        }).catch(() => { });
        // Join personal room for direct notifications
        socket.join(`user:${userId}`);
        // Notify contacts that this user is online
        const conversations = await prisma_1.default.conversation.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }], isActive: true },
            select: { user1Id: true, user2Id: true },
        }).catch(() => []);
        const contactIds = conversations.map((c) => c.user1Id === userId ? c.user2Id : c.user1Id);
        contactIds.forEach((contactId) => {
            io.to(`user:${contactId}`).emit('user:online', { userId, isOnline: true });
        });
        // ─── Setup Domain Handlers ─────────────────────────────────────────────────
        (0, chat_socket_1.setupChatSocket)(io, socket, userId);
        (0, call_socket_1.setupCallSocket)(io, socket, userId);
        // ─── Typing Indicators ────────────────────────────────────────────────────
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', { userId, conversationId });
        });
        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId, conversationId });
        });
        // ─── Online Status Query ──────────────────────────────────────────────────
        socket.on('user:is-online', ({ targetUserId }, callback) => {
            const isOnline = exports.onlineUsers.has(targetUserId) && exports.onlineUsers.get(targetUserId).size > 0;
            if (typeof callback === 'function')
                callback({ isOnline });
        });
        // ─── Disconnect ───────────────────────────────────────────────────────────
        socket.on('disconnect', async (reason) => {
            logger_1.default.info(`Socket disconnected: ${userId} [${socket.id}] - ${reason}`);
            const userSockets = exports.onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    exports.onlineUsers.delete(userId);
                    // Update last active
                    await prisma_1.default.user.update({
                        where: { id: userId },
                        data: { lastActive: new Date() },
                    }).catch(() => { });
                    // Notify contacts user went offline
                    contactIds.forEach((contactId) => {
                        io.to(`user:${contactId}`).emit('user:online', { userId, isOnline: false });
                    });
                }
            }
        });
    });
    logger_1.default.info('Socket.io initialized');
    return io;
}
//# sourceMappingURL=index.js.map