import { NextRequest, NextResponse } from 'next/server'
import { getMessages, getConversations, sendMessage, markMessagesRead, getUserById } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import { notifyNewMessage } from '@/lib/push-notifications'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Ensure user can only access their own messages
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    if (partnerId) {
      // Get messages between two users
      const messages = getMessages(userId, partnerId)
      return NextResponse.json({ messages })
    } else {
      // Get all conversations
      const conversations = getConversations(userId)
      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { senderId, receiverId, content } = await req.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Ensure user can only send messages as themselves
    if (senderId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: cannot send messages as another user' }, { status: 403 })
    }

    // Basic content validation
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const message = sendMessage(senderId, receiverId, content)
    // Send push notification to receiver
    const sender = getUserById(senderId)
    if (sender) notifyNewMessage(receiverId, sender.name).catch(() => {})
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, senderId } = await req.json()
    if (!userId || !senderId) {
      return NextResponse.json({ error: 'userId and senderId required' }, { status: 400 })
    }
    markMessagesRead(userId, senderId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
