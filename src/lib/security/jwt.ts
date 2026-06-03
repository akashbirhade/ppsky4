// ============================================================
// JWT TOKEN SERVICE - Access + Refresh Token Pattern
// Implements secure token lifecycle management
// ============================================================

import jwt, { SignOptions } from 'jsonwebtoken'
import { SECURITY_CONFIG, Role } from './config'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const TOKENS_FILE = path.join(process.cwd(), 'data', 'tokens.json')

export interface TokenPayload {
  userId: string
  email: string
  role: Role
  tenantId: string
  sessionId: string
  iat?: number
  exp?: number
}

export interface RefreshTokenRecord {
  id: string
  userId: string
  token: string
  sessionId: string
  tenantId: string
  userAgent: string
  ip: string
  createdAt: string
  expiresAt: string
  revoked: boolean
}

// Store for refresh tokens (file-based persistence)
function getTokenStore(): RefreshTokenRecord[] {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveTokenStore(tokens: RefreshTokenRecord[]) {
  const dir = path.dirname(TOKENS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2))
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: '15m',
    issuer: SECURITY_CONFIG.jwt.issuer,
    audience: SECURITY_CONFIG.jwt.audience,
    jwtid: uuidv4(),
  }
  return jwt.sign(payload as object, SECURITY_CONFIG.jwt.accessTokenSecret, options)
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(
  userId: string,
  tenantId: string,
  sessionId: string,
  userAgent: string,
  ip: string
): string {
  const tokenId = uuidv4()
  const refreshOptions: SignOptions = {
    expiresIn: '7d',
    issuer: SECURITY_CONFIG.jwt.issuer,
  }
  const token = jwt.sign(
    { userId, tokenId, tenantId, sessionId },
    SECURITY_CONFIG.jwt.refreshTokenSecret,
    refreshOptions
  )

  // Store refresh token
  const tokens = getTokenStore()
  tokens.push({
    id: tokenId,
    userId,
    token,
    sessionId,
    tenantId,
    userAgent,
    ip,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
  })

  // Enforce max concurrent sessions
  const userTokens = tokens.filter(t => t.userId === userId && !t.revoked)
  if (userTokens.length > SECURITY_CONFIG.session.maxConcurrentSessions) {
    // Revoke oldest sessions
    const sorted = userTokens.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const toRevoke = sorted.slice(0, userTokens.length - SECURITY_CONFIG.session.maxConcurrentSessions)
    toRevoke.forEach(t => { t.revoked = true })
  }

  saveTokenStore(tokens)
  return token
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, SECURITY_CONFIG.jwt.accessTokenSecret, {
      issuer: SECURITY_CONFIG.jwt.issuer,
      audience: SECURITY_CONFIG.jwt.audience,
    }) as TokenPayload
    return payload
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return null // Token expired, need refresh
    }
    return null
  }
}

/**
 * Verify and rotate refresh token (token rotation for security)
 */
export function verifyRefreshToken(token: string): { valid: boolean; userId?: string; tenantId?: string; sessionId?: string } {
  try {
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwt.refreshTokenSecret, {
      issuer: SECURITY_CONFIG.jwt.issuer,
    }) as any

    const tokens = getTokenStore()
    const stored = tokens.find(t => t.userId === decoded.userId && t.token === token && !t.revoked)

    if (!stored) {
      // Token reuse detected! Revoke all user tokens (potential theft)
      tokens.filter(t => t.userId === decoded.userId).forEach(t => { t.revoked = true })
      saveTokenStore(tokens)
      return { valid: false }
    }

    // Check expiry
    if (new Date(stored.expiresAt) < new Date()) {
      stored.revoked = true
      saveTokenStore(tokens)
      return { valid: false }
    }

    // Revoke used token (rotation)
    stored.revoked = true
    saveTokenStore(tokens)

    return { valid: true, userId: decoded.userId, tenantId: decoded.tenantId, sessionId: decoded.sessionId }
  } catch {
    return { valid: false }
  }
}

/**
 * Revoke all tokens for a user (logout everywhere)
 */
export function revokeAllUserTokens(userId: string): void {
  const tokens = getTokenStore()
  tokens.filter(t => t.userId === userId).forEach(t => { t.revoked = true })
  saveTokenStore(tokens)
}

/**
 * Revoke a specific session
 */
export function revokeSession(sessionId: string): void {
  const tokens = getTokenStore()
  tokens.filter(t => t.sessionId === sessionId).forEach(t => { t.revoked = true })
  saveTokenStore(tokens)
}

/**
 * Get active sessions for a user
 */
export function getActiveSessions(userId: string): RefreshTokenRecord[] {
  const tokens = getTokenStore()
  return tokens.filter(t => 
    t.userId === userId && 
    !t.revoked && 
    new Date(t.expiresAt) > new Date()
  )
}

/**
 * Clean expired tokens (garbage collection)
 */
export function cleanExpiredTokens(): number {
  const tokens = getTokenStore()
  const before = tokens.length
  const valid = tokens.filter(t => !t.revoked && new Date(t.expiresAt) > new Date())
  saveTokenStore(valid)
  return before - valid.length
}
