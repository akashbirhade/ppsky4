import { Request, Response, NextFunction } from 'express';
import prisma from '@config/prisma';
import { AppError } from '@middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@config/index';

// ─── INITIATE CALL ───────────────────────────────────────────────────────────

export const initiateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerId = req.user!.userId;
    const { receiverId, type } = req.body;

    if (callerId === receiverId) throw new AppError('Cannot call yourself', 400);

    // Video calls require premium
    if (type === 'VIDEO') {
      const sub = await prisma.subscription.findUnique({ where: { userId: callerId } });
      if (!sub?.videoCallingAccess || !sub.isActive) {
        throw new AppError('Video calling requires a premium subscription', 402);
      }
    }

    // Check block
    const blocked = await prisma.block.findFirst({
      where: { OR: [{ blockerId: callerId, blockedId: receiverId }, { blockerId: receiverId, blockedId: callerId }] },
    });
    if (blocked) throw new AppError('Cannot call this user', 403);

    const roomId = uuidv4();

    const call = await prisma.call.create({
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
        { urls: config.webrtc.stunServer },
        ...(config.webrtc.turnServer
          ? [{
              urls: config.webrtc.turnServer,
              username: config.webrtc.turnUsername,
              credential: config.webrtc.turnCredential,
            }]
          : []),
      ],
    };

    res.status(201).json({
      success: true,
      data: { call, roomId, iceConfiguration },
      message: 'Call initiated',
    });
  } catch (err) { next(err); }
};

// ─── ANSWER CALL ─────────────────────────────────────────────────────────────

export const answerCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { callId } = req.params;
    const { accept } = req.body;

    const call = await prisma.call.findUnique({ where: { id: callId } });
    if (!call) throw new AppError('Call not found', 404);
    if (call.receiverId !== userId) throw new AppError('Not authorized', 403);
    if (call.status !== 'INITIATED' && call.status !== 'RINGING') {
      throw new AppError('Call is not in a ringing state', 400);
    }

    const updated = await prisma.call.update({
      where: { id: callId },
      data: {
        status: accept ? 'CONNECTED' : 'DECLINED',
        startedAt: accept ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── END CALL ────────────────────────────────────────────────────────────────

export const endCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { callId } = req.params;

    const call = await prisma.call.findUnique({ where: { id: callId } });
    if (!call) throw new AppError('Call not found', 404);
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new AppError('Not authorized', 403);
    }

    const endedAt = new Date();
    const duration = call.startedAt
      ? Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000)
      : 0;

    const updated = await prisma.call.update({
      where: { id: callId },
      data: { status: 'ENDED', endedAt, duration },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── CALL HISTORY ────────────────────────────────────────────────────────────

export const getCallHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
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
      prisma.call.count({ where: { OR: [{ callerId: userId }, { receiverId: userId }] } }),
    ]);

    const formattedCalls = calls.map((call) => ({
      ...call,
      direction: call.callerId === userId ? 'outgoing' : 'incoming',
      isMissed: call.status === 'MISSED' && call.receiverId === userId,
    }));

    res.json({ success: true, data: { calls: formattedCalls, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ─── MISSED CALLS ─────────────────────────────────────────────────────────────

export const getMissedCalls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const calls = await prisma.call.findMany({
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
  } catch (err) { next(err); }
};
