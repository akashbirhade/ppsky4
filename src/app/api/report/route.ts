import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.json')

interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  createdAt: string
}

function getReports(): Report[] {
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveReports(reports: Report[]) {
  try {
    const dir = path.dirname(REPORTS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2))
  } catch (e) {
    console.error('Failed to save reports:', e)
  }
}

// Submit a report
export async function POST(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const { reportedUserId, reason, description } = await req.json()

    if (!reportedUserId || !reason) {
      return NextResponse.json({ error: 'reportedUserId and reason are required' }, { status: 400 })
    }

    const validReasons = [
      'fake_profile',
      'inappropriate_photos',
      'harassment',
      'spam',
      'underage',
      'married_pretending_single',
      'scam',
      'other'
    ]

    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid report reason' }, { status: 400 })
    }

    const userId = authResult.user.userId

    if (userId === reportedUserId) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })
    }

    // Verify reported user exists
    const reportedUser = getUserById(reportedUserId)
    if (!reportedUser) {
      return NextResponse.json({ error: 'Reported user not found' }, { status: 404 })
    }

    // Check for duplicate report
    const reports = getReports()
    const existingReport = reports.find(
      r => r.reporterId === userId && r.reportedUserId === reportedUserId && r.status === 'pending'
    )
    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this user. Our team is reviewing it.' }, { status: 409 })
    }

    const report: Report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      reporterId: userId,
      reportedUserId,
      reason,
      description: description?.substring(0, 500) || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    reports.push(report)
    saveReports(reports)

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully. Our team will review it within 24 hours.',
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
