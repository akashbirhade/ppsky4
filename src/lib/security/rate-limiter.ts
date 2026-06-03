// ============================================================
// RATE LIMITER - Token Bucket Algorithm
// Prevents brute force, DDoS, and abuse
// ============================================================

import fs from 'fs'
import path from 'path'
import { SECURITY_CONFIG } from './config'

const RATE_LIMIT_FILE = path.join(process.cwd(), 'data', 'rate_limits.json')

interface RateLimitEntry {
  key: string
  tokens: number
  lastRefill: number
  blocked: boolean
  blockedUntil: number
  attempts: number
}

interface RateLimitStore {
  entries: Record<string, RateLimitEntry>
  lastCleanup: number
}

function getStore(): RateLimitStore {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf-8'))
    }
  } catch {}
  return { entries: {}, lastCleanup: Date.now() }
}

function saveStore(store: RateLimitStore) {
  const dir = path.dirname(RATE_LIMIT_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(store))
}

/**
 * Token Bucket Rate Limiter
 */
export function checkRateLimit(
  identifier: string,
  type: 'general' | 'auth' | 'api' | 'upload' = 'general'
): { allowed: boolean; remaining: number; retryAfter?: number; blocked?: boolean } {
  const store = getStore()
  const now = Date.now()

  // Periodic cleanup (every 5 minutes)
  if (now - store.lastCleanup > 5 * 60 * 1000) {
    Object.keys(store.entries).forEach(key => {
      const entry = store.entries[key]
      if (now - entry.lastRefill > SECURITY_CONFIG.rateLimit.windowMs * 2) {
        delete store.entries[key]
      }
    })
    store.lastCleanup = now
  }

  const key = `${type}:${identifier}`
  let entry = store.entries[key]

  // Get max requests based on type
  const maxRequests = type === 'auth' ? SECURITY_CONFIG.rateLimit.authMaxAttempts
    : type === 'upload' ? SECURITY_CONFIG.rateLimit.uploadMaxRequests
    : type === 'api' ? SECURITY_CONFIG.rateLimit.apiMaxRequests
    : SECURITY_CONFIG.rateLimit.maxRequests

  if (!entry) {
    entry = {
      key,
      tokens: maxRequests - 1,
      lastRefill: now,
      blocked: false,
      blockedUntil: 0,
      attempts: 1,
    }
    store.entries[key] = entry
    saveStore(store)
    return { allowed: true, remaining: entry.tokens }
  }

  // Check if blocked
  if (entry.blocked && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000)
    saveStore(store)
    return { allowed: false, remaining: 0, retryAfter, blocked: true }
  }

  // Unblock if lockout expired
  if (entry.blocked && now >= entry.blockedUntil) {
    entry.blocked = false
    entry.tokens = maxRequests
    entry.attempts = 0
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill
  const refillRate = maxRequests / (SECURITY_CONFIG.rateLimit.windowMs / 1000)
  const tokensToAdd = Math.floor((elapsed / 1000) * refillRate)
  
  if (tokensToAdd > 0) {
    entry.tokens = Math.min(maxRequests, entry.tokens + tokensToAdd)
    entry.lastRefill = now
  }

  // Consume a token
  if (entry.tokens > 0) {
    entry.tokens--
    entry.attempts++
    saveStore(store)
    return { allowed: true, remaining: entry.tokens }
  }

  // No tokens left - block for auth type
  if (type === 'auth') {
    entry.blocked = true
    entry.blockedUntil = now + SECURITY_CONFIG.rateLimit.authLockoutMs
    saveStore(store)
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfter: Math.ceil(SECURITY_CONFIG.rateLimit.authLockoutMs / 1000),
      blocked: true 
    }
  }

  saveStore(store)
  const retryAfter = Math.ceil((SECURITY_CONFIG.rateLimit.windowMs - elapsed) / 1000)
  return { allowed: false, remaining: 0, retryAfter }
}

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string, type: string = 'general'): void {
  const store = getStore()
  const key = `${type}:${identifier}`
  delete store.entries[key]
  saveStore(store)
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(identifier: string, type: 'general' | 'auth' | 'api' | 'upload' = 'general'): Record<string, string> {
  const result = checkRateLimit(identifier, type)
  const maxRequests = type === 'auth' ? SECURITY_CONFIG.rateLimit.authMaxAttempts
    : type === 'api' ? SECURITY_CONFIG.rateLimit.apiMaxRequests
    : SECURITY_CONFIG.rateLimit.maxRequests

  return {
    'X-RateLimit-Limit': String(maxRequests),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (SECURITY_CONFIG.rateLimit.windowMs / 1000)),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
  }
}
