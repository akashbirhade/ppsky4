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
  return Math.floor(100000 + Math.random() * 900000).toString()
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
 * Send verification email (in production, use Nodemailer/SendGrid/Resend)
 * For now, logs to console in development
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/verify?token=${token}`

  // In production, replace with actual email sending (Resend, SendGrid, etc.)
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    console.log(`\n📧 VERIFICATION EMAIL (Dev Mode)`)
    console.log(`To: ${email}`)
    console.log(`Link: ${verifyUrl}`)
    console.log(`---`)
    return true
  }

  // Production email sending with Nodemailer
  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Soulmate Sync" <${process.env.SMTP_FROM || 'noreply@soulmatesync.com'}>`,
      to: email,
      subject: 'Verify your email - Soulmate Sync',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; text-align: center;">💜 Soulmate Sync</h1>
          <h2 style="text-align: center;">Verify Your Email</h2>
          <p style="text-align: center; color: #666;">Click the button below to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}
