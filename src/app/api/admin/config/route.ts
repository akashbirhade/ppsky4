import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { getSystemConfig, updateSystemConfig, getAnnouncements, createAnnouncement, toggleAnnouncement } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const config = getSystemConfig()
  const announcements = getAnnouncements()
  return NextResponse.json({ config, announcements })
}

export async function PATCH(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { config } = await req.json()
  if (!config) return NextResponse.json({ error: 'config object required' }, { status: 400 })

  const updated = updateSystemConfig(config)
  return NextResponse.json({ config: updated })
}

export async function POST(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { action, title, message, announcementId } = await req.json()

  if (action === 'create_announcement') {
    if (!title || !message) return NextResponse.json({ error: 'title and message required' }, { status: 400 })
    const announcement = createAnnouncement(title, message)
    return NextResponse.json({ announcement }, { status: 201 })
  }

  if (action === 'toggle_announcement') {
    if (!announcementId) return NextResponse.json({ error: 'announcementId required' }, { status: 400 })
    const ann = toggleAnnouncement(announcementId)
    return NextResponse.json({ announcement: ann })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
