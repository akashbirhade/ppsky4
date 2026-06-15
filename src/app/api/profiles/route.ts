import { NextRequest, NextResponse } from 'next/server'
import { searchProfiles, updateUser, getUserById } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gender = searchParams.get('gender') || undefined
    const ageMin = searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : undefined
    const ageMax = searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : undefined
    const religion = searchParams.get('religion') || undefined
    const city = searchParams.get('city') || undefined
    const education = searchParams.get('education') || undefined
    const excludeId = searchParams.get('excludeId') || undefined

    const profiles = searchProfiles(
      { gender, ageMin, ageMax, religion, city, education },
      excludeId
    )

    // Remove sensitive data but include photos and new fields
    const safeProfiles = profiles.map(({ password, ...rest }) => rest)

    return NextResponse.json({ profiles: safeProfiles })
  } catch (error) {
    console.error('Profile search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const existing = getUserById(userId)
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update data
    const updateData: any = { ...profileData }
    const existingPartnerPreferences = existing.partnerPreferences || {
      ageMin: 22,
      ageMax: 35,
      heightMin: "5'0\"",
      heightMax: "6'5\"",
      religion: 'Any',
      education: 'Any',
      occupation: 'Any',
      city: 'Any',
    }
    
    // If core fields are provided, mark profile as complete
    if (profileData.religion && profileData.city && profileData.education && profileData.occupation) {
      updateData.profileComplete = true
    }

    // Handle partner preferences if provided
    if (profileData.partnerAgeMin || profileData.partnerAgeMax || profileData.partnerReligion || profileData.partnerEducation || profileData.partnerCity) {
      const parsedAgeMin = Number.parseInt(String(profileData.partnerAgeMin), 10)
      const parsedAgeMax = Number.parseInt(String(profileData.partnerAgeMax), 10)
      updateData.partnerPreferences = {
        ...existingPartnerPreferences,
        ageMin: Number.isFinite(parsedAgeMin) ? parsedAgeMin : existingPartnerPreferences.ageMin,
        ageMax: Number.isFinite(parsedAgeMax) ? parsedAgeMax : existingPartnerPreferences.ageMax,
        heightMin: profileData.partnerHeightMin || existingPartnerPreferences.heightMin,
        heightMax: profileData.partnerHeightMax || existingPartnerPreferences.heightMax,
        religion: profileData.partnerReligion || existingPartnerPreferences.religion,
        education: profileData.partnerEducation || existingPartnerPreferences.education,
        occupation: profileData.partnerOccupation || existingPartnerPreferences.occupation,
        city: profileData.partnerCity || existingPartnerPreferences.city,
      }
      // Remove flat partner preference fields
      delete updateData.partnerAgeMin
      delete updateData.partnerAgeMax
      delete updateData.partnerHeightMin
      delete updateData.partnerHeightMax
      delete updateData.partnerReligion
      delete updateData.partnerEducation
      delete updateData.partnerOccupation
      delete updateData.partnerCity
    }

    const updated = updateUser(userId, updateData)

    if (!updated) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    const { password: _, ...safeUser } = updated
    return NextResponse.json({ profile: safeUser, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
