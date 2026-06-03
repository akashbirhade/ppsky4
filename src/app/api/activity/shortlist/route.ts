import { NextRequest, NextResponse } from 'next/server'
import { addToShortlist, removeFromShortlist, getShortlist, isShortlisted } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const profileId = searchParams.get('profileId')

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    if (profileId) {
      return NextResponse.json({ shortlisted: isShortlisted(userId, profileId) })
    }
    return NextResponse.json({ profiles: getShortlist(userId) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, profileId, action } = await req.json()
    if (!userId || !profileId) return NextResponse.json({ error: 'userId and profileId required' }, { status: 400 })

    if (action === 'remove') {
      removeFromShortlist(userId, profileId)
      return NextResponse.json({ success: true, shortlisted: false })
    }
    
    addToShortlist(userId, profileId)
    return NextResponse.json({ success: true, shortlisted: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
