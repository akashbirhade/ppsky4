import { NextRequest, NextResponse } from 'next/server'
import { getUserByPhone } from '@/lib/database'
import { generateStatelessOtp } from '@/lib/otp-store'

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

    // Generate stateless OTP (works on serverless)
    const { otp, otpToken } = generateStatelessOtp(cleanPhone, purpose as 'login' | 'register')

    // In production with SMS provider, send OTP via SMS here.
    // OTP is logged server-side only for demo/development purposes.
    console.log(`[OTP] ${cleanPhone}: ${otp} (purpose: ${purpose})`)

    const response: Record<string, any> = {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      otpToken, // Stateless verification token (required for verify step)
    }

    // Only include OTP in response during development (NEVER in production)
    if (process.env.NODE_ENV === 'development') {
      response.demo_otp = otp
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
