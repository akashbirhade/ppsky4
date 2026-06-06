import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// In-memory privacy settings
interface PrivacySettings {
  userId: string
  hideProfile: boolean
  hidePhotos: boolean
  hideIncome: boolean
  hidePhone: boolean
  showOnlyVerified: boolean
  whoCanContact: 'everyone' | 'premium' | 'none'
}

const privacyStore: Map<string, PrivacySettings> = new Map()

function getDefaults(userId: string): PrivacySettings {
  return {
    userId,
    hideProfile: false,
    hidePhotos: false,
    hideIncome: false,
    hidePhone: true,
    showOnlyVerified: false,
    whoCanContact: 'everyone'
  }
}

export async function GET(req: NextRequest) {
  // Verify JWT token
  const authResult = authenticateRequest(req)
  if ('error' in authResult) return authResult.error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Ensure user can only access their own privacy settings
  if (userId !== authResult.user.userId) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
  }

  const settings = privacyStore.get(userId) || getDefaults(userId)
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { userId, ...settings } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Ensure user can only modify their own settings
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    const current = privacyStore.get(userId) || getDefaults(userId)
    const updated = { ...current, ...settings, userId }
    privacyStore.set(userId, updated)

    return NextResponse.json({ success: true, settings: updated })
  } catch (error) {
    console.error('Privacy API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
