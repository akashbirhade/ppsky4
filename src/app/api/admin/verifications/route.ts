import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { getVerificationRequests, reviewVerification } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined

  const requests = getVerificationRequests(status)
  return NextResponse.json({ verifications: requests, total: requests.length })
}

export async function PATCH(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { verificationId, approved, rejectionReason } = await req.json()
  if (!verificationId || approved === undefined) {
    return NextResponse.json({ error: 'verificationId and approved (boolean) required' }, { status: 400 })
  }

  const result = reviewVerification(verificationId, approved, (admin as any).email, rejectionReason)
  if (!result) return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
  return NextResponse.json({ verification: result })
}
