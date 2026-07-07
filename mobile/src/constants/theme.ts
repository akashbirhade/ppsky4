// ─── SOULMATE SYNC THEME ──────────────────────────────────────────────────────
// Matching the web app's purple/teal brand identity

export const Colors = {
  // Primary brand colors (Purple - matches web)
  primary: '#a855f7',
  primaryDark: '#9333ea',
  primaryLight: '#c084fc',
  primarySoft: '#faf5ff',

  // Secondary accent (Teal/Sky - matches web)
  secondary: '#38bdf8',
  secondaryDark: '#0ea5e9',
  secondaryLight: '#7dd3fc',
  secondarySoft: '#f0f9ff',

  // Warm accent (gold/premium)
  gold: '#FFB347',
  goldDark: '#E69A30',
  goldLight: '#FFD194',
  goldSoft: '#FFF8ED',

  // Success / Match
  success: '#4ECDC4',
  successDark: '#3BB5AD',
  successLight: '#7EDDD7',

  // Heart / Love accent
  love: '#FF4B8C',
  loveDark: '#E03A78',
  loveLight: '#FF7DAF',
  loveSoft: '#FFF0F5',

  // Neutrals
  white: '#FFFFFF',
  background: '#FAFBFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F0F1F3',
  borderDark: '#E2E4E8',
  divider: '#F5F5F5',

  // Text
  textPrimary: '#1A1D26',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#B8BCC4',
  textInverse: '#FFFFFF',

  // Status
  online: '#22C55E',
  offline: '#9CA3AF',
  away: '#F59E0B',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Gradients (start, end) — matches web's purple/teal theme
  gradientPrimary: ['#a855f7', '#38bdf8'],
  gradientSecondary: ['#38bdf8', '#4ECDC4'],
  gradientGold: ['#FFB347', '#a855f7'],
  gradientSunset: ['#FF6B6B', '#FFB347'],
  gradientPurple: ['#a855f7', '#FF4B8C'],
  gradientDark: ['#1A1D26', '#2D3142'],

  // Dark mode overrides
  dark: {
    background: '#0f0a1e',
    surface: '#1a0d2e',
    card: '#251445',
    border: '#2d1754',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
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
  full: 999,
};

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400' as const, lineHeight: 13 },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
