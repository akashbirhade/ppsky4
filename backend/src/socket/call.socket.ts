/**
 * WebRTC Signaling via Socket.io
 *
 * Flow:
 * 1. Caller: call:initiate  → Server stores call, emits call:incoming to receiver's room
 * 2. Receiver: call:accept  → Server emits call:accepted to caller
 *    OR Receiver: call:reject → Server emits call:rejected to caller
 * 3. Both exchange WebRTC offer/answer/ICE candidates via call:offer, call:answer, call:ice
 * 4. Either party: call:end → Server marks call ended, emits call:ended to both
 */

import { Server, Socket } from 'socket.io';
import prisma from '@config/prisma';
import logger from '@utils/logger';

// Track auto-miss timers so they can be cancelled when a call is answered/rejected/ended
const callTimers = new Map<string, NodeJS.Timeout>();

export function setupCallSocket(io: Server, socket: Socket, userId: string): void {
  // ─── JOIN CALL ROOM ──────────────────────────────────────────────────────────
  socket.on('call:join-room', ({ roomId }: { roomId: string }) => {
    socket.join(`call:${roomId}`);
    socket.to(`call:${roomId}`).emit('call:peer-joined', { userId });
    logger.info(`User ${userId} joined call room: ${roomId}`);
  });

  // ─── NOTIFY INCOMING CALL ────────────────────────────────────────────────────
  // Called after REST API creates the call record
  socket.on('call:notify', async ({ callId, receiverId }: { callId: string; receiverId: string }) => {
    try {
      const call = await prisma.call.findUnique({
        where: { id: callId },
        include: {
          caller: {
            select: {
              id: true, gender: true,
              profile: { select: { firstName: true, lastName: true } },
              photos: { where: { isMain: true }, select: { url: true }, take: 1 },
            },
          },
        },
      });

      if (!call || call.callerId !== userId) return;

      await prisma.call.update({ where: { id: callId }, data: { status: 'RINGING' } });

      io.to(`user:${receiverId}`).emit('call:incoming', {
        callId: call.id,
        roomId: call.roomId,
        type: call.type,
        caller: call.caller,
      });

      // Auto-miss after 45 seconds if not answered
      const timer = setTimeout(async () => {
        callTimers.delete(callId);
        const current = await prisma.call.findUnique({ where: { id: callId } });
        if (current?.status === 'RINGING') {
          await prisma.call.update({ where: { id: callId }, data: { status: 'MISSED' } });
          io.to(`user:${receiverId}`).emit('call:missed', { callId });
          io.to(`user:${userId}`).emit('call:missed', { callId });
        }
      }, 45000);
      callTimers.set(callId, timer);
    } catch (err) {
      logger.error('call:notify error', err);
    }
  });

  // ─── ACCEPT CALL ─────────────────────────────────────────────────────────────
  socket.on('call:accept', async ({ callId }: { callId: string }) => {
    try {
      // Cancel auto-miss timer
      const timer = callTimers.get(callId);
      if (timer) { clearTimeout(timer); callTimers.delete(callId); }

      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call || call.receiverId !== userId) return;

      await prisma.call.update({
        where: { id: callId },
        data: { status: 'CONNECTED', startedAt: new Date() },
      });

      socket.join(`call:${call.roomId}`);
      io.to(`user:${call.callerId}`).emit('call:accepted', { callId, roomId: call.roomId });
    } catch (err) {
      logger.error('call:accept error', err);
    }
  });

  // ─── REJECT CALL ─────────────────────────────────────────────────────────────
  socket.on('call:reject', async ({ callId }: { callId: string }) => {
    try {
      // Cancel auto-miss timer
      const timer = callTimers.get(callId);
      if (timer) { clearTimeout(timer); callTimers.delete(callId); }

      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call || call.receiverId !== userId) return;

      await prisma.call.update({ where: { id: callId }, data: { status: 'DECLINED' } });
      io.to(`user:${call.callerId}`).emit('call:rejected', { callId });
    } catch (err) {
      logger.error('call:reject error', err);
    }
  });

  // ─── END CALL ─────────────────────────────────────────────────────────────────
  socket.on('call:end', async ({ callId }: { callId: string }) => {
    try {
      // Cancel auto-miss timer
      const timer = callTimers.get(callId);
      if (timer) { clearTimeout(timer); callTimers.delete(callId); }

      const call = await prisma.call.findUnique({ where: { id: callId } });
      if (!call || (call.callerId !== userId && call.receiverId !== userId)) return;

      const endedAt = new Date();
      const duration = call.startedAt
        ? Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000)
        : 0;

      await prisma.call.update({
        where: { id: callId },
        data: { status: 'ENDED', endedAt, duration },
      });

      io.to(`call:${call.roomId}`).emit('call:ended', { callId, duration });
    } catch (err) {
      logger.error('call:end error', err);
    }
  });

  // ─── WEBRTC SIGNALING ─────────────────────────────────────────────────────────

  // Caller sends SDP offer
  socket.on('call:offer', ({ roomId, sdp }: { roomId: string; sdp: { type: string; sdp?: string } }) => {
    socket.to(`call:${roomId}`).emit('call:offer', { sdp, from: userId });
  });

  // Receiver sends SDP answer
  socket.on('call:answer', ({ roomId, sdp }: { roomId: string; sdp: { type: string; sdp?: string } }) => {
    socket.to(`call:${roomId}`).emit('call:answer', { sdp, from: userId });
  });

  // ICE Candidate exchange
  socket.on(
    'call:ice',
    ({ roomId, candidate }: { roomId: string; candidate: { candidate?: string; sdpMid?: string | null; sdpMLineIndex?: number | null } }) => {
      socket.to(`call:${roomId}`).emit('call:ice', { candidate, from: userId });
    }
  );

  // ─── CALL QUALITY / EVENTS ────────────────────────────────────────────────────

  socket.on('call:toggle-video', ({ roomId, enabled }: { roomId: string; enabled: boolean }) => {
    socket.to(`call:${roomId}`).emit('call:video-toggled', { userId, enabled });
  });

  socket.on('call:toggle-audio', ({ roomId, enabled }: { roomId: string; enabled: boolean }) => {
    socket.to(`call:${roomId}`).emit('call:audio-toggled', { userId, enabled });
  });
}
