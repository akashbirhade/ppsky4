import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, gender, dateOfBirth, phone, religion, caste, motherTongue, height, education, occupation, income, city, state, about, maritalStatus, diet, hobbies, familyDetails } = body

    if (!name || !email || !password || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'Name, email, password, gender, and date of birth are required' }, { status: 400 })
    }

    // Check if user exists
    const existing = getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Calculate age
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Determine if profile is complete
    const hasFullProfile = !!(religion && city && education && occupation)

    // Create user with all provided fields
    const newUser = createUser({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      gender,
      dateOfBirth,
      age,
      religion: religion || '',
      caste: caste || '',
      motherTongue: motherTongue || '',
      height: height || '',
      education: education || '',
      occupation: occupation || '',
      income: income || '',
      city: city || '',
      state: state || '',
      country: 'India',
      about: about || '',
      maritalStatus: maritalStatus || 'Never Married',
      diet: diet || '',
      hobbies: hobbies || [],
      familyDetails: familyDetails || undefined,
      profileComplete: hasFullProfile,
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        age: newUser.age,
        premium: newUser.premium,
        premiumPlan: newUser.premiumPlan,
        profileComplete: newUser.profileComplete,
        photos: newUser.photos,
        verified: newUser.verified,
      },
      token
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
