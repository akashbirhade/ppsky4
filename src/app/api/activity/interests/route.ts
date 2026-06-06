import { NextRequest, NextResponse } from 'next/server'
import { sendInterest, getInterestsSent, getInterestsReceived, respondToInterest, getMutualMatches, getUserById } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'sent' | 'received' | 'mutual'

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Ensure user can only access their own data
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

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
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { senderId, receiverId, interestId, action } = await req.json()
    
    if (interestId && action) {
      const result = respondToInterest(interestId, action)
      return NextResponse.json({ interest: result })
    }

    if (!senderId || !receiverId) return NextResponse.json({ error: 'senderId and receiverId required' }, { status: 400 })
    const interest = sendInterest(senderId, receiverId)
    const senderProfile = getUserById(senderId)
    const receiverProfile = getUserById(receiverId)
    
    return NextResponse.json({ 
      interest,
      success: true,
      message: `Interest sent to ${receiverProfile?.name}!`,
      sender: senderProfile ? { id: senderProfile.id, name: senderProfile.name, age: senderProfile.age, city: senderProfile.city } : null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
