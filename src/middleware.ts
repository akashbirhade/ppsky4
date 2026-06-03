// ============================================================
// NEXT.JS MIDDLEWARE - Security Gateway
// Enforces security headers, CORS, rate limiting at edge
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

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/health',
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
