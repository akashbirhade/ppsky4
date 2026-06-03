/**
 * Soulmate Sync AI Engine - Main Entry Point
 * 
 * A self-contained NLP + RAG powered AI chatbot engine
 * supporting multilingual conversations (Hindi, English, Marathi).
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────┐
 * │                 User Input                       │
 * └────────────────────┬────────────────────────────┘
 *                      │
 * ┌────────────────────▼────────────────────────────┐
 * │          NLP Processor                           │
 * │  • Language Detection (Hi/En/Mr)                 │
 * │  • Tokenization & Normalization                  │
 * │  • Entity Extraction                             │
 * │  • Sentiment Analysis                            │
 * └────────────────────┬────────────────────────────┘
 *                      │
 * ┌────────────────────▼────────────────────────────┐
 * │          Intent Classifier                       │
 * │  • Pattern matching + scoring                    │
 * │  • 15 intent categories                          │
 * │  • Confidence scoring                            │
 * └────────────────────┬────────────────────────────┘
 *                      │
 * ┌────────────────────▼────────────────────────────┐
 * │          RAG Retriever                           │
 * │  • TF-IDF scoring                                │
 * │  • Fuzzy matching                                │
 * │  • Tag-based retrieval                           │
 * │  • Context-aware ranking                         │
 * └────────────────────┬────────────────────────────┘
 *                      │
 * ┌────────────────────▼────────────────────────────┐
 * │          Response Generator                      │
 * │  • Language-specific response                    │
 * │  • Entity-contextualized                         │
 * │  • Conversation-aware                            │
 * └────────────────────┬────────────────────────────┘
 *                      │
 * ┌────────────────────▼────────────────────────────┐
 * │              AI Response                         │
 * └─────────────────────────────────────────────────┘
 */

import { detectLanguage, tokenize, extractEntities, analyzeSentiment, Language } from './nlp-processor'
import { classifyIntent, Intent } from './intent-classifier'
import { retrieveDocuments, RetrievalResult } from './rag-retriever'
import { generateResponse } from './response-generator'

// Conversation memory (per-session)
interface ConversationSession {
  history: string[]
  language: Language
  userName?: string
  lastIntent?: Intent
}

const sessions: Map<string, ConversationSession> = new Map()

export interface AIResponse {
  message: string
  language: Language
  intent: Intent
  confidence: number
  entities: Record<string, any>
  sentiment: string
  debug?: {
    tokens: string[]
    ragResults: number
    topDoc?: string
  }
}

/**
 * Main function - Process user message and generate AI response
 */
export function processMessage(
  userMessage: string,
  sessionId: string = 'default',
  userName?: string
): AIResponse {
  // Get or create session
  let session = sessions.get(sessionId)
  if (!session) {
    session = { history: [], language: 'en', userName }
    sessions.set(sessionId, session)
  }
  if (userName) session.userName = userName
  
  // Step 1: Language Detection
  const language = detectLanguage(userMessage)
  session.language = language
  
  // Step 2: NLP Processing
  const tokens = tokenize(userMessage)
  const entities = extractEntities(userMessage)
  const sentiment = analyzeSentiment(userMessage)
  
  // Step 3: Intent Classification
  const { intent, confidence } = classifyIntent(userMessage, language)
  session.lastIntent = intent
  
  // Step 4: RAG Retrieval
  const ragResults = retrieveDocuments(userMessage, language, 3, session.history)
  
  // Step 5: Response Generation
  const response = generateResponse({
    intent,
    confidence,
    language,
    entities,
    sentiment,
    ragResults,
    conversationHistory: session.history,
    userName: session.userName
  })
  
  // Update conversation history
  session.history.push(userMessage)
  if (session.history.length > 10) session.history.shift()
  
  return {
    message: response,
    language,
    intent,
    confidence,
    entities,
    sentiment,
    debug: {
      tokens,
      ragResults: ragResults.length,
      topDoc: ragResults[0]?.document.id
    }
  }
}

/**
 * Clear session history
 */
export function clearSession(sessionId: string): void {
  sessions.delete(sessionId)
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): { code: Language; name: string; nativeName: string }[] {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  ]
}

// Re-export types
export type { Language, Intent, RetrievalResult }
