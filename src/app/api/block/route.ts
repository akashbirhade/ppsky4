import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

// Block a user
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { blockedUserId } = await req.json()

    if (!blockedUserId) {
      return NextResponse.json({ error: 'blockedUserId is required' }, { status: 400 })
    }

    const userId = authResult.user.userId

    if (userId === blockedUserId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    const user = getUserById(userId) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if target user exists
    const targetUser = getUserById(blockedUserId)
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Add to blocked list
    const blockedUsers: string[] = user.blockedUsers || []
    if (blockedUsers.includes(blockedUserId)) {
      return NextResponse.json({ error: 'User already blocked' }, { status: 409 })
    }

    blockedUsers.push(blockedUserId)
    updateUser(userId, { blockedUsers } as any)

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully. They can no longer contact you or see your profile.',
    })
  } catch (error) {
    console.error('Block error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Unblock a user
export async function DELETE(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { searchParams } = new URL(req.url)
    const blockedUserId = searchParams.get('userId')

    if (!blockedUserId) {
      return NextResponse.json({ error: 'userId query param is required' }, { status: 400 })
    }

    const userId = authResult.user.userId
    const user = getUserById(userId) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const blockedUsers: string[] = user.blockedUsers || []
    const updated = blockedUsers.filter(id => id !== blockedUserId)
    updateUser(userId, { blockedUsers: updated } as any)

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully.',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get blocked users list
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const user = getUserById(authResult.user.userId) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const blockedUsers: string[] = user.blockedUsers || []
    const blockedProfiles = blockedUsers.map(id => {
      const profile = getUserById(id)
      if (!profile) return null
      return { id: profile.id, name: profile.name, photos: profile.photos }
    }).filter(Boolean)

    return NextResponse.json({ blockedUsers: blockedProfiles })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
