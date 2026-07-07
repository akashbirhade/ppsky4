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
    const { data } = await chatService.getConversations();
    const conversations = data.data?.conversations || [];
    const unreadCount = conversations.reduce(
      (acc: number, c: any) => acc + (c.unreadCount || 0), 0
    );
    set({ conversations, unreadCount });
  },

  loadMessages: async (conversationId) => {
    const { data } = await chatService.getMessages(conversationId);
    set({ currentMessages: data.data?.messages || data.data || [], activeConversation: conversationId });
    socketService.joinConversation(conversationId);
  },

  sendMessage: async (conversationId, content, type = 'TEXT') => {
    const { data } = await chatService.sendMessage(conversationId, { content, type });
    const newMessage = data.data;
    set((state) => ({
      currentMessages: [...state.currentMessages, newMessage],
    }));
  },

  setActiveConversation: (id) => {
    const prev = get().activeConversation;
    if (prev) socketService.leaveConversation(prev);
    if (id) socketService.joinConversation(id);
    set({ activeConversation: id, currentMessages: [] });
  },

  addIncomingMessage: (message) => {
    const { activeConversation } = get();
    if (message.conversationId === activeConversation) {
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
    }
    // Update conversation list
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === message.conversationId
          ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
          : c
      ),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (conversationId) => {
    await chatService.markAsRead(conversationId);
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, user1UnreadCount: 0, user2UnreadCount: 0 } : c
      ),
    }));
  },

  setTyping: (isTyping, userId) => {
    set({ isTyping, typingUserId: userId || null });
  },
}));
