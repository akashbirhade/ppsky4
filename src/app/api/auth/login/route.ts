import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, getUserByEmailAsync, updateUser } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Try Express backend first (shared with mobile app)
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (backendRes.ok) {
        const backendData = await backendRes.json()
        const bu = backendData.data?.user
        if (bu) {
          // Map backend response to web app format
          const profileName = bu.profile ? `${bu.profile.firstName} ${bu.profile.lastName || ''}`.trim() : null
          return NextResponse.json({
            user: {
              id: bu.id,
              name: profileName || bu.username || bu.email?.split('@')[0] || 'User',
              email: bu.email,
              phone: bu.mobileNumber || '',
              gender: bu.gender === 'MALE' ? 'Male' : bu.gender === 'FEMALE' ? 'Female' : bu.gender,
              age: bu.profile?.age || 0,
              premium: bu.subscription?.plan !== 'FREE' && bu.subscription?.isActive,
              premiumPlan: bu.subscription?.plan?.toLowerCase() || null,
              premiumExpiry: null,
              profileComplete: !!(bu.profile?.city && bu.profile?.religion),
              photos: bu.photos?.map((p: any) => p.url) || [],
              verified: bu.profile?.isVerified || false,
              religion: bu.profile?.religion || '',
              education: bu.profile?.education || '',
              occupation: bu.profile?.profession || '',
              city: bu.profile?.city || '',
              about: bu.profile?.bio || '',
              height: bu.profile?.height ? String(bu.profile.height) : '',
              partnerPreferences: null,
            },
            token: backendData.data.accessToken
          })
        }
      }
    } catch {
      // Backend unavailable, fall through to local DB
    }

    // Fallback: try local JSON database
    const user = getUserByEmail(email) || await getUserByEmailAsync(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    let validPassword = false
    try {
      validPassword = await bcrypt.compare(password, user.password)
    } catch {
      validPassword = false
    }

    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last active and online status
    updateUser(user.id, { lastActive: new Date().toISOString(), online: true })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
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
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
