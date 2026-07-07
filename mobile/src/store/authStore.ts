import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService, profileService } from '@/services';
import { socketService } from '@/services/socket';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  username: string;
  email: string;
  gender: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  subscription?: { plan: string; isActive: boolean };
  photos: Array<{ id: string; url: string; isMain: boolean; order: number }>;
  profile?: Profile;
  preferences?: any;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  height?: number;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  education?: string;
  profession?: string;
  annualIncome?: string;
  city?: string;
  state?: string;
  bio?: string;
  hobbies?: string[];
  isVerified?: boolean;
  profileCompletionPercentage?: number;
  whatsappNumber?: string;
  whatsappVisible?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  setOnboarded: (val: boolean) => void;
}

// ─── AUTH STORE ───────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,

  login: async (email, password) => {
    const { data } = await authService.login({ email, password });
    await SecureStore.setItemAsync('accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
    socketService.connect();
  },

  register: async (registerData) => {
    const { data } = await authService.register(registerData);
    await SecureStore.setItemAsync('accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
    socketService.connect();
  },

  logout: async () => {
    try { await authService.logout(); } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    socketService.disconnect();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await profileService.getMyProfile();
      set({ user: data.data?.user || data.data, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...data } });
  },

  updateProfile: async (profileData) => {
    await profileService.updateProfile(profileData);
    const current = get().user;
    if (current) {
      set({ user: { ...current, profile: { ...current.profile!, ...profileData } } });
    }
  },

  setOnboarded: (val) => set({ isOnboarded: val }),
}));
