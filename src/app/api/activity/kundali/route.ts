import { NextRequest, NextResponse } from 'next/server'
import { getKundaliScore } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const profileId = searchParams.get('profileId')

    if (!userId || !profileId) return NextResponse.json({ error: 'userId and profileId required' }, { status: 400 })

    const kundali = getKundaliScore(userId, profileId)
    return NextResponse.json({ kundali })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
