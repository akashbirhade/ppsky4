/**
 * Soulmate Sync AI Engine - Intent Classifier
 * 
 * Classifies user input into specific intents and sub-intents
 * for accurate response routing.
 */

import { tokenize, normalizeRomanized, Language } from './nlp-processor'

export type Intent =
  | 'greeting'
  | 'farewell'
  | 'profile_help'
  | 'photo_help'
  | 'search_match'
  | 'kundali'
  | 'premium_info'
  | 'safety'
  | 'communication'
  | 'first_meeting'
  | 'family_advice'
  | 'features'
  | 'how_to_use'
  | 'verification'
  | 'complaint'
  | 'general_question'

interface IntentPattern {
  intent: Intent
  patterns: string[]
  weight: number
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'greeting',
    patterns: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'haan', 'bolo', 'helo'],
    weight: 1
  },
  {
    intent: 'farewell',
    patterns: ['bye', 'goodbye', 'thanks', 'thank you', 'ok bye', 'alvida', 'dhanyavaad', 'shukriya', 'theek hai'],
    weight: 1
  },
  {
    intent: 'profile_help',
    patterns: ['profile', 'bio', 'about me', 'write', 'create', 'fill', 'complete', 'update', 'improve', 'edit', 'description', 'better profile'],
    weight: 2
  },
  {
    intent: 'photo_help',
    patterns: ['photo', 'picture', 'image', 'upload', 'selfie', 'dp', 'pic', 'camera', 'tasveer'],
    weight: 2
  },
  {
    intent: 'search_match',
    patterns: ['match', 'find', 'search', 'partner', 'rishta', 'compatible', 'suitable', 'recommendation', 'suggest', 'daily pick', 'who', 'bride', 'groom', 'jodidaar'],
    weight: 2
  },
  {
    intent: 'kundali',
    patterns: ['kundali', 'kundli', 'horoscope', 'astrology', 'guna', 'manglik', 'rashi', 'nakshatra', 'patrika', 'janam', 'graha', 'compatibility score'],
    weight: 3
  },
  {
    intent: 'premium_info',
    patterns: ['premium', 'membership', 'plan', 'price', 'cost', 'paid', 'upgrade', 'subscribe', 'gold', 'platinum', 'silver', 'kitna', 'paisa'],
    weight: 2
  },
  {
    intent: 'safety',
    patterns: ['safe', 'security', 'scam', 'fraud', 'fake', 'report', 'block', 'trust', 'genuine', 'real', 'suspicious', 'cheat', 'dhokha'],
    weight: 3
  },
  {
    intent: 'communication',
    patterns: ['message', 'chat', 'reply', 'interest', 'accept', 'decline', 'respond', 'no reply', 'send', 'connect', 'what to say', 'talk'],
    weight: 2
  },
  {
    intent: 'first_meeting',
    patterns: ['meet', 'meeting', 'first', 'date', 'where', 'what to wear', 'nervous', 'conversation', 'mulakat', 'milna', 'bhet'],
    weight: 2
  },
  {
    intent: 'family_advice',
    patterns: ['family', 'parents', 'convince', 'approval', 'intercaste', 'love marriage', 'arrange', 'parivaar', 'maa', 'papa', 'ghar', 'kutumb'],
    weight: 2
  },
  {
    intent: 'features',
    patterns: ['feature', 'what can', 'options', 'service', 'facility', 'suvidhaa', 'kya kya', 'list'],
    weight: 1
  },
  {
    intent: 'how_to_use',
    patterns: ['how', 'use', 'start', 'begin', 'steps', 'guide', 'help', 'process', 'kaise', 'kasa', 'shuru'],
    weight: 1
  },
  {
    intent: 'verification',
    patterns: ['verify', 'verification', 'blue tick', 'id', 'proof', 'trust badge', 'aadhaar', 'pan', 'passport', 'genuine'],
    weight: 2
  },
  {
    intent: 'complaint',
    patterns: ['problem', 'issue', 'bug', 'not working', 'error', 'complaint', 'support', 'help me', 'frustrated', 'dikkat', 'samasya'],
    weight: 2
  },
]

/**
 * Classify user input into an intent
 */
export function classifyIntent(text: string, language: Language): { intent: Intent; confidence: number } {
  const normalized = normalizeRomanized(text)
  const tokens = tokenize(normalized)
  const originalTokens = tokenize(text)
  const allTokens = Array.from(new Set([...tokens, ...originalTokens]))
  
  let bestIntent: Intent = 'general_question'
  let bestScore = 0
  
  INTENT_PATTERNS.forEach(({ intent, patterns, weight }) => {
    let score = 0
    
    patterns.forEach(pattern => {
      // Exact substring match in full text
      if (normalized.includes(pattern) || text.toLowerCase().includes(pattern)) {
        score += 3 * weight
      }
      // Token match
      const patternTokens = pattern.split(' ')
      patternTokens.forEach(pt => {
        allTokens.forEach(at => {
          if (at === pt) score += 2 * weight
          else if (at.includes(pt) || pt.includes(at)) score += 1 * weight
        })
      })
    })
    
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  })
  
  // Confidence (0-1) based on score relative to expected max
  const confidence = Math.min(bestScore / 15, 1)
  
  return { intent: bestIntent, confidence }
}
