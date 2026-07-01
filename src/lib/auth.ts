import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production')
  return 'soulmatesync-secret-key-2024'
})()

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Verify JWT token from request headers or cookies
 * Returns the decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractTokenFromRequest(req: NextRequest): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check cookie as fallback
  const cookieToken = req.cookies.get('soulmateSync_token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Authenticate request - extracts and verifies JWT token
 * Returns the user payload or an error response
 */
export function authenticateRequest(req: NextRequest): { user: JWTPayload } | { error: NextResponse } {
  const token = extractTokenFromRequest(req)

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required. Please login.' },
        { status: 401 }
      )
    }
  }

  const payload = verifyToken(token)

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      )
    }
  }

  return { user: payload }
}

/**
 * Helper to get authenticated user ID from request
 * Returns userId if authenticated, or sends 401 response
 */
export function getAuthenticatedUserId(req: NextRequest): string | NextResponse {
  const result = authenticateRequest(req)
  if ('error' in result) {
    return result.error
  }
  return result.user.userId
}
