import crypto from 'crypto'

type OtpPurpose = 'register' | 'login'

type OtpEntry = {
  otp: string
  expiresAt: number
  purpose: OtpPurpose
}

// In-memory OTP store as fallback (works in local dev but not on serverless)
const otpStore = new Map<string, OtpEntry>()

export function getOtpStore() {
  return otpStore
}

// ─── Stateless OTP (works on serverless / Vercel) ─────────────────────
// Uses HMAC to create a verifiable token without server-side state.

const OTP_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set in production')
  return 'soulmatesync-dev-otp-secret-not-for-production'
})()

/**
 * Generate a stateless OTP token.
 * Returns the OTP and a signed hash that can be verified later without server state.
 */
export function generateStatelessOtp(phone: string, purpose: OtpPurpose): { otp: string; otpToken: string; expiresAt: number } {
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

  // Create HMAC signature: phone + otp + purpose + expiresAt
  const payload = `${phone}:${otp}:${purpose}:${expiresAt}`
  const signature = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex')

  // Encode as base64 token: expiresAt.signature
  const otpToken = Buffer.from(`${expiresAt}.${signature}`).toString('base64')

  // Also store in memory as fallback (works for same-instance calls)
  otpStore.set(phone, { otp, expiresAt, purpose })

  return { otp, otpToken, expiresAt }
}

/**
 * Verify a stateless OTP token.
 * Recomputes the HMAC to validate without needing server-side state.
 */
export function verifyStatelessOtp(phone: string, otp: string, purpose: OtpPurpose, otpToken: string): { valid: boolean; error?: string } {
  try {
    const decoded = Buffer.from(otpToken, 'base64').toString('utf-8')
    const [expiresAtStr, signature] = decoded.split('.')

    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(expiresAt)) return { valid: false, error: 'Invalid OTP token' }

    // Check expiry
    if (Date.now() > expiresAt) return { valid: false, error: 'OTP has expired. Please request a new one.' }

    // Recompute HMAC
    const payload = `${phone}:${otp}:${purpose}:${expiresAt}`
    const expectedSignature = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex')

    if (signature !== expectedSignature) return { valid: false, error: 'Invalid OTP. Please try again.' }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid OTP token format' }
  }
}
