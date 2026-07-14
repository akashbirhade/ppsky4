import { create } from 'zustand';
import { chatService } from '@/services';
import { socketService } from '@/services/socket';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageBy?: string;
  unreadCount?: number;
  user1UnreadCount: number;
  user2UnreadCount: number;
  isActive: boolean;
  otherUser?: {
    id: string;
    username: string;
    profile?: { firstName: string; lastName: string; city?: string };
    photos?: Array<{ url: string; isMain: boolean }>;
    lastActive?: string;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  attachments?: any[];
  isDelivered: boolean;
  isRead: boolean;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  activeConversation: string | null;
  isTyping: boolean;
  typingUserId: string | null;
  unreadCount: number;

  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  addIncomingMessage: (message: Message) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  setTyping: (isTyping: boolean, userId?: string) => void;
}

// ─── CHAT STORE ───────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentMessages: [],
  activeConversation: null,
  isTyping: false,
  typingUserId: null,
  unreadCount: 0,

  loadConversations: async () => {
    try {
      const { data } = await chatService.getConversations();
      const conversations = data.data?.conversations || [];
      const unreadCount = conversations.reduce(
        (acc: number, c: any) => acc + (c.unreadCount || 0), 0
      );
      set({ conversations, unreadCount });
    } catch {
      // Network error - keep existing state
    }
  },

  loadMessages: async (conversationId) => {
    try {
      const { data } = await chatService.getMessages(conversationId);
      set({ currentMessages: data.data?.messages || data.data || [], activeConversation: conversationId });
      socketService.joinConversation(conversationId);
    } catch {
      // Network error - keep existing state
    }
  },

  sendMessage: async (conversationId, content, type = 'TEXT') => {
    try {
      const { data } = await chatService.sendMessage(conversationId, { content, type });
      const newMessage = data.data;
      if (newMessage) {
        set((state) => ({
          currentMessages: [...state.currentMessages, newMessage],
        }));
      }
    } catch {
      // Message send failed - could add retry UI here
    }
  },

  setActiveConversation: (id) => {
    const prev = get().activeConversation;
    if (prev) socketService.leaveConversation(prev);
    if (id) socketService.joinConversation(id);
    set({ activeConversation: id, currentMessages: [] });
  },

  addIncomingMessage: (message) => {
    const { activeConversation } = get();
    const isActive = message.conversationId === activeConversation;
    if (isActive) {
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    }
    // Update conversation list + unread counters (skip if chat is open)
    set((state) => {
      let deltaUnread = 0;
      const conversations = state.conversations.map((c) => {
        if (c.id !== message.conversationId) return c;
        const inc = isActive ? 0 : 1;
        if (inc) deltaUnread = 1;
        return {
          ...c,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastMessageBy: message.senderId,
          unreadCount: (c.unreadCount || 0) + inc,
        };
      });
      return { conversations, unreadCount: state.unreadCount + deltaUnread };
    });
  },

  markAsRead: async (conversationId) => {
    await chatService.markAsRead(conversationId);
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      const cleared = conv?.unreadCount || 0;
      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, unreadCount: 0, user1UnreadCount: 0, user2UnreadCount: 0 }
            : c
        ),
        unreadCount: Math.max(0, state.unreadCount - cleared),
      };
    });
  },

  setTyping: (isTyping, userId) => {
    set({ isTyping, typingUserId: userId || null });
  },
}));
