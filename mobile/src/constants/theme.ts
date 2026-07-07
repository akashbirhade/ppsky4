// ─── SOULMATE SYNC — PREMIUM THEME ───────────────────────────────────────────
// Luxurious, modern color system with deep purples, soft golds, and clean whites

export const Colors = {
  // Primary brand — Rich Purple (premium feel)
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  primarySoft: '#F5F3FF',
  primaryMuted: '#EDE9FE',

  // Secondary accent — Warm Rose Gold
  secondary: '#F472B6',
  secondaryDark: '#EC4899',
  secondaryLight: '#F9A8D4',
  secondarySoft: '#FDF2F8',

  // Accent — Sky/Teal for trust indicators
  accent: '#06B6D4',
  accentDark: '#0891B2',
  accentLight: '#67E8F9',
  accentSoft: '#ECFEFF',

  // Premium Gold — For badges and premium features
  gold: '#F59E0B',
  goldDark: '#D97706',
  goldLight: '#FCD34D',
  goldSoft: '#FFFBEB',

  // Success / Match — Emerald
  success: '#10B981',
  successDark: '#059669',
  successLight: '#6EE7B7',
  successSoft: '#ECFDF5',

  // Heart / Love — Deep Rose
  love: '#E11D48',
  loveDark: '#BE123C',
  loveLight: '#FB7185',
  loveSoft: '#FFF1F2',

  // Neutrals — Warm gray with slight purple undertone
  white: '#FFFFFF',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F3F4F6',
  borderDark: '#E5E7EB',
  divider: '#F9FAFB',

  // Text — High contrast, premium look
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textLight: '#D1D5DB',
  textInverse: '#FFFFFF',

  // Status
  online: '#10B981',
  offline: '#9CA3AF',
  away: '#F59E0B',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#6366F1',

  // Premium Gradients — Luxurious color transitions
  gradientPrimary: ['#7C3AED', '#EC4899'] as const,
  gradientSecondary: ['#EC4899', '#F59E0B'] as const,
  gradientGold: ['#F59E0B', '#EF4444'] as const,
  gradientSunset: ['#F472B6', '#7C3AED'] as const,
  gradientPurple: ['#6D28D9', '#4F46E5'] as const,
  gradientDark: ['#1F1135', '#0F172A'] as const,
  gradientCard: ['#FFFFFF', '#F5F3FF'] as const,
  gradientPremium: ['#FFD700', '#FFA500', '#FF6347'] as const,

  // Dark mode — Deep, luxurious dark
  dark: {
    background: '#0C0118',
    surface: '#160525',
    card: '#1E0A35',
    border: '#2E1065',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 999,
};

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '800' as const, lineHeight: 41, letterSpacing: -0.5 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.2 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  callout: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  subhead: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '500' as const, lineHeight: 13 },
};

export const Shadows = {
  small: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  softCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
};
