import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

// ============ HYBRID PERSISTENCE (Memory + JSON + Supabase) ============
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json')
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json')

// In-memory cache for serverless environments (Vercel)
// Use globalThis to survive module reloads in Next.js dev mode
const globalForDb = globalThis as unknown as { 
  __dbMemoryStore?: Record<string, any>
  __supabaseSynced?: boolean
}
if (!globalForDb.__dbMemoryStore) {
  globalForDb.__dbMemoryStore = {}
}
const memoryStore: Record<string, any> = globalForDb.__dbMemoryStore

// ============ SUPABASE SYNC LAYER ============
let supabaseClient: any = null

function getSupabase() {
  if (supabaseClient) return supabaseClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  try {
    const { createClient } = require('@supabase/supabase-js')
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    return supabaseClient
  } catch {
    return null
  }
}

// Map UserProfile (camelCase) → Supabase row (snake_case)
function toSupabaseRow(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    gender: user.gender,
    date_of_birth: user.dateOfBirth,
    age: user.age,
    religion: user.religion,
    caste: user.caste,
    mother_tongue: user.motherTongue,
    height: user.height,
    education: user.education,
    occupation: user.occupation,
    income: user.income,
    city: user.city,
    state: user.state,
    country: user.country,
    about: user.about,
    marital_status: user.maritalStatus,
    diet: user.diet,
    hobbies: JSON.stringify(user.hobbies || []),
    family_details: JSON.stringify(user.familyDetails || {}),
    partner_preferences: JSON.stringify(user.partnerPreferences || {}),
    photos: JSON.stringify(user.photos || []),
    verified: user.verified || false,
    premium: user.premium || false,
    premium_plan: user.premiumPlan,
    premium_expiry: user.premiumExpiry,
    created_at: user.createdAt,
    last_active: user.lastActive,
    profile_complete: user.profileComplete || false,
    online: user.online || false,
    blocked_users: JSON.stringify(user.blockedUsers || []),
    referral_code: user.referralCode || null,
    verification_status: user.verificationStatus || null,
    photo_privacy: user.photoPrivacy || 'public',
  }
}

// Map Supabase row (snake_case) → UserProfile (camelCase)
function fromSupabaseRow(row: any): any {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    phone: row.phone,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    religion: row.religion,
    caste: row.caste,
    motherTongue: row.mother_tongue,
    height: row.height,
    education: row.education,
    occupation: row.occupation,
    income: row.income,
    city: row.city,
    state: row.state,
    country: row.country,
    about: row.about,
    maritalStatus: row.marital_status,
    diet: row.diet,
    hobbies: typeof row.hobbies === 'string' ? JSON.parse(row.hobbies) : (row.hobbies || []),
    familyDetails: typeof row.family_details === 'string' ? JSON.parse(row.family_details) : (row.family_details || {}),
    partnerPreferences: typeof row.partner_preferences === 'string' ? JSON.parse(row.partner_preferences) : (row.partner_preferences || {}),
    photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos || []),
    verified: row.verified || false,
    premium: row.premium || false,
    premiumPlan: row.premium_plan,
    premiumExpiry: row.premium_expiry,
    createdAt: row.created_at,
    lastActive: row.last_active,
    profileComplete: row.profile_complete || false,
    online: row.online || false,
    blockedUsers: typeof row.blocked_users === 'string' ? JSON.parse(row.blocked_users) : (row.blocked_users || []),
    referralCode: row.referral_code,
    verificationStatus: row.verification_status,
    photoPrivacy: row.photo_privacy || 'public',
  }
}

// Background sync: upsert a user to Supabase (fire-and-forget)
function syncUserToSupabase(user: any) {
  const sb = getSupabase()
  if (!sb) return
  sb.from('user_profiles')
    .upsert(toSupabaseRow(user), { onConflict: 'id' })
    .then(({ error }: any) => {
      if (error) console.error('Supabase sync error:', error.message)
    })
    .catch(() => {})
}

// Background sync: delete a user from Supabase
function deleteUserFromSupabase(id: string) {
  const sb = getSupabase()
  if (!sb) return
  sb.from('user_profiles').delete().eq('id', id).catch(() => {})
}

// Load all users from Supabase (called once on cold start)
async function loadFromSupabase() {
  if (globalForDb.__supabaseSynced) return
  const sb = getSupabase()
  if (!sb) return
  try {
    const { data, error } = await sb.from('user_profiles').select('*')
    if (error) {
      console.error('Supabase load error:', error.message)
      return
    }
    if (data && data.length > 0) {
      const users = data.map(fromSupabaseRow)
      // Merge: Supabase is source of truth, but keep local-only users
      const localUsers = getStoredUsers()
      const supabaseIds = new Set(users.map((u: any) => u.id))
      const localOnly = localUsers.filter(u => !supabaseIds.has(u.id))
      const merged = [...users, ...localOnly]
      memoryStore[USERS_FILE] = merged
      writeJSON(USERS_FILE, merged)
      // Sync local-only users back to Supabase
      localOnly.forEach(u => syncUserToSupabase(u))
      console.log(`✓ Loaded ${data.length} users from Supabase, ${localOnly.length} local-only synced back`)
    } else {
      // Supabase is empty — push local data to it
      const localUsers = getStoredUsers()
      if (localUsers.length > 0) {
        const rows = localUsers.map(toSupabaseRow)
        const { error: insertError } = await sb.from('user_profiles').upsert(rows, { onConflict: 'id' })
        if (insertError) {
          console.error('Supabase initial push error:', insertError.message)
        } else {
          console.log(`✓ Pushed ${localUsers.length} users to Supabase`)
        }
      }
    }
    globalForDb.__supabaseSynced = true
  } catch (e) {
    console.error('Supabase sync failed, using local data:', e)
  }
}

// Trigger initial sync (fire-and-forget, non-blocking)
loadFromSupabase()

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch {
    // Read-only filesystem (Vercel) - use memory only
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  // Return from memory cache first (has latest state)
  if (memoryStore[filePath] !== undefined) {
    return memoryStore[filePath] as T
  }
  try {
    ensureDataDir()
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      memoryStore[filePath] = data
      return data
    }
  } catch (e) { console.error(`Error reading ${filePath}:`, e) }
  memoryStore[filePath] = fallback
  return fallback
}

function writeJSON(filePath: string, data: any) {
  // Always update memory cache
  memoryStore[filePath] = data
  // Try to write to filesystem atomically (works locally, fails gracefully on Vercel)
  try {
    ensureDataDir()
    // Write to temp file first, then rename (atomic write prevents corruption)
    const tempPath = filePath + '.tmp'
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2))
    fs.renameSync(tempPath, filePath)
  } catch {
    // Read-only filesystem - data stays in memory for this invocation
    // Try direct write as fallback
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    } catch {
      // Truly read-only - memory only
    }
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  password: string
  phone: string
  gender: string
  dateOfBirth: string
  age: number
  religion: string
  caste: string
  motherTongue: string
  height: string
  education: string
  occupation: string
  income: string
  city: string
  state: string
  country: string
  about: string
  maritalStatus: string
  diet: string
  hobbies: string[]
  familyDetails: FamilyDetails
  partnerPreferences: PartnerPreferences
  photos: string[]
  verified: boolean
  premium: boolean
  premiumPlan: string | null
  premiumExpiry: string | null
  createdAt: string
  lastActive: string
  profileComplete: boolean
  online: boolean
  authProvider?: string
  googleId?: string
}

export interface FamilyDetails {
  father: string
  mother: string
  siblings: string
  familyType: string
  familyStatus: string
  familyIncome: string
}

export interface PartnerPreferences {
  ageMin: number
  ageMax: number
  heightMin: string
  heightMax: string
  religion: string
  education: string
  occupation: string
  city: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'call' | 'video_call'
}

export interface Subscription {
  id: string
  userId: string
  plan: 'silver' | 'gold' | 'platinum'
  amount: number
  couponUsed: string | null
  discount: number
  paymentMethod: string
  paymentId: string
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  createdAt: string
}

export interface Coupon {
  code: string
  discount: number // percentage
  maxUses: number
  usedCount: number
  validTill: string
  minPlan: 'silver' | 'gold' | 'platinum' | null
  active: boolean
}

// ============ SEED DATA (only used on first run) ============
const SEED_USERS: UserProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43210',
    gender: 'Female',
    dateOfBirth: '1995-03-15',
    age: 29,
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    height: "5'4\"",
    education: 'MBA',
    occupation: 'Marketing Manager',
    income: '12-15 LPA',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    about: 'I am a fun-loving, career-oriented woman who believes in maintaining a balance between work and personal life. Love traveling, reading, and cooking.',
    maritalStatus: 'Never Married',
    diet: 'Vegetarian',
    hobbies: ['Reading', 'Traveling', 'Cooking', 'Yoga', 'Photography'],
    familyDetails: { father: 'Businessman', mother: 'Homemaker', siblings: '1 Brother (Married)', familyType: 'Nuclear', familyStatus: 'Upper Middle Class', familyIncome: '₹20-25 Lakhs' },
    partnerPreferences: { ageMin: 28, ageMax: 35, heightMin: "5'7\"", heightMax: "6'2\"", religion: 'Hindu', education: 'MBA/MS/MTech', occupation: 'Any Professional', city: 'Mumbai/Pune/Delhi' },
    photos: ['/uploads/priya1.jpg'],
    verified: true,
    premium: true,
    premiumPlan: 'gold',
    premiumExpiry: '2025-12-31',
    createdAt: '2024-01-15',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: true
  },
  {
    id: '2',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43211',
    gender: 'Male',
    dateOfBirth: '1992-07-20',
    age: 32,
    religion: 'Hindu',
    caste: 'Agarwal',
    motherTongue: 'Hindi',
    height: "5'10\"",
    education: 'B.Tech + MBA',
    occupation: 'Software Engineer',
    income: '25-30 LPA',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    about: 'A tech enthusiast who loves solving complex problems. Enjoy hiking, photography, and exploring new cuisines. Family-oriented with progressive values.',
    maritalStatus: 'Never Married',
    diet: 'Non-Vegetarian',
    hobbies: ['Hiking', 'Photography', 'Gaming', 'Cooking', 'Cricket'],
    familyDetails: { father: 'Retired (Govt. Officer)', mother: 'Teacher', siblings: '1 Sister (Married)', familyType: 'Joint', familyStatus: 'Upper Middle Class', familyIncome: '₹15-20 Lakhs' },
    partnerPreferences: { ageMin: 25, ageMax: 30, heightMin: "5'2\"", heightMax: "5'7\"", religion: 'Hindu', education: 'Graduate+', occupation: 'Any Professional', city: 'Any Metro' },
    photos: ['/uploads/rahul1.jpg'],
    verified: true,
    premium: false,
    premiumPlan: null,
    premiumExpiry: null,
    createdAt: '2024-02-10',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: false
  },
  {
    id: '3',
    name: 'Ananya Patel',
    email: 'ananya@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43212',
    gender: 'Female',
    dateOfBirth: '1996-11-08',
    age: 28,
    religion: 'Hindu',
    caste: 'Patel',
    motherTongue: 'Gujarati',
    height: "5'5\"",
    education: 'CA',
    occupation: 'Chartered Accountant',
    income: '18-22 LPA',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    about: 'Independent, ambitious, and grounded. Love dancing, painting, and spending time with family. Looking for someone who values both tradition and modernity.',
    maritalStatus: 'Never Married',
    diet: 'Vegetarian',
    hobbies: ['Dancing', 'Painting', 'Traveling', 'Music', 'Fitness'],
    familyDetails: { father: 'Businessman (Diamond Industry)', mother: 'Homemaker', siblings: '2 Brothers (1 Married)', familyType: 'Joint', familyStatus: 'Affluent', familyIncome: '₹50+ Lakhs' },
    partnerPreferences: { ageMin: 28, ageMax: 34, heightMin: "5'8\"", heightMax: "6'1\"", religion: 'Hindu', education: 'CA/MBA/Engineer', occupation: 'Professional', city: 'Gujarat/Mumbai' },
    photos: ['/uploads/ananya1.jpg'],
    verified: true,
    premium: true,
    premiumPlan: 'platinum',
    premiumExpiry: '2025-12-31',
    createdAt: '2024-03-05',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: true
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43213',
    gender: 'Male',
    dateOfBirth: '1990-05-25',
    age: 34,
    religion: 'Sikh',
    caste: 'Jat',
    motherTongue: 'Punjabi',
    height: "6'0\"",
    education: 'MS (USA)',
    occupation: 'Product Manager',
    income: '35-40 LPA',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    about: 'Returned from the US to settle in India. Passionate about fitness, startups, and giving back to community. Value honesty and companionship above all.',
    maritalStatus: 'Never Married',
    diet: 'Non-Vegetarian',
    hobbies: ['Fitness', 'Startups', 'Travel', 'Reading', 'Mentoring'],
    familyDetails: { father: 'Retired Army Officer', mother: 'Homemaker', siblings: '1 Sister (Doctor)', familyType: 'Nuclear', familyStatus: 'Upper Middle Class', familyIncome: '₹25-30 Lakhs' },
    partnerPreferences: { ageMin: 26, ageMax: 32, heightMin: "5'3\"", heightMax: "5'8\"", religion: 'Any', education: 'Graduate+', occupation: 'Any', city: 'Delhi NCR' },
    photos: ['/uploads/vikram1.jpg'],
    verified: true,
    premium: true,
    premiumPlan: 'gold',
    premiumExpiry: '2025-06-30',
    createdAt: '2024-01-20',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: true
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43214',
    gender: 'Female',
    dateOfBirth: '1994-09-12',
    age: 30,
    religion: 'Hindu',
    caste: 'Reddy',
    motherTongue: 'Telugu',
    height: "5'6\"",
    education: 'MBBS, MD',
    occupation: 'Doctor',
    income: '20-25 LPA',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    about: 'A doctor by profession and an artist at heart. Love music, yoga, and traveling to offbeat destinations. Looking for a kind and understanding partner.',
    maritalStatus: 'Never Married',
    diet: 'Vegetarian',
    hobbies: ['Music', 'Yoga', 'Traveling', 'Art', 'Reading'],
    familyDetails: { father: 'Doctor (Surgeon)', mother: 'Professor', siblings: '1 Brother (Engineer)', familyType: 'Nuclear', familyStatus: 'Affluent', familyIncome: '₹40-50 Lakhs' },
    partnerPreferences: { ageMin: 30, ageMax: 36, heightMin: "5'9\"", heightMax: "6'2\"", religion: 'Hindu', education: 'Professional Degree', occupation: 'Doctor/Engineer/IAS', city: 'Hyderabad/Bangalore' },
    photos: ['/uploads/sneha1.jpg'],
    verified: true,
    premium: false,
    premiumPlan: null,
    premiumExpiry: null,
    createdAt: '2024-04-01',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: false
  },
  {
    id: '6',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    password: '$2a$10$ZARVRNII7u1DF/IIvc1Eg.rcwwvQziLk6P3h2WGJBlTECfZPx7mcS',
    phone: '+91 98765 43215',
    gender: 'Male',
    dateOfBirth: '1991-12-03',
    age: 33,
    religion: 'Hindu',
    caste: 'Marwari',
    motherTongue: 'Hindi',
    height: "5'11\"",
    education: 'MBA (IIM)',
    occupation: 'Investment Banker',
    income: '50+ LPA',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    about: 'Finance professional with a passion for the finer things in life. Enjoy golf, wine tasting, and international travel. Family means everything to me.',
    maritalStatus: 'Never Married',
    diet: 'Eggetarian',
    hobbies: ['Golf', 'Wine Tasting', 'International Travel', 'Reading', 'Fitness'],
    familyDetails: { father: 'Businessman (Textiles)', mother: 'Homemaker', siblings: '1 Brother (CA)', familyType: 'Joint', familyStatus: 'Affluent', familyIncome: '₹1 Crore+' },
    partnerPreferences: { ageMin: 25, ageMax: 30, heightMin: "5'3\"", heightMax: "5'7\"", religion: 'Hindu', education: 'MBA/CA/Graduate', occupation: 'Any', city: 'Mumbai/Delhi' },
    photos: ['/uploads/arjun1.jpg'],
    verified: true,
    premium: true,
    premiumPlan: 'platinum',
    premiumExpiry: '2025-12-31',
    createdAt: '2024-02-28',
    lastActive: new Date().toISOString(),
    profileComplete: true,
    online: false
  }
]

const SEED_COUPONS: Coupon[] = [
  { code: 'SHADI50', discount: 50, maxUses: 100, usedCount: 12, validTill: '2027-12-31', minPlan: null, active: true },
  { code: 'FIRST25', discount: 25, maxUses: 500, usedCount: 89, validTill: '2027-12-31', minPlan: null, active: true },
  { code: 'GOLD70', discount: 70, maxUses: 50, usedCount: 5, validTill: '2027-06-30', minPlan: 'gold', active: true },
  { code: 'PLAT60', discount: 60, maxUses: 30, usedCount: 3, validTill: '2027-12-31', minPlan: 'platinum', active: true },
  { code: 'WELCOME30', discount: 30, maxUses: 1000, usedCount: 234, validTill: '2027-12-31', minPlan: null, active: true },
  { code: 'PREMIUM80', discount: 80, maxUses: 10, usedCount: 2, validTill: '2027-03-31', minPlan: 'platinum', active: true },
]

// ============ INITIALIZE DATA ============
function initializeData() {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    writeJSON(USERS_FILE, SEED_USERS)
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    writeJSON(MESSAGES_FILE, [])
  }
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    writeJSON(ACTIVITIES_FILE, { profileViews: [], interests: [], shortlists: [] })
  }
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
    writeJSON(SUBSCRIPTIONS_FILE, [])
  }
  if (!fs.existsSync(COUPONS_FILE)) {
    writeJSON(COUPONS_FILE, SEED_COUPONS)
  }
}

initializeData()

// ============ DATA ACCESS ============
function getStoredUsers(): UserProfile[] {
  return readJSON<UserProfile[]>(USERS_FILE, SEED_USERS)
}

function saveUsers(users: UserProfile[]) {
  writeJSON(USERS_FILE, users)
}

function getStoredMessages(): Message[] {
  return readJSON<Message[]>(MESSAGES_FILE, [])
}

function saveMessages(msgs: Message[]) {
  writeJSON(MESSAGES_FILE, msgs)
}

function getActivities(): { profileViews: ProfileView[]; interests: Interest[]; shortlists: Shortlist[] } {
  return readJSON(ACTIVITIES_FILE, { profileViews: [], interests: [], shortlists: [] })
}

function saveActivities(data: { profileViews: ProfileView[]; interests: Interest[]; shortlists: Shortlist[] }) {
  writeJSON(ACTIVITIES_FILE, data)
}

export function getStoredSubscriptions(): Subscription[] {
  return readJSON<Subscription[]>(SUBSCRIPTIONS_FILE, [])
}

export function saveSubscription(sub: Subscription) {
  const subs = getStoredSubscriptions()
  subs.push(sub)
  writeJSON(SUBSCRIPTIONS_FILE, subs)
}

export function getStoredCoupons(): Coupon[] {
  return readJSON<Coupon[]>(COUPONS_FILE, SEED_COUPONS)
}

function saveCoupons(coupons: Coupon[]) {
  writeJSON(COUPONS_FILE, coupons)
}

// ============ USER FUNCTIONS ============
export function getUsers(): UserProfile[] {
  return getStoredUsers()
}

export function getUserById(id: string): UserProfile | undefined {
  return getStoredUsers().find(u => u.id === id)
}

export function getUserByEmail(email: string): UserProfile | undefined {
  return getStoredUsers().find(u => u.email === email)
}

export function getUserByPhone(phone: string): UserProfile | undefined {
  return getStoredUsers().find(u => u.phone === phone)
}

export function createUser(data: Partial<UserProfile>): UserProfile {
  const users = getStoredUsers()
  const newUser: UserProfile = {
    id: uuidv4(),
    name: data.name || '',
    email: data.email || '',
    password: data.password || '',
    phone: data.phone || '',
    gender: data.gender || '',
    dateOfBirth: data.dateOfBirth || '',
    age: data.age || 0,
    religion: data.religion || '',
    caste: data.caste || '',
    motherTongue: data.motherTongue || '',
    height: data.height || '',
    education: data.education || '',
    occupation: data.occupation || '',
    income: data.income || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || 'India',
    about: data.about || '',
    maritalStatus: data.maritalStatus || 'Never Married',
    diet: data.diet || '',
    hobbies: data.hobbies || [],
    familyDetails: data.familyDetails || { father: '', mother: '', siblings: '', familyType: '', familyStatus: '', familyIncome: '' },
    partnerPreferences: data.partnerPreferences || { ageMin: 20, ageMax: 40, heightMin: "5'0\"", heightMax: "6'5\"", religion: 'Any', education: 'Any', occupation: 'Any', city: 'Any' },
    photos: data.photos || [],
    verified: data.verified ?? false,
    premium: false,
    premiumPlan: null,
    premiumExpiry: null,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    profileComplete: data.profileComplete || false,
    online: true
  }
  users.push(newUser)
  saveUsers(users)
  // Sync to Supabase in background
  syncUserToSupabase(newUser)
  return newUser
}

export function updateUser(id: string, data: Partial<UserProfile>): UserProfile | null {
  const users = getStoredUsers()
  const index = users.findIndex(u => u.id === id)
  if (index === -1) return null
  users[index] = { ...users[index], ...data }
  saveUsers(users)
  // Sync to Supabase in background
  syncUserToSupabase(users[index])
  return users[index]
}

export function searchProfiles(filters: {
  gender?: string
  ageMin?: number
  ageMax?: number
  religion?: string
  city?: string
  education?: string
}, excludeId?: string): UserProfile[] {
  const users = getStoredUsers()
  return users.filter(u => {
    if (excludeId && u.id === excludeId) return false
    if (filters.gender && u.gender !== filters.gender) return false
    if (filters.ageMin && u.age < filters.ageMin) return false
    if (filters.ageMax && u.age > filters.ageMax) return false
    if (filters.religion && filters.religion !== 'Any' && u.religion !== filters.religion) return false
    if (filters.city && !u.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.education && !u.education.toLowerCase().includes(filters.education.toLowerCase())) return false
    return true
  })
}

// ============ PREMIUM & COUPONS ============
export function validateCoupon(code: string, plan: string): { valid: boolean; discount: number; message: string } {
  const coupons = getStoredCoupons()
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
  
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' }
  if (!coupon.active) return { valid: false, discount: 0, message: 'This coupon is no longer active' }
  if (new Date(coupon.validTill) < new Date()) return { valid: false, discount: 0, message: 'This coupon has expired' }
  if (coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0, message: 'Coupon usage limit reached' }
  
  const planOrder = { silver: 1, gold: 2, platinum: 3 }
  if (coupon.minPlan && planOrder[plan as keyof typeof planOrder] < planOrder[coupon.minPlan]) {
    return { valid: false, discount: 0, message: `This coupon requires ${coupon.minPlan} plan or higher` }
  }
  
  return { valid: true, discount: coupon.discount, message: `${coupon.discount}% off applied!` }
}

export function consumeCoupon(code: string): void {
  const coupons = getStoredCoupons()
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
  if (coupon) {
    coupon.usedCount++
    saveCoupons(coupons)
  }
}

export function activatePremium(userId: string, plan: 'silver' | 'gold' | 'platinum', amount: number, paymentMethod: string, couponCode: string | null): Subscription {
  const durations: Record<string, number> = { silver: 90, gold: 180, platinum: 365 }
  const endDate = new Date(Date.now() + durations[plan] * 24 * 60 * 60 * 1000)
  
  const subscription: Subscription = {
    id: uuidv4(),
    userId,
    plan,
    amount,
    couponUsed: couponCode,
    discount: 0,
    paymentMethod,
    paymentId: `PAY_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString(),
    createdAt: new Date().toISOString()
  }
  
  saveSubscription(subscription)
  
  // Update user premium status
  updateUser(userId, {
    premium: true,
    premiumPlan: plan,
    premiumExpiry: endDate.toISOString()
  })
  
  if (couponCode) consumeCoupon(couponCode)
  
  return subscription
}

export function isPremiumActive(userId: string): boolean {
  const user = getUserById(userId)
  if (!user) return false
  if (!user.premium || !user.premiumExpiry) return false
  return new Date(user.premiumExpiry) > new Date()
}

export function getUserSubscription(userId: string): Subscription | null {
  const subs = getStoredSubscriptions()
  return subs
    .filter(s => s.userId === userId && s.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null
}

// ============ MESSAGES ============
export function getMessages(userId1: string, userId2: string): Message[] {
  const messages = getStoredMessages()
  return messages.filter(m =>
    (m.senderId === userId1 && m.receiverId === userId2) ||
    (m.senderId === userId2 && m.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function sendMessage(senderId: string, receiverId: string, content: string, type: Message['type'] = 'text'): Message {
  const messages = getStoredMessages()
  const msg: Message = {
    id: uuidv4(),
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
    type
  }
  messages.push(msg)
  saveMessages(messages)
  // Sync message to Supabase
  const sb = getSupabase()
  if (sb) {
    sb.from('app_messages').insert({
      id: msg.id, sender_id: msg.senderId, receiver_id: msg.receiverId,
      content: msg.content, timestamp: msg.timestamp, read: msg.read, type: msg.type
    }).catch(() => {})
  }
  return msg
}

export function markMessagesRead(userId: string, senderId: string): void {
  const messages = getStoredMessages()
  let changed = false
  messages.forEach(m => {
    if (m.senderId === senderId && m.receiverId === userId && !m.read) {
      m.read = true
      changed = true
    }
  })
  if (changed) saveMessages(messages)
}

export function getConversations(userId: string): { user: UserProfile, lastMessage: Message, unreadCount: number }[] {
  const messages = getStoredMessages()
  const userMessages = messages.filter(m => m.senderId === userId || m.receiverId === userId)
  const conversationPartners = new Set<string>()
  
  userMessages.forEach(m => {
    if (m.senderId === userId) conversationPartners.add(m.receiverId)
    else conversationPartners.add(m.senderId)
  })

  return Array.from(conversationPartners).map(partnerId => {
    const partnerMessages = getMessages(userId, partnerId)
    const partner = getUserById(partnerId)
    const unreadCount = partnerMessages.filter(m => m.senderId === partnerId && !m.read).length
    return {
      user: partner!,
      lastMessage: partnerMessages[partnerMessages.length - 1],
      unreadCount
    }
  }).filter(c => c.user)
}

// ============ ACTIVITY TRACKING ============

export interface ProfileView {
  id: string
  viewerId: string
  viewedId: string
  timestamp: string
}

export interface Interest {
  id: string
  senderId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'declined'
  timestamp: string
}

export interface Shortlist {
  id: string
  userId: string
  profileId: string
  timestamp: string
}

// Profile Views
export function addProfileView(viewerId: string, viewedId: string): ProfileView {
  const activities = getActivities()
  const existing = activities.profileViews.find(v => v.viewerId === viewerId && v.viewedId === viewedId)
  if (existing) {
    existing.timestamp = new Date().toISOString()
    saveActivities(activities)
    return existing
  }
  const view: ProfileView = { id: uuidv4(), viewerId, viewedId, timestamp: new Date().toISOString() }
  activities.profileViews.push(view)
  saveActivities(activities)
  return view
}

export function getRecentlyViewed(userId: string): { profile: UserProfile; timestamp: string }[] {
  const activities = getActivities()
  return activities.profileViews
    .filter(v => v.viewerId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(v => ({ profile: getUserById(v.viewedId)!, timestamp: v.timestamp }))
    .filter(v => v.profile)
}

export function getWhoViewedMe(userId: string): { profile: UserProfile; timestamp: string }[] {
  const activities = getActivities()
  return activities.profileViews
    .filter(v => v.viewedId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(v => ({ profile: getUserById(v.viewerId)!, timestamp: v.timestamp }))
    .filter(v => v.profile)
}

// Interests
export function sendInterest(senderId: string, receiverId: string): Interest {
  const activities = getActivities()
  const existing = activities.interests.find(i => i.senderId === senderId && i.receiverId === receiverId)
  if (existing) return existing
  const interest: Interest = { id: uuidv4(), senderId, receiverId, status: 'pending', timestamp: new Date().toISOString() }
  activities.interests.push(interest)
  saveActivities(activities)
  return interest
}

export function respondToInterest(interestId: string, status: 'accepted' | 'declined'): Interest | null {
  const activities = getActivities()
  const interest = activities.interests.find(i => i.id === interestId)
  if (!interest) return null
  interest.status = status
  saveActivities(activities)
  return interest
}

export function getInterestsSent(userId: string): { profile: UserProfile; interest: Interest }[] {
  const activities = getActivities()
  return activities.interests
    .filter(i => i.senderId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(i => ({ profile: getUserById(i.receiverId)!, interest: i }))
    .filter(i => i.profile)
}

export function getInterestsReceived(userId: string): { profile: UserProfile; interest: Interest }[] {
  const activities = getActivities()
  return activities.interests
    .filter(i => i.receiverId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(i => ({ profile: getUserById(i.senderId)!, interest: i }))
    .filter(i => i.profile)
}

export function getMutualMatches(userId: string): UserProfile[] {
  const activities = getActivities()
  const accepted = activities.interests.filter(i =>
    (i.senderId === userId || i.receiverId === userId) && i.status === 'accepted'
  )
  const matchIds = accepted.map(i => i.senderId === userId ? i.receiverId : i.senderId)
  return matchIds.map(id => getUserById(id)!).filter(Boolean)
}

// Shortlist
export function addToShortlist(userId: string, profileId: string): Shortlist {
  const activities = getActivities()
  const existing = activities.shortlists.find(s => s.userId === userId && s.profileId === profileId)
  if (existing) return existing
  const item: Shortlist = { id: uuidv4(), userId, profileId, timestamp: new Date().toISOString() }
  activities.shortlists.push(item)
  saveActivities(activities)
  return item
}

export function removeFromShortlist(userId: string, profileId: string): void {
  const activities = getActivities()
  activities.shortlists = activities.shortlists.filter(s => !(s.userId === userId && s.profileId === profileId))
  saveActivities(activities)
}

export function getShortlist(userId: string): { profile: UserProfile; timestamp: string }[] {
  const activities = getActivities()
  return activities.shortlists
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(s => ({ profile: getUserById(s.profileId)!, timestamp: s.timestamp }))
    .filter(s => s.profile)
}

export function isShortlisted(userId: string, profileId: string): boolean {
  const activities = getActivities()
  return activities.shortlists.some(s => s.userId === userId && s.profileId === profileId)
}

// Kundali / Horoscope Compatibility
export function getKundaliScore(userId: string, profileId: string): {
  score: number; manglik: string; nakshatraMatch: string; gunaScore: number; recommendation: string
} {
  // Simulated kundali matching
  const seed = (userId + profileId).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const gunaScore = 18 + (seed % 18) // 18-36 out of 36
  const score = Math.round((gunaScore / 36) * 100)
  return {
    score,
    manglik: seed % 3 === 0 ? 'Yes' : seed % 3 === 1 ? 'No' : 'Partial',
    nakshatraMatch: score > 70 ? 'Excellent' : score > 50 ? 'Good' : 'Average',
    gunaScore,
    recommendation: score >= 75 ? 'Highly Recommended' : score >= 60 ? 'Good Match' : score >= 45 ? 'Average Match' : 'Consult Astrologer'
  }
}

// Nearby Matches (simulated by same city/state)
export function getNearbyProfiles(userId: string): UserProfile[] {
  const user = getUserById(userId)
  if (!user) return []
  const users = getStoredUsers()
  const oppositeGender = user.gender === 'Male' ? 'Female' : 'Male'
  return users.filter(u => 
    u.id !== userId &&
    u.gender === oppositeGender &&
    u.profileComplete &&
    (u.city === user.city || u.state === user.state)
  )
}

// Daily Recommendations (AI-powered simulation)
export function getDailyRecommendations(userId: string): UserProfile[] {
  const user = getUserById(userId)
  if (!user) return []
  const users = getStoredUsers()
  const oppositeGender = user.gender === 'Male' ? 'Female' : 'Male'

  // Use smart matching: score all candidates and return top matches
  const candidates = users.filter(u => u.id !== userId && u.gender === oppositeGender)

  // Import matching algorithm inline to avoid circular deps
  const { getTopMatches } = require('./matching-algorithm')
  const topMatches = getTopMatches(user, candidates, 20)

  // Return user profiles sorted by match score
  return topMatches.map((match: any) => {
    const profile = getUserById(match.userId)
    if (!profile) return null
    // Attach match score and highlights to the profile
    return { ...profile, matchScore: match.score, matchHighlights: match.highlights }
  }).filter(Boolean)
}

// Activity counts for dashboard
export function getActivityCounts(userId: string): {
  profileViews: number; interestsReceived: number; interestsSent: number;
  shortlistedBy: number; mutualMatches: number; recentVisitors: number
} {
  const activities = getActivities()
  return {
    profileViews: activities.profileViews.filter(v => v.viewedId === userId).length,
    interestsReceived: activities.interests.filter(i => i.receiverId === userId && i.status === 'pending').length,
    interestsSent: activities.interests.filter(i => i.senderId === userId).length,
    shortlistedBy: activities.shortlists.filter(s => s.profileId === userId).length,
    mutualMatches: getMutualMatches(userId).length,
    recentVisitors: activities.profileViews.filter(v => v.viewedId === userId).length,
  }
}

// ============ CONTACT VIEWING (PREMIUM) ============
export interface ContactView {
  id: string
  viewerId: string
  viewedId: string
  timestamp: string
}

let contactViews: ContactView[] = readJSON<ContactView[]>(path.join(DATA_DIR, 'contact_views.json'), [])

export function viewContact(viewerId: string, viewedId: string): { success: boolean; contact: { phone: string; email: string } | null; message: string } {
  const viewer = getUserById(viewerId)
  if (!viewer) return { success: false, contact: null, message: 'User not found' }
  
  if (!isPremiumActive(viewerId)) {
    return { success: false, contact: null, message: 'Premium membership required to view contact details' }
  }
  
  const viewed = getUserById(viewedId)
  if (!viewed) return { success: false, contact: null, message: 'Profile not found' }
  
  // Record the view
  const existing = contactViews.find(v => v.viewerId === viewerId && v.viewedId === viewedId)
  if (!existing) {
    contactViews.push({ id: uuidv4(), viewerId, viewedId, timestamp: new Date().toISOString() })
    writeJSON(path.join(DATA_DIR, 'contact_views.json'), contactViews)
  }
  
  return {
    success: true,
    contact: { phone: viewed.phone, email: viewed.email },
    message: 'Contact details unlocked'
  }
}

// ============ CALL TRACKING (PREMIUM) ============
export interface CallRecord {
  id: string
  callerId: string
  receiverId: string
  type: 'audio' | 'video'
  status: 'initiated' | 'connected' | 'missed' | 'rejected' | 'ended'
  duration: number // seconds
  timestamp: string
}

let callRecords: CallRecord[] = readJSON<CallRecord[]>(path.join(DATA_DIR, 'calls.json'), [])

export function initiateCall(callerId: string, receiverId: string, type: 'audio' | 'video'): { success: boolean; callId: string | null; message: string } {
  if (!isPremiumActive(callerId)) {
    return { success: false, callId: null, message: 'Premium membership required for calls' }
  }
  
  const call: CallRecord = {
    id: uuidv4(),
    callerId,
    receiverId,
    type,
    status: 'initiated',
    duration: 0,
    timestamp: new Date().toISOString()
  }
  callRecords.push(call)
  writeJSON(path.join(DATA_DIR, 'calls.json'), callRecords)
  
  return { success: true, callId: call.id, message: `${type} call initiated` }
}

export function updateCallStatus(callId: string, status: CallRecord['status'], duration?: number): CallRecord | null {
  const call = callRecords.find(c => c.id === callId)
  if (!call) return null
  call.status = status
  if (duration !== undefined) call.duration = duration
  writeJSON(path.join(DATA_DIR, 'calls.json'), callRecords)
  return call
}

export function getCallHistory(userId: string): CallRecord[] {
  return callRecords
    .filter(c => c.callerId === userId || c.receiverId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// ============ ADMIN FUNCTIONS ============
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json')

interface Report {
  id: string
  reportedUserId: string
  reportedByUserId: string
  reason: string
  description: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
  adminNote?: string
  resolvedBy?: string
}

interface Ban {
  id: string
  userId: string
  reason: string
  bannedBy: string
  bannedAt: string
  expiresAt?: string | null
  permanent: boolean
}

interface VerificationRequest {
  id: string
  userId: string
  type: 'id_proof' | 'photo' | 'education' | 'employment'
  documentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

interface SystemConfig {
  maxPhotos: number
  maxMessageLength: number
  dailyInterestLimit: number
  premiumDailyInterestLimit: number
  enableAIChatbot: boolean
  enableVideoCalls: boolean
  enableKundali: boolean
  maintenanceMode: boolean
  registrationOpen: boolean
  minAge: number
  maxAge: number
}

interface AdminData {
  reports: Report[]
  bans: Ban[]
  verificationRequests: VerificationRequest[]
  systemConfig: SystemConfig
  announcements: { id: string; title: string; message: string; createdAt: string; active: boolean }[]
}

function getAdminData(): AdminData {
  return readJSON(ADMIN_FILE, { reports: [], bans: [], verificationRequests: [], systemConfig: { maxPhotos: 6, maxMessageLength: 1000, dailyInterestLimit: 10, premiumDailyInterestLimit: 50, enableAIChatbot: true, enableVideoCalls: true, enableKundali: true, maintenanceMode: false, registrationOpen: true, minAge: 18, maxAge: 70 }, announcements: [] })
}

function saveAdminData(data: AdminData) {
  writeJSON(ADMIN_FILE, data)
}

// --- Reports ---
export function getReports(status?: string): Report[] {
  const data = getAdminData()
  if (status) return data.reports.filter(r => r.status === status)
  return data.reports
}

export function createReport(reportedUserId: string, reportedByUserId: string, reason: string, description: string): Report {
  const data = getAdminData()
  const report: Report = {
    id: `rpt_${uuidv4().slice(0, 8)}`,
    reportedUserId,
    reportedByUserId,
    reason,
    description,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.reports.push(report)
  saveAdminData(data)
  return report
}

export function updateReportStatus(reportId: string, status: Report['status'], adminNote?: string, resolvedBy?: string): Report | null {
  const data = getAdminData()
  const report = data.reports.find(r => r.id === reportId)
  if (!report) return null
  report.status = status
  report.updatedAt = new Date().toISOString()
  if (adminNote) report.adminNote = adminNote
  if (resolvedBy) report.resolvedBy = resolvedBy
  saveAdminData(data)
  return report
}

// --- Bans ---
export function getBans(): Ban[] {
  return getAdminData().bans
}

export function banUser(userId: string, reason: string, bannedBy: string, permanent: boolean = false, durationDays?: number): Ban {
  const data = getAdminData()
  const ban: Ban = {
    id: `ban_${uuidv4().slice(0, 8)}`,
    userId,
    reason,
    bannedBy,
    bannedAt: new Date().toISOString(),
    expiresAt: permanent ? null : (durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : null),
    permanent,
  }
  data.bans.push(ban)
  saveAdminData(data)
  // Also mark user as banned
  const users = getStoredUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    (user as any).banned = true;
    (user as any).banReason = reason
    saveUsers(users)
  }
  return ban
}

export function unbanUser(userId: string): boolean {
  const data = getAdminData()
  data.bans = data.bans.filter(b => b.userId !== userId)
  saveAdminData(data)
  const users = getStoredUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    delete (user as any).banned
    delete (user as any).banReason
    saveUsers(users)
  }
  return true
}

export function isUserBanned(userId: string): boolean {
  const bans = getAdminData().bans
  return bans.some(b => b.userId === userId && (b.permanent || !b.expiresAt || new Date(b.expiresAt) > new Date()))
}

// --- Verification ---
export function getVerificationRequests(status?: string): VerificationRequest[] {
  const data = getAdminData()
  if (status) return data.verificationRequests.filter(v => v.status === status)
  return data.verificationRequests
}

export function submitVerification(userId: string, type: VerificationRequest['type'], documentUrl: string): VerificationRequest {
  const data = getAdminData()
  const req: VerificationRequest = {
    id: `ver_${uuidv4().slice(0, 8)}`,
    userId,
    type,
    documentUrl,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
  data.verificationRequests.push(req)
  saveAdminData(data)
  return req
}

export function reviewVerification(verificationId: string, approved: boolean, reviewedBy: string, rejectionReason?: string): VerificationRequest | null {
  const data = getAdminData()
  const req = data.verificationRequests.find(v => v.id === verificationId)
  if (!req) return null
  req.status = approved ? 'approved' : 'rejected'
  req.reviewedAt = new Date().toISOString()
  req.reviewedBy = reviewedBy
  if (rejectionReason) req.rejectionReason = rejectionReason
  saveAdminData(data)
  // If approved, mark user as verified
  if (approved) {
    const users = getStoredUsers()
    const user = users.find(u => u.id === req.userId)
    if (user) {
      user.verified = true
      saveUsers(users)
    }
  }
  return req
}

// --- System Config ---
export function getSystemConfig(): SystemConfig {
  return getAdminData().systemConfig
}

export function updateSystemConfig(updates: Partial<SystemConfig>): SystemConfig {
  const data = getAdminData()
  data.systemConfig = { ...data.systemConfig, ...updates }
  saveAdminData(data)
  return data.systemConfig
}

// --- Announcements ---
export function getAnnouncements(activeOnly: boolean = false) {
  const data = getAdminData()
  if (activeOnly) return data.announcements.filter(a => a.active)
  return data.announcements
}

export function createAnnouncement(title: string, message: string) {
  const data = getAdminData()
  const announcement = { id: `ann_${uuidv4().slice(0, 8)}`, title, message, createdAt: new Date().toISOString(), active: true }
  data.announcements.push(announcement)
  saveAdminData(data)
  return announcement
}

export function toggleAnnouncement(id: string) {
  const data = getAdminData()
  const ann = data.announcements.find(a => a.id === id)
  if (ann) { ann.active = !ann.active; saveAdminData(data) }
  return ann
}

// --- Admin Analytics ---
export function getAdminAnalytics() {
  const users = getStoredUsers()
  const messages = getStoredMessages()
  const subscriptions = getStoredSubscriptions()
  const reports = getAdminData().reports
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const monthAgo = new Date(now.getTime() - 30 * 86400000)

  const totalUsers = users.length
  const premiumUsers = users.filter(u => u.premium).length
  const verifiedUsers = users.filter(u => u.verified).length
  const maleUsers = users.filter(u => u.gender === 'Male').length
  const femaleUsers = users.filter(u => u.gender === 'Female').length

  const recentRegistrations = users.filter(u => u.createdAt && new Date(u.createdAt) > weekAgo).length
  const recentMessages = messages.filter(m => new Date(m.timestamp) > weekAgo).length
  const pendingReports = reports.filter(r => r.status === 'pending').length

  // Revenue from subscriptions
  const monthlyRevenue = subscriptions
    .filter(s => new Date(s.startDate || s.createdAt || '') > monthAgo)
    .reduce((sum, s) => sum + (s.amount || 0), 0)

  // Registrations per day (last 7 days)
  const registrationsWeek: number[] = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 86400000)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    registrationsWeek.push(users.filter(u => {
      const created = new Date(u.createdAt || '')
      return created >= dayStart && created < dayEnd
    }).length)
  }

  return {
    totalUsers,
    premiumUsers,
    verifiedUsers,
    maleUsers,
    femaleUsers,
    genderRatio: totalUsers > 0 ? `${Math.round(maleUsers / totalUsers * 100)}:${Math.round(femaleUsers / totalUsers * 100)}` : '0:0',
    recentRegistrations,
    recentMessages,
    pendingReports,
    monthlyRevenue,
    registrationsWeek,
    totalMessages: messages.length,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
  }
}
