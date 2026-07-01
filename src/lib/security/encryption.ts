// ============================================================
// FIELD-LEVEL ENCRYPTION SERVICE
// Encrypts PII (phone, email, aadhaar) at rest
// ============================================================

import crypto from 'crypto'
import { SECURITY_CONFIG } from './config'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('ENCRYPTION_KEY must be set in production')
  return 'sm-3ncrypt10n-k3y-2024-d3f4ult-k3y!'
})()
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16

/**
 * Derive encryption key using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    ENCRYPTION_KEY,
    salt,
    SECURITY_CONFIG.encryption.iterations,
    32,
    'sha512'
  )
}

/**
 * Encrypt a plaintext value
 * Returns: base64 encoded string (salt:iv:authTag:ciphertext)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return ''

  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  // Format: salt:iv:authTag:ciphertext (all hex encoded)
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':')
}

/**
 * Decrypt an encrypted value
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':')) return encryptedData

  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 4) return encryptedData // Not encrypted data

    const [saltHex, ivHex, authTagHex, ciphertext] = parts
    const salt = Buffer.from(saltHex, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = deriveKey(salt)

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    // If decryption fails, return original (might not be encrypted)
    return encryptedData
  }
}

/**
 * Hash a value (one-way, for lookups)
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value + ENCRYPTION_KEY).digest('hex')
}

/**
 * Encrypt sensitive fields in a user object
 */
export function encryptUserPII(user: Record<string, any>): Record<string, any> {
  const encrypted = { ...user }
  
  for (const field of SECURITY_CONFIG.encryption.sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      // Store hash for lookups
      encrypted[`${field}_hash`] = hashValue(encrypted[field])
      // Encrypt the actual value
      encrypted[field] = encrypt(encrypted[field])
    }
  }
  
  return encrypted
}

/**
 * Decrypt sensitive fields in a user object
 */
export function decryptUserPII(user: Record<string, any>): Record<string, any> {
  const decrypted = { ...user }
  
  for (const field of SECURITY_CONFIG.encryption.sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decrypt(decrypted[field])
    }
  }
  
  return decrypted
}

/**
 * Mask a value for display (e.g., phone: ****7890)
 */
export function maskValue(value: string, type: 'phone' | 'email' | 'aadhaar'): string {
  if (!value) return '***'

  switch (type) {
    case 'phone':
      return '****' + value.slice(-4)
    case 'email': {
      const [local, domain] = value.split('@')
      return local.slice(0, 2) + '***@' + domain
    }
    case 'aadhaar':
      return '****' + value.slice(-4)
    default:
      return '***'
  }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash password with bcrypt-compatible approach using crypto
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, SECURITY_CONFIG.encryption.iterations, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify password against hash
 */
export function verifyPasswordHash(password: string, storedHash: string): boolean {
  if (!storedHash.includes(':')) return false
  const [salt, hash] = storedHash.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, SECURITY_CONFIG.encryption.iterations, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'))
}
