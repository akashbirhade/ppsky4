import { create } from 'zustand';
import { matchService } from '@/services';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MatchProfile {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  city?: string;
  profession?: string;
  isVerified?: boolean;
  bio?: string;
  religion?: string;
  education?: string;
  user: {
    id: string;
    gender: string;
    photos: Array<{ url: string; isMain: boolean }>;
  };
}

interface MatchState {
  newProfiles: MatchProfile[];
  recommendedProfiles: MatchProfile[];
  nearbyProfiles: MatchProfile[];
  receivedLikes: MatchProfile[];
  sentLikes: MatchProfile[];
  viewedByMe: MatchProfile[];
  favorites: MatchProfile[];
  isLoading: boolean;
  currentFeed: 'new' | 'recommended' | 'nearby' | 'verified' | 'premium';

  // Actions
  loadNewProfiles: (page?: number) => Promise<void>;
  loadRecommended: (page?: number) => Promise<void>;
  loadNearby: (lat?: number, lng?: number) => Promise<void>;
  loadReceivedLikes: () => Promise<void>;
  loadSentLikes: () => Promise<void>;
  loadViewedByMe: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  likeProfile: (userId: string) => Promise<boolean>;
  superLikeProfile: (userId: string, message?: string) => Promise<void>;
  skipProfile: (userId: string) => void;
  addToFavorites: (userId: string) => Promise<void>;
  removeFavorite: (userId: string) => Promise<void>;
  setFeed: (feed: MatchState['currentFeed']) => void;
}

// ─── MATCH STORE ──────────────────────────────────────────────────────────────

export const useMatchStore = create<MatchState>((set, get) => ({
  newProfiles: [],
  recommendedProfiles: [],
  nearbyProfiles: [],
  receivedLikes: [],
  sentLikes: [],
  viewedByMe: [],
  favorites: [],
  isLoading: false,
  currentFeed: 'new',

  loadNewProfiles: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await matchService.getNewProfiles({ page });
      set({ newProfiles: data.data?.profiles || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  loadRecommended: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await matchService.getRecommended({ page });
      set({ recommendedProfiles: data.data?.profiles || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNearby: async (lat, lng) => {
    set({ isLoading: true });
    try {
      const { data } = await matchService.getNearMe({ lat, lng });
      set({ nearbyProfiles: data.data?.profiles || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  loadReceivedLikes: async () => {
    try {
      const { data } = await matchService.getReceivedLikes();
      set({ receivedLikes: data.data?.profiles || [] });
    } catch {
      // Premium required - fail silently
    }
  },

  loadSentLikes: async () => {
    try {
      const { data } = await matchService.getSentLikes();
      set({ sentLikes: data.data?.likes || [] });
    } catch {
      // fail silently
    }
  },

  loadViewedByMe: async () => {
    try {
      const { data } = await matchService.getViewedByMe();
      set({ viewedByMe: data.data?.views || [] });
    } catch {
      // fail silently
    }
  },

  loadFavorites: async () => {
    const { data } = await matchService.getFavorites();
    set({ favorites: data.data?.favorites || [] });
  },

  likeProfile: async (userId) => {
    const { data } = await matchService.likeProfile(userId);
    // Remove from current feed
    set((state) => ({
      newProfiles: state.newProfiles.filter((p) => p.user.id !== userId),
      recommendedProfiles: state.recommendedProfiles.filter((p) => p.user.id !== userId),
    }));
    return data.data?.isMatch || false;
  },

  superLikeProfile: async (userId, message) => {
    await matchService.superLike(userId, message);
    set((state) => ({
      newProfiles: state.newProfiles.filter((p) => p.user.id !== userId),
      recommendedProfiles: state.recommendedProfiles.filter((p) => p.user.id !== userId),
    }));
  },

  skipProfile: (userId) => {
    set((state) => ({
      newProfiles: state.newProfiles.filter((p) => p.user.id !== userId),
      recommendedProfiles: state.recommendedProfiles.filter((p) => p.user.id !== userId),
    }));
  },

  addToFavorites: async (userId) => {
    await matchService.addFavorite(userId);
  },

  removeFavorite: async (userId) => {
    await matchService.removeFavorite(userId);
    set((state) => ({
      favorites: state.favorites.filter((p) => p.user.id !== userId),
    }));
  },

  setFeed: (feed) => set({ currentFeed: feed }),
}));
