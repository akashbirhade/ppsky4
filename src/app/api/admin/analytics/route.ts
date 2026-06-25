import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { getAdminAnalytics } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const analytics = getAdminAnalytics()
  return NextResponse.json(analytics)
}
