import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getUserByEmailAsync, syncUserToSupabaseAwait } from '@/lib/database'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-verification'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, gender, dateOfBirth, phone, religion, caste, motherTongue, height, education, occupation, income, city, state, about, maritalStatus, diet, hobbies, familyDetails } = body

    if (!name || !email || !password || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'Name, email, password, gender, and date of birth are required' }, { status: 400 })
    }

    // Register on Express backend first (shared with mobile app)
    try {
      const [firstName, ...rest] = (name || '').split(' ')
      const lastName = rest.join(' ') || firstName
      const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          gender: gender === 'Male' ? 'MALE' : gender === 'Female' ? 'FEMALE' : gender.toUpperCase(),
          mobileNumber: phone?.replace(/\D/g, '').slice(-10) || '9000000000',
          dateOfBirth: dateOfBirth,
        }),
      })
      if (backendRes.ok) {
        const backendData = await backendRes.json()
        const bu = backendData.data?.user
        if (bu) {
          // Also create in local DB for web app features
          const hashedPassword = await bcrypt.hash(password, 10)
          try {
            createUser({
              name, email, password: hashedPassword, phone: phone || '',
              gender, dateOfBirth, age: bu.profile?.age || 0,
              religion: religion || '', caste: caste || '', motherTongue: motherTongue || '',
              height: height || '', education: education || '', occupation: occupation || '',
              income: income || '', city: city || '', state: state || '', country: 'India',
              about: about || '', maritalStatus: maritalStatus || 'Never Married',
              diet: diet || '', hobbies: hobbies || [], familyDetails: familyDetails || undefined,
              profileComplete: !!(religion && city && education && occupation),
            })
          } catch {}

          return NextResponse.json({
            user: {
              id: bu.id,
              name: name,
              email: bu.email,
              phone: phone || '',
              gender: gender,
              age: bu.profile?.age || 0,
              premium: false,
              premiumPlan: null,
              profileComplete: !!(religion && city && education && occupation),
              photos: [],
              verified: false,
              religion: religion || '',
              education: education || '',
              occupation: occupation || '',
              city: city || '',
              about: about || '',
              height: height || '',
              partnerPreferences: null,
            },
            token: backendData.data.accessToken
          }, { status: 201 })
        }
      } else {
        const errData = await backendRes.json().catch(() => ({}))
        if (backendRes.status === 409) {
          return NextResponse.json({ error: errData.message || 'Email already registered' }, { status: 409 })
        }
      }
    } catch {
      // Backend unavailable, fall through to local-only registration
    }

    // Fallback: local-only registration
    const existing = getUserByEmail(email) || await getUserByEmailAsync(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    if (age < 18) {
      return NextResponse.json({ error: 'Must be 18 or older' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const hasFullProfile = !!(religion && city && education && occupation)

    const newUser = createUser({
      name, email, password: hashedPassword, phone: phone || '',
      gender, dateOfBirth, age,
      religion: religion || '', caste: caste || '', motherTongue: motherTongue || '',
      height: height || '', education: education || '', occupation: occupation || '',
      income: income || '', city: city || '', state: state || '', country: 'India',
      about: about || '', maritalStatus: maritalStatus || 'Never Married',
      diet: diet || '', hobbies: hobbies || [], familyDetails: familyDetails || undefined,
      profileComplete: hasFullProfile,
    })

    await syncUserToSupabaseAwait(newUser)

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const verifyToken = generateVerificationToken(newUser.id, newUser.email)
    sendVerificationEmail(newUser.email, verifyToken).catch(e => console.error('sendVerificationEmail failed:', e.message))

    return NextResponse.json({
      user: {
        id: newUser.id, name: newUser.name, email: newUser.email,
        phone: newUser.phone, gender: newUser.gender, age: newUser.age,
        premium: newUser.premium, premiumPlan: newUser.premiumPlan,
        profileComplete: newUser.profileComplete, photos: newUser.photos,
        verified: newUser.verified, religion: newUser.religion,
        education: newUser.education, occupation: newUser.occupation,
        city: newUser.city, about: newUser.about, height: newUser.height,
        partnerPreferences: newUser.partnerPreferences,
      },
      token
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
