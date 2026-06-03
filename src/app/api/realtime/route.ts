import { NextRequest } from 'next/server'
import { getUserById } from '@/lib/database'

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

// Simulates real-time events (in production, poll database for changes)
function generateRealTimeEvents(userId: string): any[] {
  const events: any[] = []
  
  // Random chance of generating an event (simulates real activity)
  if (Math.random() > 0.7) {
    const eventTypes = [
      { type: 'profile_view', message: 'Someone viewed your profile' },
      { type: 'online_status', message: 'A match is now online' },
      { type: 'new_recommendation', message: 'New match recommendation available' },
    ]
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    events.push({
      ...event,
      timestamp: new Date().toISOString(),
      userId
    })
  }
  
  return events
}
