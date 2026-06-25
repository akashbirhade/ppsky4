-- ============================================================
-- SUPABASE SQL MIGRATION - Soulmate Sync Matrimony App
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- ─── ENABLE EXTENSIONS ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE marital_status AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BANNED');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'VOICE_NOTE', 'VIDEO', 'DOCUMENT', 'CALL_LOG', 'SYSTEM');
CREATE TYPE call_type AS ENUM ('AUDIO', 'VIDEO');
CREATE TYPE call_status AS ENUM ('INITIATED', 'RINGING', 'CONNECTED', 'ENDED', 'MISSED', 'DECLINED', 'FAILED');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
CREATE TYPE report_reason AS ENUM ('FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'SCAM', 'UNDERAGE', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED');
CREATE TYPE notification_type AS ENUM ('LIKE', 'SUPER_LIKE', 'MATCH', 'MESSAGE', 'PROFILE_VIEW', 'CALL', 'VERIFICATION', 'SUBSCRIPTION', 'SYSTEM');
CREATE TYPE host_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- ─── USERS ──────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  mobile_number TEXT UNIQUE NOT NULL,
  country_code TEXT DEFAULT '+91',
  gender gender_type NOT NULL,
  account_status account_status DEFAULT 'PENDING_VERIFICATION',
  email_verified BOOLEAN DEFAULT FALSE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ─── PROFILES ───────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Personal Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  height INTEGER NOT NULL, -- in cm
  weight INTEGER, -- in kg
  marital_status marital_status DEFAULT 'NEVER_MARRIED',
  mother_tongue TEXT NOT NULL,
  religion TEXT NOT NULL,
  caste TEXT NOT NULL,
  sub_caste TEXT,
  gothra TEXT,
  manglik BOOLEAN DEFAULT FALSE,

  -- Education & Career
  education TEXT NOT NULL,
  education_details TEXT,
  institution TEXT,
  profession TEXT NOT NULL,
  company TEXT,
  annual_income INTEGER NOT NULL, -- in INR

  -- About
  bio TEXT,
  hobbies TEXT[] DEFAULT '{}',
  family_type TEXT,
  family_status TEXT,
  father_occupation TEXT,
  mother_occupation TEXT,
  siblings INTEGER,

  -- Location
  state TEXT DEFAULT 'Maharashtra',
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Verification
  email_verification_status verification_status DEFAULT 'PENDING',
  mobile_verification_status verification_status DEFAULT 'PENDING',
  govt_id_verification_status verification_status DEFAULT 'PENDING',
  govt_id_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_badge BOOLEAN DEFAULT FALSE,
  profile_verified_at TIMESTAMPTZ,

  -- WhatsApp
  whatsapp_number TEXT,
  whatsapp_visible BOOLEAN DEFAULT FALSE,

  -- Profile Stats
  profile_views INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  super_likes_received INTEGER DEFAULT 0,

  -- Completion
  profile_completion_percentage INTEGER DEFAULT 0,

  -- Photo privacy
  photo_privacy TEXT DEFAULT 'public', -- 'public' | 'blur' | 'matches_only'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_religion_caste ON profiles(religion, caste);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_district ON profiles(district);
CREATE INDEX idx_profiles_state ON profiles(state);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_height ON profiles(height);
CREATE INDEX idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX idx_profiles_mother_tongue ON profiles(mother_tongue);
CREATE INDEX idx_profiles_education ON profiles(education);
CREATE INDEX idx_profiles_profession ON profiles(profession);
CREATE INDEX idx_profiles_annual_income ON profiles(annual_income);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX idx_profiles_completion ON profiles(profile_completion_percentage);

-- ─── PHOTOS ─────────────────────────────────────────────────────────────────

CREATE TABLE photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT, -- Cloudinary/S3 public ID
  is_main BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  size INTEGER, -- bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_user_main ON photos(user_id, is_main);

-- ─── PREFERENCES ────────────────────────────────────────────────────────────

CREATE TABLE preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 40,
  min_height INTEGER,
  max_height INTEGER,
  min_weight INTEGER,
  max_weight INTEGER,

  religion TEXT[] DEFAULT '{}',
  caste TEXT[] DEFAULT '{}',
  marital_status marital_status[] DEFAULT '{}',
  mother_tongue TEXT[] DEFAULT '{}',
  education TEXT[] DEFAULT '{}',
  profession TEXT[] DEFAULT '{}',
  min_income INTEGER,
  max_income INTEGER,

  preferred_cities TEXT[] DEFAULT '{}',
  preferred_districts TEXT[] DEFAULT '{}',
  preferred_states TEXT[] DEFAULT '{}',
  max_distance INTEGER, -- km

  manglik_preference TEXT,
  family_type TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ──────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan subscription_plan DEFAULT 'FREE',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT FALSE,

  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  payment_id TEXT,
  order_id TEXT,
  gateway TEXT,

  unlimited_likes BOOLEAN DEFAULT FALSE,
  advanced_filters BOOLEAN DEFAULT FALSE,
  see_profile_visitors BOOLEAN DEFAULT FALSE,
  priority_listing BOOLEAN DEFAULT FALSE,
  video_calling_access BOOLEAN DEFAULT FALSE,
  super_likes_per_day INTEGER DEFAULT 1,
  boosts_per_month INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIKES ──────────────────────────────────────────────────────────────────

CREATE TABLE likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_match BOOLEAN DEFAULT FALSE,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_likes_to_user ON likes(to_user_id);
CREATE INDEX idx_likes_from_user ON likes(from_user_id);
CREATE INDEX idx_likes_is_match ON likes(is_match);

-- ─── SUPER LIKES ────────────────────────────────────────────────────────────

CREATE TABLE super_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_super_likes_to_user ON super_likes(to_user_id);

-- ─── PROFILE VIEWS ──────────────────────────────────────────────────────────

CREATE TABLE profile_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  viewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_id);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_created ON profile_views(created_at);

-- ─── FAVORITES (SHORTLIST) ──────────────────────────────────────────────────

CREATE TABLE favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, favorite_user_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ─── BLOCKS ─────────────────────────────────────────────────────────────────

CREATE TABLE blocks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);

-- ─── CONVERSATIONS ──────────────────────────────────────────────────────────

CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_by TEXT,
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at);

-- ─── MESSAGES ───────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type message_type DEFAULT 'TEXT',
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_delivered BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ─── ATTACHMENTS ────────────────────────────────────────────────────────────

CREATE TABLE attachments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT,
  type TEXT NOT NULL, -- image, audio, video, document
  filename TEXT,
  size INTEGER,
  duration INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON attachments(message_id);

-- ─── CALLS ──────────────────────────────────────────────────────────────────

CREATE TABLE calls (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  caller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type call_type NOT NULL,
  status call_status DEFAULT 'INITIATED',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- seconds
  room_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calls_caller ON calls(caller_id);
CREATE INDEX idx_calls_receiver ON calls(receiver_id);
CREATE INDEX idx_calls_created ON calls(created_at);
CREATE INDEX idx_calls_status ON calls(status);

-- ─── REPORTS ────────────────────────────────────────────────────────────────

CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  screenshots TEXT[] DEFAULT '{}',
  status report_status DEFAULT 'PENDING',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);

-- ─── OTP VERIFICATION ───────────────────────────────────────────────────────

CREATE TABLE otp_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- email | mobile | password_reset
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_user_type ON otp_verifications(user_id, type);

-- ─── REFRESH TOKENS ─────────────────────────────────────────────────────────

CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ─── ADMIN USERS ────────────────────────────────────────────────────────────

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOGS ─────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ─── DAILY STATS ────────────────────────────────────────────────────────────

CREATE TABLE daily_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date DATE UNIQUE NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_registrations INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  premium_users INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_profile_views INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HOSTS ──────────────────────────────────────────────────────────────────

CREATE TABLE hosts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  profile_photo TEXT,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  community TEXT,
  status host_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hosts_region ON hosts(region);
CREATE INDEX idx_hosts_district ON hosts(district);
CREATE INDEX idx_hosts_city ON hosts(city);
CREATE INDEX idx_hosts_status ON hosts(status);

-- ─── HOST MEMBERS ───────────────────────────────────────────────────────────

CREATE TABLE host_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(host_id, user_id)
);

CREATE INDEX idx_host_members_host ON host_members(host_id);
CREATE INDEX idx_host_members_user ON host_members(user_id);

-- ─── HOST EVENTS ────────────────────────────────────────────────────────────

CREATE TABLE host_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  fee DECIMAL(10, 2),
  max_participants INTEGER,
  participant_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_host_events_host ON host_events(host_id);
CREATE INDEX idx_host_events_date ON host_events(date);

-- ─── HOST INTERESTS ─────────────────────────────────────────────────────────

CREATE TABLE host_interests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(host_id, from_user_id, to_user_id)
);

CREATE INDEX idx_host_interests_host ON host_interests(host_id);
CREATE INDEX idx_host_interests_status ON host_interests(status);

-- ─── REFERRALS ──────────────────────────────────────────────────────────────

CREATE TABLE referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id TEXT,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | registered | rewarded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ─── PUSH SUBSCRIPTIONS ─────────────────────────────────────────────────────

CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────────
-- Enable RLS on all tables for Supabase security

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ─── RLS POLICIES ───────────────────────────────────────────────────────────
-- Users can read their own data, and read other profiles (except blocked)

-- Users: own data only
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Profiles: anyone can read (for search), own user can update
CREATE POLICY "Profiles are viewable by authenticated" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Photos: viewable by authenticated, own user can manage
CREATE POLICY "Photos viewable by authenticated" ON photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own photos" ON photos FOR ALL USING (auth.uid()::text = user_id);

-- Messages: only participants
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid()::text = sender_id);

-- Notifications: own only
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id);

-- ─── AUTO-UPDATE TIMESTAMPS ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER hosts_updated_at BEFORE UPDATE ON hosts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── DONE ───────────────────────────────────────────────────────────────────
-- Run this entire file in Supabase SQL Editor to create all tables.
-- Then your app can use: supabase.from('users').select() etc.
