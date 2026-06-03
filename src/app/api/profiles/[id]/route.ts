import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserById(params.id)
    
    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Return profile without password
    const { password, ...profile } = user

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
