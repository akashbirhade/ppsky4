import { NextRequest, NextResponse } from 'next/server'
import { sendInterest, getInterestsSent, getInterestsReceived, respondToInterest, getMutualMatches } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'sent' | 'received' | 'mutual'

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    if (type === 'sent') {
      return NextResponse.json({ interests: getInterestsSent(userId) })
    } else if (type === 'mutual') {
      return NextResponse.json({ profiles: getMutualMatches(userId) })
    } else {
      return NextResponse.json({ interests: getInterestsReceived(userId) })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, interestId, action } = await req.json()
    
    if (interestId && action) {
      const result = respondToInterest(interestId, action)
      return NextResponse.json({ interest: result })
    }

    if (!senderId || !receiverId) return NextResponse.json({ error: 'senderId and receiverId required' }, { status: 400 })
    const interest = sendInterest(senderId, receiverId)
    return NextResponse.json({ interest })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
