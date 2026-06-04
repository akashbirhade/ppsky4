import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const MEMBERS_FILE = path.join(process.cwd(), 'data', 'host-members.json')

function readMembers() {
  try { return JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf-8')) } catch { return [] }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const gender = searchParams.get('gender')
    const members = readMembers()

    let hostMembers = members.filter((m: any) => m.hostId === params.id)
    if (gender) {
      hostMembers = hostMembers.filter((m: any) => m.gender.toLowerCase() === gender.toLowerCase())
    }

    return NextResponse.json({
      success: true,
      data: {
        members: hostMembers,
        total: hostMembers.length,
        brides: hostMembers.filter((m: any) => m.gender === 'Female').length,
        grooms: hostMembers.filter((m: any) => m.gender === 'Male').length,
      },
    })
  } catch (error) {
    console.error('Host members fetch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch members' }, { status: 500 })
  }
}
