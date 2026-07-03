import { NextRequest, NextResponse } from 'next/server'
import { getRecentlyViewed, getWhoViewedMe, addProfileView, getUserById } from '@/lib/database'
import { sendProfileViewedEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'viewed' | 'visitors'

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    if (type === 'visitors') {
      const visitors = getWhoViewedMe(userId)
      return NextResponse.json({ profiles: visitors })
    } else {
      const viewed = getRecentlyViewed(userId)
      return NextResponse.json({ profiles: viewed })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { viewerId, viewedId } = await req.json()
    if (!viewerId || !viewedId) return NextResponse.json({ error: 'viewerId and viewedId required' }, { status: 400 })
    const view = addProfileView(viewerId, viewedId)

    // Send email notification to the viewed user (async, non-blocking)
    const viewedUser = getUserById(viewedId)
    const viewer = getUserById(viewerId)
    if (viewedUser?.email && viewer) {
      sendProfileViewedEmail(viewedUser.email, {
        userName: viewedUser.name,
        viewerName: viewer.name,
        viewerAge: viewer.age,
        viewerCity: viewer.city,
        viewerOccupation: viewer.occupation,
        viewerPhoto: viewer.photos?.[0],
        viewerId: viewer.id,
      }).catch(err => console.error('[Views] Email notification failed:', err))
    }

    return NextResponse.json({ view })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
