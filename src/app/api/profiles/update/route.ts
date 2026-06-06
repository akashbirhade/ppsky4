import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const body = await req.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Ensure user can only update their own profile
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: cannot modify another user profile' }, { status: 403 })
    }

    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update profile fields
    if (profileData.about) user.about = profileData.about
    if (profileData.religion) user.religion = profileData.religion
    if (profileData.caste) user.caste = profileData.caste
    if (profileData.motherTongue) user.motherTongue = profileData.motherTongue
    if (profileData.height) user.height = profileData.height
    if (profileData.education) user.education = profileData.education
    if (profileData.occupation) user.occupation = profileData.occupation
    if (profileData.income) user.income = profileData.income
    if (profileData.city) user.city = profileData.city
    if (profileData.state) user.state = profileData.state
    if (profileData.photoUrl) user.photos = [profileData.photoUrl]

    // Update partner preferences
    if (profileData.prefAgeMin || profileData.prefAgeMax || profileData.prefReligion || profileData.prefEducation || profileData.prefCity) {
      user.partnerPreferences = {
        ...user.partnerPreferences,
        ageMin: parseInt(profileData.prefAgeMin) || user.partnerPreferences.ageMin,
        ageMax: parseInt(profileData.prefAgeMax) || user.partnerPreferences.ageMax,
        religion: profileData.prefReligion || user.partnerPreferences.religion,
        education: profileData.prefEducation || user.partnerPreferences.education,
        city: profileData.prefCity || user.partnerPreferences.city,
      }
    }

    // Check profile completeness
    const requiredFields = [user.religion, user.education, user.occupation, user.city, user.about]
    user.profileComplete = requiredFields.every(f => f && f.trim() !== '')

    return NextResponse.json({ success: true, profileComplete: user.profileComplete })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
