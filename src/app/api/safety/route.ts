import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// In-memory storage for blocks and reports
interface BlockEntry { blockerId: string; blockedId: string; timestamp: string }
interface ReportEntry { reporterId: string; reportedId: string; reason: string; details: string; timestamp: string; status: string }

const blocks: BlockEntry[] = []
const reports: ReportEntry[] = []

export async function POST(req: NextRequest) {
  try {
    const { action, userId, targetId, reason, details } = await req.json()

    if (!userId || !targetId) {
      return NextResponse.json({ error: 'userId and targetId required' }, { status: 400 })
    }

    if (action === 'block') {
      const exists = blocks.find(b => b.blockerId === userId && b.blockedId === targetId)
      if (!exists) {
        blocks.push({ blockerId: userId, blockedId: targetId, timestamp: new Date().toISOString() })
      }
      return NextResponse.json({ success: true, message: 'User blocked successfully' })
    }

    if (action === 'unblock') {
      const idx = blocks.findIndex(b => b.blockerId === userId && b.blockedId === targetId)
      if (idx !== -1) blocks.splice(idx, 1)
      return NextResponse.json({ success: true, message: 'User unblocked' })
    }

    if (action === 'report') {
      if (!reason) {
        return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
      }
      reports.push({
        reporterId: userId,
        reportedId: targetId,
        reason,
        details: details || '',
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
      return NextResponse.json({ success: true, message: 'Report submitted. Our team will review it within 24 hours.' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Safety API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const targetId = searchParams.get('targetId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Check if user is blocked
  if (targetId) {
    const isBlocked = blocks.some(b => b.blockerId === userId && b.blockedId === targetId)
    return NextResponse.json({ isBlocked })
  }

  // Get all blocked users
  const blockedUsers = blocks.filter(b => b.blockerId === userId).map(b => b.blockedId)
  return NextResponse.json({ blockedUsers })
}
