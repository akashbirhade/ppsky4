import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserById(params.id)
    
    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if the viewer is the profile owner or another user
    const token = extractTokenFromRequest(req)
    const viewer = token ? verifyToken(token) : null
    const isOwner = viewer?.userId === params.id

    // Return profile without password
    const { password, ...profile } = user as any

    // If viewing someone else's profile and they have photo privacy enabled
    if (!isOwner && profile.photoPrivacy === 'blur') {
      // Check if there's mutual interest
      const viewerUser = viewer ? getUserById(viewer.userId) as any : null
      const hasMutualInterest = viewerUser?.likedUsers?.includes(params.id) &&
        (user as any).likedUsers?.includes(viewer?.userId)
      
      if (!hasMutualInterest) {
        profile.photosBlurred = true
        // Keep only first photo (blurred indicator for frontend)
        profile.photos = profile.photos?.slice(0, 1) || []
      }
    }

    // Hide blocked users' profiles
    if (!isOwner && (user as any).blockedUsers?.includes(viewer?.userId)) {
      return NextResponse.json({ error: 'Profile not available' }, { status: 403 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
