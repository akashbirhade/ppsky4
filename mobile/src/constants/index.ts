// ─── API CONFIGURATION ────────────────────────────────────────────────────────
// Auto-detect the dev machine's LAN IP from the Expo host URI so physical
// devices / simulators always connect to the running Metro host — no need to
// hardcode an IP that breaks whenever the network changes.
import Constants from 'expo-constants';

const DEV_PORT = 5001;

// Fallback IP (only used if the host URI cannot be resolved)
const FALLBACK_IP = '10.201.43.42';

const getDevHost = (): string => {
  // e.g. hostUri = "10.201.43.42:8081" → we want the IP part
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    '';
  const host = hostUri.split(':')[0];
  return host && host !== 'localhost' ? host : FALLBACK_IP;
};

const DEV_HOST = getDevHost();

// A live/hosted backend URL can be injected via Expo public env vars so the app
// points at a deployed API without code changes (works in dev and production).
// e.g. EXPO_PUBLIC_API_URL=https://your-api.example.com
const ENV_API_URL = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
const ENV_SOCKET_URL = (process.env.EXPO_PUBLIC_SOCKET_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = ENV_API_URL
  ? `${ENV_API_URL}/api/v1`
  : __DEV__
    ? `http://${DEV_HOST}:${DEV_PORT}/api/v1`
    : 'https://api.soulmatesync.com/api/v1';

export const SOCKET_URL = ENV_SOCKET_URL
  ? ENV_SOCKET_URL
  : ENV_API_URL
    ? ENV_API_URL
    : __DEV__
      ? `http://${DEV_HOST}:${DEV_PORT}`
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

export const HEIGHT_RANGE = { min: 120, max: 220 }; // cm

export const BODY_TYPES = [
  'Slim', 'Athletic', 'Average', 'Heavy', 'Plus Size',
] as const;

export const COMPLEXION = [
  'Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dark',
] as const;

export const DIET = [
  'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain',
] as const;

export const SMOKING = [
  'Never', 'Occasionally', 'Regularly',
] as const;

export const DRINKING = [
  'Never', 'Socially', 'Regularly',
] as const;

export const FAMILY_TYPE = [
  'Joint Family', 'Nuclear Family',
] as const;

export const FAMILY_STATUS = [
  'Middle Class', 'Upper Middle Class', 'Rich', 'Affluent',
] as const;

export const FAMILY_VALUES = [
  'Orthodox', 'Traditional', 'Moderate', 'Liberal',
] as const;

export const MOTHER_TONGUE = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi',
  'Assamese', 'Maithili', 'Urdu', 'English', 'Other',
] as const;

export const MANGLIK_STATUS = [
  'Yes', 'No', 'Don\'t Know',
] as const;

export const HOROSCOPE_MATCH = [
  'Must', 'Not Necessary', 'Not Required',
] as const;

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
