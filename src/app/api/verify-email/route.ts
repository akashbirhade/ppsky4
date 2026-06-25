import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email-verification'

export const dynamic = 'force-dynamic'

/**
 * GET /api/verify-email?token=xxx
 * Verifies a user's email address
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
  }

  const result = verifyEmailToken(token)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Your profile is now verified.',
      email: result.email,
    })
  }

  return NextResponse.json({ error: result.error }, { status: 400 })
}
