import { NextRequest, NextResponse } from 'next/server'

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
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const settings = privacyStore.get(userId) || getDefaults(userId)
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  try {
    const { userId, ...settings } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
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
