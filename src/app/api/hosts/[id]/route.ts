import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const HOSTS_FILE = path.join(process.cwd(), 'data', 'hosts.json')
const MEMBERS_FILE = path.join(process.cwd(), 'data', 'host-members.json')

function readHosts() {
  try { return JSON.parse(fs.readFileSync(HOSTS_FILE, 'utf-8')) } catch { return [] }
}

function readMembers() {
  try { return JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf-8')) } catch { return [] }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hosts = readHosts()
    const members = readMembers()
    const host = hosts.find((h: any) => h.id === params.id)

    if (!host) {
      return NextResponse.json({ success: false, message: 'Host not found' }, { status: 404 })
    }

    const { password, ...hostData } = host
    const hostMembers = members.filter((m: any) => m.hostId === host.id)
    const memberCount = hostMembers.length

    return NextResponse.json({
      success: true,
      data: {
        ...hostData,
        _count: { members: memberCount, events: (host.events || []).length },
      },
    })
  } catch (error) {
    console.error('Host fetch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch host' }, { status: 500 })
  }
}
