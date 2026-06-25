import { NextRequest, NextResponse } from 'next/server'
import { getNearbyProfiles, getDailyRecommendations, getActivityCounts, getUserById } from '@/lib/database'
import { calculateMatchScore } from '@/lib/matching-algorithm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'nearby' | 'daily' | 'counts'

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const currentUser = getUserById(userId)

    if (type === 'nearby') {
      const profiles = getNearbyProfiles(userId)
      const safe = profiles.map(({ password, ...rest }) => {
        const matchInfo = currentUser ? calculateMatchScore(currentUser, { ...rest, password: '' }) : null
        return { ...rest, matchScore: matchInfo?.score, matchHighlights: matchInfo?.highlights }
      })
      return NextResponse.json({ profiles: safe })
    } else if (type === 'daily') {
      const profiles = getDailyRecommendations(userId)
      const safe = profiles.map(({ password, ...rest }) => {
        const matchInfo = currentUser ? calculateMatchScore(currentUser, { ...rest, password: '' }) : null
        return { ...rest, matchScore: matchInfo?.score, matchHighlights: matchInfo?.highlights }
      })
      return NextResponse.json({ profiles: safe })
    } else if (type === 'counts') {
      const counts = getActivityCounts(userId)
      return NextResponse.json({ counts })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
