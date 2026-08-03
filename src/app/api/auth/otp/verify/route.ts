import { NextRequest, NextResponse } from 'next/server'
import { getUserByPhone, getUserByPhoneAsync, getUserByEmail, getUserByEmailAsync, createUser, updateUser, syncUserToSupabaseAwait } from '@/lib/database'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'
import { verifyStatelessOtp, getOtpStore } from '@/lib/otp-store'

// Rate limit OTP verification attempts (max 5 per identifier per 15 min)
const verifyAttempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const { phone, email, otp, purpose, otpToken, firebaseVerified, firebaseUid } = await req.json()

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 })
    }

    // Determine identifier (email or phone)
    const isEmailOtp = !!email
    const identifier = isEmailOtp ? email.trim().toLowerCase() : phone?.replace(/\D/g, '')

    if (!identifier) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    // Rate limit
    const now = Date.now()
    const entry = verifyAttempts.get(identifier)
    if (entry && now < entry.resetAt) {
      entry.count++
      if (entry.count > 5) {
        return NextResponse.json(
          { error: 'Too many verification attempts. Please request a new OTP.' },
          { status: 429 }
        )
      }
    } else {
      verifyAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 })
    }

    // Firebase-verified: skip OTP check
    if (firebaseVerified && firebaseUid) {
      // Firebase has already verified this phone number
    } else if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    } else if (otpToken) {
      const result = verifyStatelessOtp(identifier, otp, purpose, otpToken)
      if (!result.valid) {
        return NextResponse.json({ error: result.error || 'Invalid OTP' }, { status: 400 })
      }
    } else {
      const otpStore = getOtpStore()
      const storedOtp = otpStore.get(identifier)

      if (!storedOtp) {
        return NextResponse.json({ error: 'OTP expired or not found. Please request a new OTP.' }, { status: 400 })
      }
      if (storedOtp.expiresAt < Date.now()) {
        otpStore.delete(identifier)
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
      }
      if (storedOtp.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
      }
      if (storedOtp.purpose !== purpose) {
        return NextResponse.json({ error: 'OTP was not generated for this purpose' }, { status: 400 })
      }
      otpStore.delete(identifier)
    }

    // For registration: just confirm verification
    if (purpose === 'register') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: isEmailOtp ? 'Email verified successfully' : 'Phone number verified successfully',
      })
    }

    // For login: find user and generate JWT (auto-register if not found)
    if (purpose === 'login') {
      let user
      let isNewUser = false

      if (isEmailOtp) {
        user = getUserByEmail(identifier) || await getUserByEmailAsync(identifier)
        if (!user) {
          isNewUser = true
          user = createUser({
            name: identifier.split('@')[0],
            email: identifier,
            password: '',
            phone: '',
            gender: '',
            dateOfBirth: '',
            age: 0,
            profileComplete: false,
            verified: true,
          })
          await syncUserToSupabaseAwait(user)
        }
      } else {
        user = getUserByPhone(identifier) || await getUserByPhoneAsync(identifier)
        if (!user) {
          isNewUser = true
          user = createUser({
            name: '',
            email: '',
            password: '',
            phone: identifier,
            gender: '',
            dateOfBirth: '',
            age: 0,
            profileComplete: false,
          })
          await syncUserToSupabaseAwait(user)
        }
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
        isNewUser,
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
          religion: user.religion,
          education: user.education,
          occupation: user.occupation,
          city: user.city,
          about: user.about,
          height: user.height,
          partnerPreferences: user.partnerPreferences,
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
