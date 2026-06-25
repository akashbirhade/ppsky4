import { NextRequest, NextResponse } from 'next/server'
import { getUserById, searchProfiles } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import { getTopMatches, getDailyMatches } from '@/lib/matching-algorithm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'top' // 'top' | 'daily'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const user = getUserById(authResult.user.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all potential candidates (opposite gender)
    const targetGender = user.gender === 'Male' ? 'Female' : 'Male'
    const candidates = searchProfiles({ gender: targetGender }, user.id)

    let matches
    if (type === 'daily') {
      matches = getDailyMatches(user, candidates)
    } else {
      matches = getTopMatches(user, candidates, limit)
    }

    // Attach profile data to matches
    const matchesWithProfiles = matches.map(match => {
      const profile = getUserById(match.userId)
      if (!profile) return null
      const { password, ...safeProfile } = profile
      return {
        ...match,
        profile: safeProfile,
      }
    }).filter(Boolean)

    return NextResponse.json({
      matches: matchesWithProfiles,
      total: matchesWithProfiles.length,
      type,
    })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
