import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '@/constants';

// ─── SOCKET SERVICE ───────────────────────────────────────────────────────────

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  async connect() {
    // Disconnect existing socket to avoid duplicates
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Re-emit all registered events
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.on(event, cb));
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  // ─── CHAT EVENTS ─────────────────────────────────────────────────────────────

  joinConversation(conversationId: string) {
    this.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.emit('leave_conversation', { conversationId });
  }

  sendTyping(conversationId: string) {
    this.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.emit('stop_typing', { conversationId });
  }

  // ─── CALL EVENTS ─────────────────────────────────────────────────────────────

  joinCallRoom(roomId: string) {
    this.emit('join_call', { roomId });
  }

  leaveCallRoom(roomId: string) {
    this.emit('leave_call', { roomId });
  }

  sendCallSignal(data: { roomId: string; signal: any; to: string }) {
    this.emit('call_signal', data);
  }
}

export const socketService = new SocketService();
