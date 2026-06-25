-- ============================================================
-- SIMPLE FLAT TABLE - Mirrors the JSON user structure
-- Run this in Supabase SQL Editor FIRST
-- ============================================================

-- User profiles (flat structure matching app's JSON format)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  phone TEXT,
  gender TEXT,
  date_of_birth TEXT,
  age INTEGER,
  religion TEXT,
  caste TEXT,
  mother_tongue TEXT,
  height TEXT,
  education TEXT,
  occupation TEXT,
  income TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  about TEXT,
  marital_status TEXT DEFAULT 'Never Married',
  diet TEXT,
  hobbies JSONB DEFAULT '[]',
  family_details JSONB,
  partner_preferences JSONB,
  photos JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  premium_plan TEXT,
  premium_expiry TEXT,
  created_at TEXT,
  last_active TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  online BOOLEAN DEFAULT FALSE,
  blocked_users JSONB DEFAULT '[]',
  referral_code TEXT,
  verification_status TEXT,
  verification_document TEXT,
  photo_privacy TEXT DEFAULT 'public',
  extra_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_religion ON user_profiles(religion);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_user_profiles_state ON user_profiles(state);

-- Messages
CREATE TABLE IF NOT EXISTS app_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT,
  timestamp TEXT,
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'text'
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON app_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON app_messages(receiver_id);

-- Activities (profile views, interests, shortlists)
CREATE TABLE IF NOT EXISTS app_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL, -- 'profile_view' | 'interest' | 'shortlist'
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS app_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT,
  amount DECIMAL(10,2),
  coupon_used TEXT,
  discount DECIMAL(10,2),
  payment_method TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON app_subscriptions(user_id);

-- Disable RLS for simplicity (your app handles auth via JWT)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_subscriptions DISABLE ROW LEVEL SECURITY;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
