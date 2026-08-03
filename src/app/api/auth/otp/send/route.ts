import { NextRequest, NextResponse } from 'next/server'
import { getUserByPhone, getUserByPhoneAsync, getUserByEmail, getUserByEmailAsync } from '@/lib/database'
import { generateStatelessOtp } from '@/lib/otp-store'
import { sendOtpSms } from '@/lib/sms'
import { sendOtpEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const { phone, email, purpose } = await req.json()

    if (!purpose || !['register', 'login'].includes(purpose)) {
      return NextResponse.json({ error: 'Valid purpose is required' }, { status: 400 })
    }

    // Email OTP flow
    if (email) {
      const cleanEmail = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
      }

      if (purpose === 'register') {
        const existing = getUserByEmail(cleanEmail) || await getUserByEmailAsync(cleanEmail)
        if (existing) {
          return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
        }
      }

      const { otp, otpToken } = generateStatelessOtp(cleanEmail, purpose as 'login' | 'register')
      const emailResult = await sendOtpEmail(cleanEmail, otp, purpose)

      console.log(`[OTP] ${cleanEmail}: ${otp} (purpose: ${purpose}, email: ${emailResult.success ? 'sent' : 'fallback'})`)

      return NextResponse.json({
        success: true,
        message: emailResult.success
          ? 'OTP sent to your email address'
          : 'OTP generated. Check your email.',
        otpToken,
        emailSent: emailResult.success,
        // Show OTP on screen only if email failed to send (dev fallback)
        ...(emailResult.success ? {} : { demo_otp: otp }),
      })
    }

    // Phone OTP flow (existing)
    if (!phone) {
      return NextResponse.json({ error: 'Phone number or email is required' }, { status: 400 })
    }

    // Validate phone format (Indian mobile: 10 digits)
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 })
    }

    if (purpose === 'register') {
      const existing = getUserByPhone(cleanPhone) || await getUserByPhoneAsync(cleanPhone)
      if (existing) {
        return NextResponse.json({ error: 'This mobile number is already registered' }, { status: 409 })
      }
    }

    // Generate stateless OTP (works on serverless)
    const { otp, otpToken } = generateStatelessOtp(cleanPhone, purpose as 'login' | 'register')

    // Send OTP via real SMS (Fast2SMS)
    const smsResult = await sendOtpSms(cleanPhone, otp)
    
    console.log(`[OTP] ${cleanPhone}: ${otp} (purpose: ${purpose}, sms: ${smsResult.success ? 'sent' : 'fallback'})`)

    const response: Record<string, any> = {
      success: true,
      message: smsResult.success 
        ? 'OTP sent successfully to your mobile number' 
        : 'OTP generated. Check your phone or use the code below.',
      otpToken,
      smsSent: smsResult.success,
    }

    // Include OTP in response only if SMS failed (dev fallback)
    if (!smsResult.success) {
      response.demo_otp = otp
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
