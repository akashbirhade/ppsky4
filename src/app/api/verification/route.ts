import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getUserById, updateUser } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

// Submit verification document
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const formData = await req.formData()
    const document = formData.get('document') as File
    const documentType = formData.get('documentType') as string // 'aadhaar' | 'pan' | 'passport' | 'driving_license'

    if (!document) {
      return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    const validTypes = ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(document.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and PDF are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (document.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const userId = authResult.user.userId
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Save document securely (not in public folder)
    const verificationDir = path.join(process.cwd(), 'data', 'verifications')
    if (!existsSync(verificationDir)) {
      await mkdir(verificationDir, { recursive: true })
    }

    const ext = document.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    const filename = `${userId}_${documentType}_${Date.now()}.${ext}`
    const filepath = path.join(verificationDir, filename)

    const bytes = await document.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Update user verification status
    updateUser(userId, {
      verificationStatus: 'pending',
      verificationDocument: filename,
      verificationDocumentType: documentType,
      verificationSubmittedAt: new Date().toISOString(),
    } as any)

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'Verification document submitted successfully. You will be verified within 24-48 hours.',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 })
  }
}

// Get verification status
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const user = getUserById(authResult.user.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      verified: user.verified || false,
      verificationStatus: (user as any).verificationStatus || 'not_submitted',
      submittedAt: (user as any).verificationSubmittedAt || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
