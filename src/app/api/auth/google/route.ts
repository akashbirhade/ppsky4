import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, updateUser } from '@/lib/database'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

/**
 * Verify Google ID token by calling Google's tokeninfo endpoint
 */
async function verifyGoogleToken(idToken: string) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  if (!res.ok) return null
  const payload = await res.json()

  // Verify audience matches our client ID
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
    return null
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
    emailVerified: payload.email_verified === 'true',
    sub: payload.sub,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json()

    if (!credential) {
      return NextResponse.json({ error: 'Google credential is required' }, { status: 400 })
    }

    // Verify the Google ID token
    const googleUser = await verifyGoogleToken(credential)
    if (!googleUser) {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 })
    }

    if (!googleUser.email) {
      return NextResponse.json({ error: 'Google account must have an email' }, { status: 400 })
    }

    // Check if user already exists
    let user = getUserByEmail(googleUser.email)
    let isNewUser = false

    if (!user) {
      // Create new user from Google profile
      isNewUser = true
      user = createUser({
        name: googleUser.name,
        email: googleUser.email,
        password: '', // No password for Google-auth users
        gender: '',
        dateOfBirth: '',
        phone: '',
        photos: googleUser.picture ? [googleUser.picture] : [],
        verified: googleUser.emailVerified,
        profileComplete: false,
        authProvider: 'google',
        googleId: googleUser.sub,
      })
    } else {
      // Update existing user's Google connection
      updateUser(user.id, {
        lastActive: new Date().toISOString(),
        online: true,
        verified: true,
        ...(googleUser.picture && !user.photos?.length ? { photos: [googleUser.picture] } : {}),
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        age: user.age || 0,
        premium: user.premium || false,
        premiumPlan: user.premiumPlan || null,
        premiumExpiry: user.premiumExpiry || null,
        profileComplete: user.profileComplete || false,
        photos: user.photos || [],
        verified: true,
      },
      token,
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 })
  }
}
