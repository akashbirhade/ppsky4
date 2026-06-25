import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { getReports, createReport, updateReportStatus } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined

  const reports = getReports(status)
  return NextResponse.json({ reports, total: reports.length })
}

export async function POST(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { reportedUserId, reportedByUserId, reason, description } = await req.json()
  if (!reportedUserId || !reason) {
    return NextResponse.json({ error: 'reportedUserId and reason required' }, { status: 400 })
  }

  const report = createReport(reportedUserId, reportedByUserId || 'admin', reason, description || '')
  return NextResponse.json({ report }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { reportId, status, adminNote } = await req.json()
  if (!reportId || !status) {
    return NextResponse.json({ error: 'reportId and status required' }, { status: 400 })
  }

  const report = updateReportStatus(reportId, status, adminNote, (admin as any).email)
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  return NextResponse.json({ report })
}
