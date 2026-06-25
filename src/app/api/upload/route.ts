import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { updateUser, getUserById } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import { uploadProfilePhoto } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('photo') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 })
    }

    // Ensure user can only upload for themselves
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: cannot upload for another user' }, { status: 403 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let photoUrl: string

    // Try Cloudinary first, fall back to local storage
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await uploadProfilePhoto(buffer, userId)
        photoUrl = result.url
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, using local:', cloudErr)
        // Fallback to local
        photoUrl = await saveLocally(buffer, userId, file.name)
      }
    } else {
      photoUrl = await saveLocally(buffer, userId, file.name)
    }

    // Update user photos
    const photos = [...(user.photos || []), photoUrl]
    updateUser(userId, { photos })

    return NextResponse.json({ 
      success: true, 
      photoUrl,
      photos,
      message: 'Photo uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

async function saveLocally(buffer: Buffer, userId: string, originalName: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  const ext = originalName.split('.').pop() || 'jpg'
  const filename = `${userId}_${Date.now()}.${ext}`
  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)
  return `/uploads/${filename}`
}
