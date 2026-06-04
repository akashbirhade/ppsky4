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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const region = searchParams.get('region')
    const district = searchParams.get('district')
    const city = searchParams.get('city')

    let hosts = readHosts()
    const members = readMembers()

    // Apply filters
    if (region) hosts = hosts.filter((h: any) => h.region.toLowerCase().includes(region.toLowerCase()))
    if (district) hosts = hosts.filter((h: any) => h.district.toLowerCase().includes(district.toLowerCase()))
    if (city) hosts = hosts.filter((h: any) => h.city.toLowerCase().includes(city.toLowerCase()))

    // Build response (remove password, add counts)
    const response = hosts.map((h: any) => {
      const { password, ...host } = h
      const memberCount = members.filter((m: any) => m.hostId === h.id).length
      return {
        ...host,
        _count: { members: memberCount, events: (h.events || []).length },
      }
    })

    return NextResponse.json({ success: true, data: { hosts: response, total: response.length, page: 1, totalPages: 1 } })
  } catch (error) {
    console.error('Hosts fetch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch hosts' }, { status: 500 })
  }
}
