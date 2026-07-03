import crypto from 'crypto'
import { getUserByEmail, updateUser } from './database'

// In-memory store for verification tokens (in production, use database)
const globalForVerify = globalThis as unknown as { __verifyTokens?: Map<string, { userId: string; email: string; expires: number }> }
if (!globalForVerify.__verifyTokens) {
  globalForVerify.__verifyTokens = new Map()
}
const verifyTokens = globalForVerify.__verifyTokens

/**
 * Generate an email verification token
 */
export function generateVerificationToken(userId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  verifyTokens.set(token, { userId, email, expires })

  // Clean expired tokens
  verifyTokens.forEach((val, key) => {
    if (val.expires < Date.now()) verifyTokens.delete(key)
  })

  return token
}

/**
 * Verify an email verification token
 */
export function verifyEmailToken(token: string): { success: boolean; userId?: string; email?: string; error?: string } {
  const data = verifyTokens.get(token)
  if (!data) return { success: false, error: 'Invalid or expired verification link' }
  if (data.expires < Date.now()) {
    verifyTokens.delete(token)
    return { success: false, error: 'Verification link has expired' }
  }

  // Mark user email as verified
  updateUser(data.userId, { verified: true } as any)
  verifyTokens.delete(token)

  return { success: true, userId: data.userId, email: data.email }
}

/**
 * Generate OTP for phone verification
 */
export function generateOTP(): string {
  const crypto = require('crypto')
  return crypto.randomInt(100000, 999999).toString()
}

// OTP store
const globalForOTP = globalThis as unknown as { __otpStore?: Map<string, { otp: string; expires: number; attempts: number }> }
if (!globalForOTP.__otpStore) {
  globalForOTP.__otpStore = new Map()
}
const otpStore = globalForOTP.__otpStore

export function storeOTP(identifier: string, otp: string): void {
  otpStore.set(identifier, {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  })
}

export function verifyOTP(identifier: string, userOtp: string): { success: boolean; error?: string } {
  const stored = otpStore.get(identifier)
  if (!stored) return { success: false, error: 'No OTP found. Please request a new one.' }
  if (stored.expires < Date.now()) {
    otpStore.delete(identifier)
    return { success: false, error: 'OTP expired. Please request a new one.' }
  }
  if (stored.attempts >= 5) {
    otpStore.delete(identifier)
    return { success: false, error: 'Too many attempts. Please request a new OTP.' }
  }

  stored.attempts++

  if (stored.otp !== userOtp) {
    return { success: false, error: 'Invalid OTP. Please try again.' }
  }

  otpStore.delete(identifier)
  return { success: true }
}

/**
 * Send verification email using the email service
 */
export async function sendVerificationEmail(email: string, token: string, userName?: string): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
  const verifyUrl = `${baseUrl}/verify?token=${token}`

  const { sendVerificationMail } = await import('./email-service')
  const result = await sendVerificationMail(email, {
    userName: userName || 'there',
    verifyUrl,
  })
  return result.success
}
