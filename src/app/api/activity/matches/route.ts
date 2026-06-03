import { NextRequest, NextResponse } from 'next/server'
import { getNearbyProfiles, getDailyRecommendations, getActivityCounts } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'nearby' | 'daily' | 'counts'

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    if (type === 'nearby') {
      const profiles = getNearbyProfiles(userId)
      const safe = profiles.map(({ password, ...rest }) => rest)
      return NextResponse.json({ profiles: safe })
    } else if (type === 'daily') {
      const profiles = getDailyRecommendations(userId)
      const safe = profiles.map(({ password, ...rest }) => rest)
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
