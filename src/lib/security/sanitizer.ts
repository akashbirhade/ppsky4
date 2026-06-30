// ============================================================
// INPUT SANITIZATION & VALIDATION
// Prevents XSS, SQLi, NoSQLi, Command Injection
// ============================================================

import { SECURITY_CONFIG } from './config'

// XSS attack patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:\s*text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /vbscript\s*:/gi,
]

// SQL Injection patterns
const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
  /(--|;|\/\*|\*\/|@@|@)/g,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
  /(CHAR\s*\(|CONCAT\s*\(|CONVERT\s*\()/gi,
]

// NoSQL Injection patterns
const NOSQL_PATTERNS = [
  /\$where/gi,
  /\$gt/gi,
  /\$lt/gi,
  /\$ne/gi,
  /\$regex/gi,
  /\$exists/gi,
]

// Command Injection patterns
const CMD_PATTERNS = [
  /[;&|`$]/g,
  /\.\.\//g,
  /\0/g,
]

/**
 * Sanitize string input - removes XSS vectors
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Limit length
  return sanitized.slice(0, 10000)
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): { valid: boolean; sanitized: string } {
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/
  
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized: trimmed }
}

/**
 * Validate phone number
 */
export function sanitizePhone(phone: string): { valid: boolean; sanitized: string } {
  const digits = phone.replace(/[\s\-\(\)\+]/g, '')
  if (!/^\d{10,13}$/.test(digits)) {
    return { valid: false, sanitized: '' }
  }
  return { valid: true, sanitized: digits }
}

/**
 * Detect malicious patterns in input
 */
export function detectInjection(input: string): { safe: boolean; threats: string[] } {
  const threats: string[] = []
  
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('XSS')
      break
    }
  }
  
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('SQL_INJECTION')
      break
    }
  }
  
  for (const pattern of NOSQL_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('NOSQL_INJECTION')
      break
    }
  }
  
  for (const pattern of CMD_PATTERNS) {
    if (pattern.test(input) && input.length > 1) {
      // Only flag if it looks intentional
      if (/[;&|`]{2,}/.test(input) || /\.\.\/(\.\.\/)+/.test(input)) {
        threats.push('COMMAND_INJECTION')
      }
      break
    }
  }
  
  return { safe: threats.length === 0, threats }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = SECURITY_CONFIG.password
  
  if (password.length < config.minLength) errors.push(`Minimum ${config.minLength} characters`)
  if (password.length > config.maxLength) errors.push(`Maximum ${config.maxLength} characters`)
  if (config.requireUppercase && !/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
  if (config.requireLowercase && !/[a-z]/.test(password)) errors.push('At least one lowercase letter')
  if (config.requireNumbers && !/\d/.test(password)) errors.push('At least one number')
  if (config.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character')
  
  // Check common passwords
  const common = ['password', '12345678', 'qwerty123', 'admin123', 'letmein', 'welcome1']
  if (common.includes(password.toLowerCase())) errors.push('Password is too common')
  
  return { valid: errors.length === 0, errors }
}

/**
 * Sanitize an entire request body recursively
 */
export function sanitizeRequestBody(body: any, depth = 0): any {
  if (depth > 10) return {} // Prevent deep recursion attacks
  
  if (typeof body === 'string') {
    return sanitizeString(body)
  }
  
  if (Array.isArray(body)) {
    return body.slice(0, 100).map(item => sanitizeRequestBody(item, depth + 1))
  }
  
  if (typeof body === 'object' && body !== null) {
    const sanitized: any = {}
    const keys = Object.keys(body).slice(0, 50) // Limit keys
    
    for (const key of keys) {
      // Skip prototype pollution attempts
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
      
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_\-\.]/g, '')
      sanitized[sanitizedKey] = sanitizeRequestBody(body[key], depth + 1)
    }
    
    return sanitized
  }
  
  if (typeof body === 'number' || typeof body === 'boolean') {
    return body
  }
  
  return null
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: { name: string; type: string; size: number }): { valid: boolean; error?: string } {
  const config = SECURITY_CONFIG.upload
  
  if (file.size > config.maxFileSize) {
    return { valid: false, error: `File size exceeds ${config.maxFileSize / 1024 / 1024}MB limit` }
  }
  
  if (!config.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` }
  }
  
  // Check for double extensions (e.g., file.php.jpg)
  const parts = file.name.split('.')
  if (parts.length > 2) {
    const suspiciousExts = ['php', 'exe', 'sh', 'bat', 'cmd', 'ps1', 'js', 'py']
    if (parts.some(p => suspiciousExts.includes(p.toLowerCase()))) {
      return { valid: false, error: 'Suspicious file name detected' }
    }
  }
  
  return { valid: true }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}
