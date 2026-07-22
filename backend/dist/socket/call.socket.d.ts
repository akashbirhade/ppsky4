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
export declare function setupCallSocket(io: Server, socket: Socket, userId: string): void;
//# sourceMappingURL=call.socket.d.ts.map