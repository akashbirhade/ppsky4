/**
 * Soulmate Sync AI Engine - Multilingual NLP Processor
 * 
 * Handles language detection, tokenization, entity extraction,
 * and transliteration for Hindi, English, and Marathi.
 */

export type Language = 'en' | 'hi' | 'mr'

// Hindi character range detection
const DEVANAGARI_RANGE = /[\u0900-\u097F]/

// Common Hindi words/phrases for detection
const HINDI_MARKERS = [
  'kya', 'kaise', 'mera', 'meri', 'mujhe', 'hai', 'hain', 'nahi', 'karo',
  'batao', 'chahiye', 'chahte', 'kuch', 'karke', 'bolo', 'baat', 'shaadi',
  'rishta', 'ladki', 'ladka', 'ghar', 'parivaar', 'kab', 'kahan', 'kaun',
  'kyun', 'accha', 'theek', 'aur', 'lekin', 'yaar', 'bhai', 'ji', 'haan',
  'nahin', 'bilkul', 'zaroor', 'dhanyavaad', 'shukriya', 'namaste', 'kya hai',
  'profile', 'match', 'kundali', 'premium'
]

// Marathi markers (Romanized)
const MARATHI_MARKERS = [
  'mala', 'kasa', 'kashi', 'aahe', 'nahi', 'kay', 'karu', 'sangaa',
  'namaskar', 'dhanyavaad', 'tumhi', 'majha', 'mazhi', 'aapla', 'kuthe',
  'koni', 'ka', 'baryach', 'changla', 'mhanje', 'aahe', 'pahije',
  'lagna', 'jodidaar', 'mulgi', 'mulga', 'ghar', 'kutumb'
]

/**
 * Detect the language of input text
 */
export function detectLanguage(text: string): Language {
  const lower = text.toLowerCase()
  
  // Check for Devanagari script first
  if (DEVANAGARI_RANGE.test(text)) {
    // Differentiate Hindi vs Marathi in Devanagari
    const marathiDevanagari = ['आहे', 'करा', 'सांगा', 'तुम्ही', 'माझा', 'माझी', 'कसे', 'काय', 'लग्न', 'जोडीदार', 'पाहिजे', 'कुठे']
    const hindiDevanagari = ['है', 'हैं', 'करें', 'बताएं', 'मेरा', 'मेरी', 'कैसे', 'क्या', 'शादी', 'रिश्ता', 'चाहिए', 'कहाँ']
    
    let marathiScore = 0
    let hindiScore = 0
    marathiDevanagari.forEach(w => { if (text.includes(w)) marathiScore++ })
    hindiDevanagari.forEach(w => { if (text.includes(w)) hindiScore++ })
    
    return marathiScore > hindiScore ? 'mr' : 'hi'
  }
  
  // Check Romanized text
  const words = lower.split(/\s+/)
  let hindiScore = 0
  let marathiScore = 0
  
  words.forEach(word => {
    if (HINDI_MARKERS.includes(word)) hindiScore++
    if (MARATHI_MARKERS.includes(word)) marathiScore++
  })
  
  if (marathiScore > hindiScore && marathiScore >= 2) return 'mr'
  if (hindiScore >= 2) return 'hi'
  
  return 'en'
}

/**
 * Tokenize and normalize text for processing
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1)
}

/**
 * Extract entities from user input
 */
export interface ExtractedEntities {
  religion?: string
  city?: string
  age?: number
  gender?: string
  education?: string
  topic?: string
}

const RELIGIONS = ['hindu', 'muslim', 'sikh', 'christian', 'jain', 'buddhist', 'हिंदू', 'मुस्लिम', 'सिख', 'हिंदु']
const CITIES = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 'मुंबई', 'दिल्ली', 'पुणे']
const EDUCATION = ['mba', 'engineer', 'doctor', 'ca', 'btech', 'mbbs', 'mtech', 'phd']

export function extractEntities(text: string): ExtractedEntities {
  const lower = text.toLowerCase()
  const entities: ExtractedEntities = {}
  
  // Religion
  RELIGIONS.forEach(r => { if (lower.includes(r)) entities.religion = r })
  
  // City
  CITIES.forEach(c => { if (lower.includes(c)) entities.city = c })
  
  // Age
  const ageMatch = lower.match(/(\d{2})\s*(years?|yrs?|साल|वर्ष)/)
  if (ageMatch) entities.age = parseInt(ageMatch[1])
  
  // Gender
  if (lower.match(/\b(bride|ladki|girl|woman|female|लड़की|मुलगी)\b/)) entities.gender = 'Female'
  if (lower.match(/\b(groom|ladka|boy|man|male|लड़का|मुलगा)\b/)) entities.gender = 'Male'
  
  // Education
  EDUCATION.forEach(e => { if (lower.includes(e)) entities.education = e })
  
  return entities
}

/**
 * Sentiment analysis (basic)
 */
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase()
  const positiveWords = ['good', 'great', 'happy', 'love', 'like', 'nice', 'best', 'wonderful', 'accha', 'bahut', 'excellent', 'perfect', 'changla', 'khush', 'खुश', 'अच्छा']
  const negativeWords = ['bad', 'sad', 'hate', 'worst', 'terrible', 'angry', 'frustrated', 'scam', 'fake', 'bura', 'kharab', 'problem', 'issue', 'vaait', 'बुरा', 'खराब', 'गलत']
  
  let score = 0
  positiveWords.forEach(w => { if (lower.includes(w)) score++ })
  negativeWords.forEach(w => { if (lower.includes(w)) score-- })
  
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

/**
 * Normalize Romanized Hindi/Marathi to standard keywords for matching
 */
export function normalizeRomanized(text: string): string {
  const replacements: Record<string, string> = {
    'shaadi': 'marriage', 'shadi': 'marriage', 'vivah': 'marriage', 'lagna': 'marriage',
    'rishta': 'match', 'jodidaar': 'match', 'jodi': 'match',
    'ladki': 'bride', 'mulgi': 'bride', 'ladka': 'groom', 'mulga': 'groom',
    'kundli': 'kundali', 'patrika': 'kundali', 'janampatrika': 'kundali',
    'photo': 'photo', 'tasveer': 'photo', 'pic': 'photo',
    'paisa': 'premium', 'paise': 'premium', 'membership': 'premium',
    'suraksha': 'safety', 'safe': 'safety',
    'kaise': 'how', 'kasa': 'how', 'kashi': 'how',
    'chahiye': 'want', 'chahte': 'want', 'pahije': 'want',
    'batao': 'tell', 'sanga': 'tell', 'sangaa': 'tell',
    'pehli mulakat': 'first meeting', 'pahili bhet': 'first meeting',
    'parivaar': 'family', 'kutumb': 'family', 'ghar': 'family',
  }
  
  let normalized = text.toLowerCase()
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(`\\b${from}\\b`, 'gi'), to)
  })
  return normalized
}
