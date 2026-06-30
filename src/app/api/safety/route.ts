import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Persisted storage for blocks and reports (JSON files in data/)
interface BlockEntry { blockerId: string; blockedId: string; timestamp: string }
interface ReportEntry { reporterId: string; reportedId: string; reason: string; details: string; timestamp: string; status: string }

const DATA_DIR = path.join(process.cwd(), 'data')
const BLOCKS_FILE = path.join(DATA_DIR, 'safety-blocks.json')
const SAFETY_REPORTS_FILE = path.join(DATA_DIR, 'safety-reports.json')

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) } catch {}
}

function readBlocks(): BlockEntry[] {
  try { if (fs.existsSync(BLOCKS_FILE)) return JSON.parse(fs.readFileSync(BLOCKS_FILE, 'utf-8')) } catch {}
  return []
}

function writeBlocks(data: BlockEntry[]) {
  try { ensureDataDir(); fs.writeFileSync(BLOCKS_FILE, JSON.stringify(data, null, 2)) } catch {}
}

function readSafetyReports(): ReportEntry[] {
  try { if (fs.existsSync(SAFETY_REPORTS_FILE)) return JSON.parse(fs.readFileSync(SAFETY_REPORTS_FILE, 'utf-8')) } catch {}
  return []
}

function writeSafetyReports(data: ReportEntry[]) {
  try { ensureDataDir(); fs.writeFileSync(SAFETY_REPORTS_FILE, JSON.stringify(data, null, 2)) } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId, targetId, reason, details } = await req.json()

    if (!userId || !targetId) {
      return NextResponse.json({ error: 'userId and targetId required' }, { status: 400 })
    }

    if (action === 'block') {
      const blocks = readBlocks()
      const exists = blocks.find(b => b.blockerId === userId && b.blockedId === targetId)
      if (!exists) {
        blocks.push({ blockerId: userId, blockedId: targetId, timestamp: new Date().toISOString() })
        writeBlocks(blocks)
      }
      return NextResponse.json({ success: true, message: 'User blocked successfully' })
    }

    if (action === 'unblock') {
      const blocks = readBlocks()
      const updated = blocks.filter(b => !(b.blockerId === userId && b.blockedId === targetId))
      writeBlocks(updated)
      return NextResponse.json({ success: true, message: 'User unblocked' })
    }

    if (action === 'report') {
      if (!reason) {
        return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
      }
      const reports = readSafetyReports()
      reports.push({
        reporterId: userId,
        reportedId: targetId,
        reason,
        details: details || '',
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
      writeSafetyReports(reports)
      return NextResponse.json({ success: true, message: 'Report submitted. Our team will review it within 24 hours.' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Safety API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const targetId = searchParams.get('targetId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Check if user is blocked
  if (targetId) {
    const blocks = readBlocks()
    const isBlocked = blocks.some(b => b.blockerId === userId && b.blockedId === targetId)
    return NextResponse.json({ isBlocked })
  }

  // Get all blocked users
  const blocks = readBlocks()
  const blockedUsers = blocks.filter(b => b.blockerId === userId).map(b => b.blockedId)
  return NextResponse.json({ blockedUsers })
}
