import { NextRequest, NextResponse } from 'next/server'
import { viewContact, initiateCall, updateCallStatus, getCallHistory } from '@/lib/database'

export const dynamic = 'force-dynamic'

// POST - View contact or initiate call (premium only)
export async function POST(req: NextRequest) {
  try {
    const { action, userId, targetId, callType, callId, status, duration } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    switch (action) {
      case 'view_contact': {
        if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 })
        const result = viewContact(userId, targetId)
        if (!result.success) {
          return NextResponse.json({ error: result.message, requiresPremium: true }, { status: 403 })
        }
        return NextResponse.json(result)
      }

      case 'call': {
        if (!targetId || !callType) return NextResponse.json({ error: 'targetId and callType required' }, { status: 400 })
        const result = initiateCall(userId, targetId, callType)
        if (!result.success) {
          return NextResponse.json({ error: result.message, requiresPremium: true }, { status: 403 })
        }
        return NextResponse.json(result)
      }

      case 'update_call': {
        if (!callId || !status) return NextResponse.json({ error: 'callId and status required' }, { status: 400 })
        const call = updateCallStatus(callId, status, duration)
        if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 })
        return NextResponse.json({ success: true, call })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Premium feature error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Call history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const history = getCallHistory(userId)
  return NextResponse.json({ calls: history })
}
