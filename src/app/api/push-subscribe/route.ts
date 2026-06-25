import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json')

interface PushSubscription {
  userId: string
  subscription: any // Web Push subscription object
  createdAt: string
}

function getSubscriptions(): PushSubscription[] {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveSubscriptions(subs: PushSubscription[]) {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2))
  } catch (e) {
    console.error('Failed to save push subscriptions:', e)
  }
}

// Register push subscription
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { subscription } = await req.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Valid push subscription required' }, { status: 400 })
    }

    const userId = authResult.user.userId
    const subs = getSubscriptions()

    // Remove old subscription for this user (if exists)
    const filtered = subs.filter(s => s.userId !== userId)

    filtered.push({
      userId,
      subscription,
      createdAt: new Date().toISOString(),
    })

    saveSubscriptions(filtered)

    return NextResponse.json({
      success: true,
      message: 'Push notifications enabled successfully',
    })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Unsubscribe from push
export async function DELETE(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const userId = authResult.user.userId
    const subs = getSubscriptions()
    const filtered = subs.filter(s => s.userId !== userId)
    saveSubscriptions(filtered)

    return NextResponse.json({
      success: true,
      message: 'Push notifications disabled',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
