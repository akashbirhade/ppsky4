// ============================================================
// SECURITY CONFIGURATION - Soulmate Sync Platform
// Enterprise-grade security with OWASP Top 10 compliance
// ============================================================

export const SECURITY_CONFIG = {
  // JWT Configuration
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'sm-access-$3cr3t-k3y-2024-pr0duct10n',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'sm-refresh-$3cr3t-k3y-2024-pr0duct10n',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'soulmatesync.com',
    audience: 'soulmatesync-api',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,         // per window
    authMaxAttempts: 5,       // login attempts
    authLockoutMs: 30 * 60 * 1000, // 30 min lockout
    apiMaxRequests: 200,
    uploadMaxRequests: 10,
  },

  // Password Policy
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: false,
    bcryptRounds: 12,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Session Configuration
  session: {
    maxConcurrentSessions: 3,
    idleTimeout: 30 * 60 * 1000, // 30 min idle
    absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'https://soulmatesync.com',
      'https://www.soulmatesync.com',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Tenant-ID'],
    maxAge: 86400,
  },

  // Security Headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },

  // File Upload Security
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10,
    scanForMalware: true,
  },

  // Multi-Tenant Configuration
  tenant: {
    headerName: 'X-Tenant-ID',
    defaultTenant: 'default',
    isolation: 'logical', // logical | physical
  },

  // Audit Log Configuration
  audit: {
    enabled: true,
    retentionDays: 365,
    sensitiveFields: ['password', 'phone', 'email', 'cvv', 'cardNumber'],
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000,
    sensitiveFields: ['phone', 'email', 'aadhaar'],
  },

  // API Security
  api: {
    maxPayloadSize: '1mb',
    requestTimeout: 30000, // 30s
    enableApiKeyAuth: false,
  },
}

// Role definitions for RBAC
export const ROLES = {
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Permission matrix
export const PERMISSIONS: Record<string, Role[]> = {
  'profile:read': ['user', 'premium', 'admin', 'super_admin'],
  'profile:write': ['user', 'premium', 'admin', 'super_admin'],
  'profile:delete': ['admin', 'super_admin'],
  'contact:view': ['premium', 'admin', 'super_admin'],
  'call:initiate': ['premium', 'admin', 'super_admin'],
  'message:send': ['user', 'premium', 'admin', 'super_admin'],
  'message:read': ['user', 'premium', 'admin', 'super_admin'],
  'admin:access': ['admin', 'super_admin'],
  'admin:users': ['admin', 'super_admin'],
  'admin:reports': ['admin', 'super_admin'],
  'admin:revenue': ['super_admin'],
  'subscription:manage': ['user', 'premium', 'admin', 'super_admin'],
  'upload:photo': ['user', 'premium', 'admin', 'super_admin'],
}
