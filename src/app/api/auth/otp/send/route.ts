import { NextRequest, NextResponse } from 'next/server'
import { getUserByPhone } from '@/lib/database'

// In-memory OTP store (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expiresAt: number; purpose: 'register' | 'login' }>()

export function getOtpStore() {
  return otpStore
}

export async function POST(req: NextRequest) {
  try {
    const { phone, purpose } = await req.json()

    if (!phone || !purpose) {
      return NextResponse.json({ error: 'Phone number and purpose are required' }, { status: 400 })
    }

    if (!['register', 'login'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
    }

    // Validate phone format (Indian mobile: 10 digits)
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 })
    }

    // For login, check if user exists with this phone
    if (purpose === 'login') {
      const user = getUserByPhone(cleanPhone)
      if (!user) {
        return NextResponse.json({ error: 'No account found with this mobile number' }, { status: 404 })
      }
    }

    // For register, check if phone already used
    if (purpose === 'register') {
      const existing = getUserByPhone(cleanPhone)
      if (existing) {
        return NextResponse.json({ error: 'This mobile number is already registered' }, { status: 409 })
      }
    }

    // Rate limiting: prevent resend within 30 seconds
    const existingOtp = otpStore.get(cleanPhone)
    if (existingOtp && existingOtp.expiresAt - Date.now() > 4.5 * 60 * 1000) {
      return NextResponse.json({ error: 'Please wait 30 seconds before requesting a new OTP' }, { status: 429 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with 5 min expiry
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      purpose,
    })

    // In production, send SMS via Twilio/MSG91/etc.
    // For demo, log the OTP
    console.log(`[OTP] ${cleanPhone}: ${otp} (purpose: ${purpose})`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Include OTP in response for demo purposes only
      demo_otp: otp,
    })
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
