import { NextRequest } from 'next/server'
import { getUserById, getInterestsReceived, getWhoViewedMe } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Server-Sent Events endpoint for real-time notifications
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new Response('userId required', { status: 400 })
  }

  const user = getUserById(userId)
  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId, timestamp: new Date().toISOString() })}\n\n`))
      
      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Simulate real-time events (in production, use Redis pub/sub or similar)
      const eventInterval = setInterval(() => {
        try {
          // Check for new activities for this user
          const events = generateRealTimeEvents(userId)
          if (events.length > 0) {
            events.forEach(event => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
            })
          }
        } catch {
          clearInterval(eventInterval)
        }
      }, 10000)

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clearInterval(eventInterval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// Poll real activity data instead of generating fake events
function generateRealTimeEvents(userId: string): any[] {
  const events: any[] = []
  const now = Date.now()
  const oneMinuteAgo = new Date(now - 60_000).toISOString()
  
  // Check for recent profile views (last 60 seconds)
  try {
    const viewers = getWhoViewedMe(userId)
    const recentViews = viewers.filter(v => v.timestamp > oneMinuteAgo)
    recentViews.forEach(v => {
      events.push({
        type: 'profile_view',
        message: `${v.profile?.name || 'Someone'} viewed your profile`,
        timestamp: v.timestamp,
        userId,
        fromUserId: v.profile?.id,
      })
    })
  } catch {}
  
  // Check for recent interests received (last 60 seconds)
  try {
    const interests = getInterestsReceived(userId)
    const recentInterests = interests.filter(i => i.interest.timestamp > oneMinuteAgo && i.interest.status === 'pending')
    recentInterests.forEach(i => {
      events.push({
        type: 'interest_received',
        message: `${i.profile?.name || 'Someone'} sent you an interest!`,
        timestamp: i.interest.timestamp,
        userId,
        fromUserId: i.profile?.id,
      })
    })
  } catch {}
  
  return events
}
