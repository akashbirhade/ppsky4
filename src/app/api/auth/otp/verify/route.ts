import { NextRequest, NextResponse } from 'next/server'
import { getUserByPhone, updateUser } from '@/lib/database'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'
import { getOtpStore } from '@/lib/otp-store'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, purpose } = await req.json()

    if (!phone || !otp || !purpose) {
      return NextResponse.json({ error: 'Phone, OTP, and purpose are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const otpStore = getOtpStore()
    const storedOtp = otpStore.get(cleanPhone)

    if (!storedOtp) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new OTP.' }, { status: 400 })
    }

    if (storedOtp.expiresAt < Date.now()) {
      otpStore.delete(cleanPhone)
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    if (storedOtp.purpose !== purpose) {
      return NextResponse.json({ error: 'OTP was not generated for this purpose' }, { status: 400 })
    }

    // OTP verified - remove from store
    otpStore.delete(cleanPhone)

    // For registration: just confirm verification
    if (purpose === 'register') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Phone number verified successfully',
      })
    }

    // For login: find user and generate JWT
    if (purpose === 'login') {
      const user = getUserByPhone(cleanPhone)
      if (!user) {
        return NextResponse.json({ error: 'No account found with this phone number' }, { status: 404 })
      }

      // Update last active
      updateUser(user.id, { lastActive: new Date().toISOString(), online: true })

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        success: true,
        verified: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          age: user.age,
          premium: user.premium,
          premiumPlan: user.premiumPlan,
          premiumExpiry: user.premiumExpiry,
          profileComplete: user.profileComplete,
          photos: user.photos,
          verified: user.verified,
        },
        token,
      })
    }

    return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
