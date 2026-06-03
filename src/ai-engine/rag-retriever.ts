/**
 * Soulmate Sync AI Engine - RAG (Retrieval Augmented Generation)
 * 
 * This module implements:
 * 1. TF-IDF based document scoring
 * 2. Semantic similarity matching via keyword overlap + fuzzy matching
 * 3. Context-aware retrieval with conversation history
 * 4. Multilingual query processing
 */

import { knowledgeBase, KnowledgeDocument } from './knowledge-base'
import { tokenize, normalizeRomanized, Language } from './nlp-processor'

/**
 * TF-IDF scoring for document relevance
 */
function computeTFIDF(queryTokens: string[], docTokens: string[]): number {
  if (docTokens.length === 0) return 0
  
  let score = 0
  const docLength = docTokens.length
  
  queryTokens.forEach(qt => {
    // Term frequency in document
    const tf = docTokens.filter(dt => dt === qt || dt.includes(qt) || qt.includes(dt)).length / docLength
    // Inverse document frequency (simplified - based on how many docs contain the term)
    const docsWithTerm = knowledgeBase.filter(doc => {
      const allText = `${doc.content} ${doc.tags.join(' ')}`.toLowerCase()
      return allText.includes(qt)
    }).length
    const idf = Math.log(knowledgeBase.length / (1 + docsWithTerm))
    score += tf * idf
  })
  
  return score
}

/**
 * Fuzzy string matching (Levenshtein-based similarity)
 */
function fuzzyMatch(a: string, b: string): number {
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return 0.8
  
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  
  if (longer.length === 0) return 1
  const dist = levenshteinDistance(longer, shorter)
  return (longer.length - dist) / longer.length
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length
  if (m === 0) return n
  if (n === 0) return m
  
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

/**
 * Tag-based matching score
 */
function tagMatchScore(queryTokens: string[], tags: string[]): number {
  let score = 0
  queryTokens.forEach(qt => {
    tags.forEach(tag => {
      if (tag === qt) score += 3
      else if (tag.includes(qt) || qt.includes(tag)) score += 2
      else if (fuzzyMatch(tag, qt) > 0.7) score += 1
    })
  })
  return score
}

export interface RetrievalResult {
  document: KnowledgeDocument
  score: number
  matchType: 'exact' | 'semantic' | 'fuzzy'
}

/**
 * Main RAG retrieval function
 * Retrieves the most relevant documents for a given query
 */
export function retrieveDocuments(
  query: string,
  language: Language,
  topK: number = 3,
  conversationContext?: string[]
): RetrievalResult[] {
  // Normalize the query (handle Romanized Hindi/Marathi)
  const normalizedQuery = normalizeRomanized(query)
  const queryTokens = tokenize(normalizedQuery)
  
  // Also tokenize original query for Devanagari support
  const originalTokens = tokenize(query)
  const allTokens = Array.from(new Set([...queryTokens, ...originalTokens]))
  
  // Add context from conversation history
  if (conversationContext && conversationContext.length > 0) {
    const contextTokens = conversationContext
      .slice(-2)
      .flatMap(c => tokenize(normalizeRomanized(c)))
      .slice(0, 5) // Limit context influence
    allTokens.push(...contextTokens.map(t => t))
  }
  
  const results: RetrievalResult[] = knowledgeBase.map(doc => {
    // Combine all document text for matching
    const docText = `${doc.content} ${doc.content_hi || ''} ${doc.content_mr || ''} ${doc.tags.join(' ')} ${doc.category}`
    const docTokens = tokenize(docText)
    
    // Score components
    const tfidfScore = computeTFIDF(allTokens, docTokens)
    const tagScore = tagMatchScore(allTokens, doc.tags)
    const priorityBonus = doc.priority / 20
    
    // Category boost based on query intent
    let categoryBoost = 0
    if (normalizedQuery.includes('how') || normalizedQuery.includes('use') || normalizedQuery.includes('start')) {
      if (doc.category === 'howto') categoryBoost = 2
    }
    if (normalizedQuery.includes('safe') || normalizedQuery.includes('scam') || normalizedQuery.includes('fake')) {
      if (doc.category === 'safety') categoryBoost = 2
    }
    if (normalizedQuery.includes('premium') || normalizedQuery.includes('price') || normalizedQuery.includes('plan')) {
      if (doc.category === 'premium') categoryBoost = 2
    }
    if (normalizedQuery.includes('kundali') || normalizedQuery.includes('horoscope')) {
      if (doc.category === 'matchmaking' && doc.tags.includes('kundali')) categoryBoost = 3
    }
    
    const totalScore = (tfidfScore * 3) + (tagScore * 2) + priorityBonus + categoryBoost
    
    const matchType: 'exact' | 'semantic' | 'fuzzy' = tagScore > 4 ? 'exact' : tagScore > 1 ? 'semantic' : 'fuzzy'
    
    return { document: doc, score: totalScore, matchType }
  })
  
  // Sort by score and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(r => r.score > 0.1) // Filter out irrelevant results
}

/**
 * Generate context string from retrieved documents for response generation
 */
export function buildContext(results: RetrievalResult[], language: Language): string {
  return results.map(r => {
    const doc = r.document
    if (language === 'hi' && doc.content_hi) return doc.content_hi
    if (language === 'mr' && doc.content_mr) return doc.content_mr
    return doc.content
  }).join('\n\n')
}
