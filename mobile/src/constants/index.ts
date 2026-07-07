// ─── API CONFIGURATION ────────────────────────────────────────────────────────
// Use machine's local network IP so physical devices can connect
const LOCAL_IP = '192.168.51.32';

export const API_BASE_URL = __DEV__
  ? `http://${LOCAL_IP}:5001/api/v1`
  : 'https://api.soulmatesync.com/api/v1';

export const SOCKET_URL = __DEV__
  ? `http://${LOCAL_IP}:5001`
  : 'https://api.soulmatesync.com';

// ─── APP CONSTANTS ────────────────────────────────────────────────────────────

export const APP_NAME = 'Soulmate Sync';
export const APP_VERSION = '1.0.0';

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  DIAMOND: 'DIAMOND',
} as const;

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export const MARITAL_STATUS = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Awaiting Divorce',
  'Annulled',
] as const;

export const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist',
  'Jain', 'Parsi', 'Jewish', 'Other',
] as const;

export const EDUCATION_LEVELS = [
  'High School', 'Diploma', 'Bachelor\'s', 'Master\'s',
  'PhD', 'Professional (CA/CS/ICWA)', 'Medical (MBBS/MD)',
  'Engineering (B.Tech/M.Tech)', 'MBA', 'Law (LLB/LLM)', 'Other',
] as const;

export const INCOME_RANGES = [
  'Below 3 Lakhs', '3-5 Lakhs', '5-7.5 Lakhs', '7.5-10 Lakhs',
  '10-15 Lakhs', '15-20 Lakhs', '20-30 Lakhs', '30-50 Lakhs',
  '50-75 Lakhs', '75 Lakhs - 1 Crore', 'Above 1 Crore',
] as const;

export const MAX_PHOTOS = 10;
export const MAX_BIO_LENGTH = 500;
export const PROFILES_PER_PAGE = 20;

// ─── KUNDALI MATCHING ─────────────────────────────────────────────────────────

export const RASHIS = [
  'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)',
  'Cancer (Kark)', 'Leo (Simha)', 'Virgo (Kanya)',
  'Libra (Tula)', 'Scorpio (Vrishchik)', 'Sagittarius (Dhanu)',
  'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)',
] as const;

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
  'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;
