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
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: number;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  maritalStatus?: string;
  compatibilityScore?: number;
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
    set({ user: data.data.user, isAuthenticated: true, isOnboarded: true });
    socketService.connect();
    // Load full profile after login
    try {
      await get().loadUser();
    } catch {}
  },

  register: async (registerData) => {
    const { data } = await authService.register(registerData);
    await SecureStore.setItemAsync('accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true, isOnboarded: false });
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
      const profileData = data.data;
      const userData = profileData.user;
      // Merge: user object gets profile fields nested inside
      const user = {
        ...userData,
        profile: {
          id: profileData.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth,
          age: profileData.age,
          height: profileData.height,
          religion: profileData.religion,
          caste: profileData.caste,
          motherTongue: profileData.motherTongue,
          education: profileData.education,
          profession: profileData.profession,
          annualIncome: profileData.annualIncome,
          city: profileData.city,
          state: profileData.state,
          bio: profileData.bio,
          hobbies: profileData.hobbies,
          isVerified: profileData.isVerified,
          profileCompletionPercentage: profileData.profileCompletionPercentage,
          whatsappNumber: profileData.whatsappNumber,
          whatsappVisible: profileData.whatsappVisible,
        },
      };
      set({ user, isAuthenticated: true, isLoading: false, isOnboarded: true });
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
