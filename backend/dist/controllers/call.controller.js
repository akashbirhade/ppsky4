"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissedCalls = exports.getCallHistory = exports.endCall = exports.answerCall = exports.initiateCall = void 0;
const prisma_1 = __importDefault(require("@config/prisma"));
const error_middleware_1 = require("@middleware/error.middleware");
const uuid_1 = require("uuid");
const index_1 = require("@config/index");
// ─── INITIATE CALL ───────────────────────────────────────────────────────────
const initiateCall = async (req, res, next) => {
    try {
        const callerId = req.user.userId;
        const { receiverId, type } = req.body;
        if (callerId === receiverId)
            throw new error_middleware_1.AppError('Cannot call yourself', 400);
        // Video calls require premium
        if (type === 'VIDEO') {
            const sub = await prisma_1.default.subscription.findUnique({ where: { userId: callerId } });
            if (!sub?.videoCallingAccess || !sub.isActive) {
                throw new error_middleware_1.AppError('Video calling requires a premium subscription', 402);
            }
        }
        // Check block
        const blocked = await prisma_1.default.block.findFirst({
            where: { OR: [{ blockerId: callerId, blockedId: receiverId }, { blockerId: receiverId, blockedId: callerId }] },
        });
        if (blocked)
            throw new error_middleware_1.AppError('Cannot call this user', 403);
        const roomId = (0, uuid_1.v4)();
        const call = await prisma_1.default.call.create({
            data: { callerId, receiverId, type, status: 'INITIATED', roomId },
            include: {
                caller: {
                    select: {
                        id: true, gender: true,
                        profile: { select: { firstName: true, lastName: true } },
                        photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                    },
                },
                receiver: {
                    select: {
                        id: true, gender: true,
                        profile: { select: { firstName: true, lastName: true } },
                        photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                    },
                },
            },
        });
        // ICE configuration for WebRTC
        const iceConfiguration = {
            iceServers: [
                { urls: index_1.config.webrtc.stunServer },
                ...(index_1.config.webrtc.turnServer
                    ? [{
                            urls: index_1.config.webrtc.turnServer,
                            username: index_1.config.webrtc.turnUsername,
                            credential: index_1.config.webrtc.turnCredential,
                        }]
                    : []),
            ],
        };
        res.status(201).json({
            success: true,
            data: { call, roomId, iceConfiguration },
            message: 'Call initiated',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.initiateCall = initiateCall;
// ─── ANSWER CALL ─────────────────────────────────────────────────────────────
const answerCall = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { callId } = req.params;
        const { accept } = req.body;
        const call = await prisma_1.default.call.findUnique({ where: { id: callId } });
        if (!call)
            throw new error_middleware_1.AppError('Call not found', 404);
        if (call.receiverId !== userId)
            throw new error_middleware_1.AppError('Not authorized', 403);
        if (call.status !== 'INITIATED' && call.status !== 'RINGING') {
            throw new error_middleware_1.AppError('Call is not in a ringing state', 400);
        }
        const updated = await prisma_1.default.call.update({
            where: { id: callId },
            data: {
                status: accept ? 'CONNECTED' : 'DECLINED',
                startedAt: accept ? new Date() : undefined,
            },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.answerCall = answerCall;
// ─── END CALL ────────────────────────────────────────────────────────────────
const endCall = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { callId } = req.params;
        const call = await prisma_1.default.call.findUnique({ where: { id: callId } });
        if (!call)
            throw new error_middleware_1.AppError('Call not found', 404);
        if (call.callerId !== userId && call.receiverId !== userId) {
            throw new error_middleware_1.AppError('Not authorized', 403);
        }
        const endedAt = new Date();
        const duration = call.startedAt
            ? Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000)
            : 0;
        const updated = await prisma_1.default.call.update({
            where: { id: callId },
            data: { status: 'ENDED', endedAt, duration },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.endCall = endCall;
// ─── CALL HISTORY ────────────────────────────────────────────────────────────
const getCallHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const [calls, total] = await Promise.all([
            prisma_1.default.call.findMany({
                where: { OR: [{ callerId: userId }, { receiverId: userId }] },
                include: {
                    caller: {
                        select: {
                            id: true, gender: true,
                            profile: { select: { firstName: true, lastName: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                    receiver: {
                        select: {
                            id: true, gender: true,
                            profile: { select: { firstName: true, lastName: true } },
                            photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.call.count({ where: { OR: [{ callerId: userId }, { receiverId: userId }] } }),
        ]);
        const formattedCalls = calls.map((call) => ({
            ...call,
            direction: call.callerId === userId ? 'outgoing' : 'incoming',
            isMissed: call.status === 'MISSED' && call.receiverId === userId,
        }));
        res.json({ success: true, data: { calls: formattedCalls, total, page, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getCallHistory = getCallHistory;
// ─── MISSED CALLS ─────────────────────────────────────────────────────────────
const getMissedCalls = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const calls = await prisma_1.default.call.findMany({
            where: { receiverId: userId, status: 'MISSED' },
            include: {
                caller: {
                    select: {
                        id: true, gender: true,
                        profile: { select: { firstName: true, lastName: true } },
                        photos: { where: { isMain: true }, select: { url: true }, take: 1 },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: calls });
    }
    catch (err) {
        next(err);
    }
};
exports.getMissedCalls = getMissedCalls;
//# sourceMappingURL=call.controller.js.map