// ============================================================
// API SECURITY WRAPPER - Unified Route Protection
// Wraps API handlers with auth, rate limiting, validation, audit
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './rate-limiter'
import { sanitizeRequestBody, detectInjection } from './sanitizer'
import { logAuditEvent, AuditEventType } from './audit'
import { Role } from './config'

export interface SecureApiContext {
  userId: string
  email: string
  role: Role
  tenantId: string
  ip: string
  userAgent: string
  body: any
}

interface SecureApiOptions {
  requireAuth?: boolean
  requiredRole?: Role[]
  rateLimit?: 'general' | 'auth' | 'api' | 'upload'
  auditEvent?: AuditEventType
  maxBodySize?: number
}

/**
 * Extract auth info from request (backward compatible with existing JWT)
 */
function extractAuth(request: NextRequest): { userId: string; email: string; role: Role } | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      // Decode JWT payload (existing system uses jsonwebtoken)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      if (payload.userId || payload.id) {
        return {
          userId: payload.userId || payload.id,
          email: payload.email || '',
          role: payload.role || 'user',
        }
      }
    } catch {}
  }

  // Try cookie
  const cookie = request.headers.get('cookie') || ''
  const tokenMatch = cookie.match(/auth_token=([^;]+)/)
  if (tokenMatch) {
    try {
      const payload = JSON.parse(Buffer.from(tokenMatch[1].split('.')[1], 'base64').toString())
      if (payload.userId || payload.id) {
        return {
          userId: payload.userId || payload.id,
          email: payload.email || '',
          role: payload.role || 'user',
        }
      }
    } catch {}
  }

  return null
}

/**
 * Secure API handler wrapper
 */
export function secureApiHandler(
  handler: (request: NextRequest, context: SecureApiContext) => Promise<NextResponse>,
  options: SecureApiOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    // Rate limiting
    if (options.rateLimit) {
      const rateLimitResult = checkRateLimit(ip, options.rateLimit)
      if (!rateLimitResult.allowed) {
        logAuditEvent({
          eventType: 'RATE_LIMIT_EXCEEDED',
          ip,
          userAgent,
          tenantId,
          resource: request.nextUrl.pathname,
          action: 'RATE_LIMITED',
          success: false,
        })
        return NextResponse.json(
          { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
          { status: 429 }
        )
      }
    }

    // Authentication
    let auth: { userId: string; email: string; role: Role } | null = null
    if (options.requireAuth !== false) {
      auth = extractAuth(request)
      if (!auth && options.requireAuth) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }

    // Role authorization
    if (options.requiredRole && auth) {
      if (!options.requiredRole.includes(auth.role)) {
        logAuditEvent({
          eventType: 'PERMISSION_DENIED',
          userId: auth.userId,
          ip,
          userAgent,
          tenantId,
          resource: request.nextUrl.pathname,
          action: `Required: ${options.requiredRole.join(',')}`,
          success: false,
        })
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Body parsing and sanitization
    let body: any = null
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const contentType = request.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const rawBody = await request.text()
          
          // Check payload size
          if (options.maxBodySize && rawBody.length > options.maxBodySize) {
            return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
          }
          
          body = JSON.parse(rawBody)
          
          // Injection detection
          const injection = detectInjection(rawBody)
          if (!injection.safe) {
            logAuditEvent({
              eventType: 'INJECTION_ATTEMPT',
              userId: auth?.userId,
              ip,
              userAgent,
              tenantId,
              resource: request.nextUrl.pathname,
              action: `Detected: ${injection.threats.join(', ')}`,
              details: { threats: injection.threats },
              success: false,
            })
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
          }
          
          // Sanitize body
          body = sanitizeRequestBody(body)
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
    }

    // Build context
    const context: SecureApiContext = {
      userId: auth?.userId || '',
      email: auth?.email || '',
      role: auth?.role || 'user',
      tenantId,
      ip,
      userAgent,
      body,
    }

    // Execute handler
    try {
      const response = await handler(request, context)

      // Audit logging
      if (options.auditEvent) {
        logAuditEvent({
          eventType: options.auditEvent,
          userId: auth?.userId,
          ip,
          userAgent,
          tenantId,
          resource: request.nextUrl.pathname,
          action: request.method,
          success: response.status < 400,
        })
      }

      return response
    } catch (error: any) {
      // Log unexpected errors
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        severity: 'CRITICAL',
        userId: auth?.userId,
        ip,
        userAgent,
        tenantId,
        resource: request.nextUrl.pathname,
        action: `ERROR: ${error.message}`,
        success: false,
      })

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
