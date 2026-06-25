/**
 * Input Sanitization & Validation Utilities
 * Prevents XSS, SQL injection patterns, and malicious input
 */

// Sanitize string input - removes potentially dangerous characters
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned)
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters required')
  if (password.length > 128) errors.push('Maximum 128 characters allowed')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required')
  if (!/[0-9]/.test(password)) errors.push('At least one number required')
  return { valid: errors.length === 0, errors }
}

// Sanitize profile data
export function sanitizeProfileData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  const stringFields = [
    'religion', 'caste', 'motherTongue', 'height', 'education',
    'occupation', 'income', 'city', 'state', 'country', 'about',
    'maritalStatus', 'diet', 'name', 'phone'
  ]

  for (const field of stringFields) {
    if (data[field] !== undefined) {
      sanitized[field] = sanitizeString(String(data[field]), field === 'about' ? 2000 : 200)
    }
  }

  // Handle arrays (hobbies, photos)
  if (Array.isArray(data.hobbies)) {
    sanitized.hobbies = data.hobbies
      .slice(0, 20)
      .map((h: any) => sanitizeString(String(h), 50))
  }

  if (Array.isArray(data.photos)) {
    sanitized.photos = data.photos
      .slice(0, 10)
      .filter((p: any) => typeof p === 'string' && (p.startsWith('/uploads/') || p.startsWith('data:image/')))
  }

  // Partner preferences
  if (data.partnerAgeMin !== undefined) sanitized.partnerAgeMin = data.partnerAgeMin
  if (data.partnerAgeMax !== undefined) sanitized.partnerAgeMax = data.partnerAgeMax
  if (data.partnerReligion !== undefined) sanitized.partnerReligion = sanitizeString(String(data.partnerReligion), 100)
  if (data.partnerEducation !== undefined) sanitized.partnerEducation = sanitizeString(String(data.partnerEducation), 100)
  if (data.partnerCity !== undefined) sanitized.partnerCity = sanitizeString(String(data.partnerCity), 100)

  return sanitized
}

// Rate limit check for specific actions (per user)
const actionLimits = new Map<string, { count: number; resetAt: number }>()

export function checkActionLimit(userId: string, action: string, maxPerHour: number = 30): boolean {
  const key = `${userId}:${action}`
  const now = Date.now()
  const entry = actionLimits.get(key)

  if (!entry || now > entry.resetAt) {
    actionLimits.set(key, { count: 1, resetAt: now + 3600000 })
    return true
  }

  if (entry.count >= maxPerHour) return false
  entry.count++
  return true
}
