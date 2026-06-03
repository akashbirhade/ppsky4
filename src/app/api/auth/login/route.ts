import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, updateUser } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'soulmatesync-secret-key-2024'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = getUserByEmail(email)
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
      { expiresIn: '30d' }
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
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
