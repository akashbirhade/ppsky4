// ============================================================
// NEXT.JS MIDDLEWARE - Security Gateway
// Enforces security headers, CORS, rate limiting, JWT auth at edge
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers applied to all responses
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
}

// API paths that don't require authentication
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/health',
  '/api/hosts/auth/login',
  '/api/hosts/auth/register',
  '/api/payment/phonepe/callback',
]

// Page paths that don't require authentication
const PUBLIC_PAGE_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/legal',
  '/legal/terms-and-conditions',
  '/legal/privacy-policy',
  '/legal/refund-cancellation',
  '/legal/return-policy',
  '/legal/shipping-policy',
  '/premium',
  '/hosts',
  '/payment/success',
  '/payment/error',
]

// Static asset patterns
const STATIC_PATTERNS = [
  '/_next/',
  '/favicon.ico',
  '/uploads/',
  '/images/',
]

// In-memory rate limit store (resets on server restart, but middleware runs on edge)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkEdgeRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 min
  const maxRequests = 200

  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++
  
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip static assets
  if (STATIC_PATTERNS.some(p => pathname.startsWith(p))) {
    return response
  }

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // HSTS for production
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // CSP header
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "media-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '))

  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1'

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const { allowed, remaining } = checkEdgeRateLimit(ip)
    
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests', retryAfter: 900 }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '900',
            ...SECURITY_HEADERS,
          } 
        }
      )
    }

    // Stricter rate limit for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
      const authKey = `auth:${ip}`
      const authEntry = rateLimitMap.get(authKey)
      const now = Date.now()
      
      if (!authEntry || now > authEntry.resetAt) {
        rateLimitMap.set(authKey, { count: 1, resetAt: now + 15 * 60 * 1000 })
      } else {
        authEntry.count++
        if (authEntry.count > 10) { // 10 auth attempts per 15 min
          return new NextResponse(
            JSON.stringify({ error: 'Too many authentication attempts. Try again later.' }),
            { 
              status: 429, 
              headers: { 
                'Content-Type': 'application/json',
                'Retry-After': '900',
                ...SECURITY_HEADERS,
              } 
            }
          )
        }
      }
    }
  }

  // CORS handling for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = ['http://localhost:3000', 'https://soulmatesync.com', 'https://www.soulmatesync.com']
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Tenant-ID')
      response.headers.set('Access-Control-Max-Age', '86400')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204, 
        headers: Object.fromEntries(response.headers.entries()) 
      })
    }

    // JWT Authentication check for protected API routes
    const isPublicApi = PUBLIC_API_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isPublicApi) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required. Please login.' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...SECURITY_HEADERS,
            }
          }
        )
      }

      // Verify JWT token structure and expiry at edge level
      // Full cryptographic verification happens in the API route handler
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid token format')
        }
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        
        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return new NextResponse(
            JSON.stringify({ error: 'Token expired. Please login again.' }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...SECURITY_HEADERS,
              }
            }
          )
        }

        // Check required claims
        if (!payload.userId || !payload.email) {
          throw new Error('Invalid token claims')
        }

        // Pass user info to downstream via headers
        response.headers.set('X-User-ID', payload.userId)
        response.headers.set('X-User-Email', payload.email)
      } catch {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid or expired token. Please login again.' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...SECURITY_HEADERS,
            }
          }
        )
      }
    }
  }

  // Tenant resolution - add tenant ID to headers for downstream
  const tenantId = request.headers.get('x-tenant-id') || 'default'
  response.headers.set('X-Tenant-ID', tenantId)

  // Request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  // Remove server identification headers
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
