import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const HOSTS_FILE = path.join(process.cwd(), 'data', 'hosts.json')

function readHosts() {
  try {
    const data = fs.readFileSync(HOSTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeHosts(hosts: any[]) {
  fs.writeFileSync(HOSTS_FILE, JSON.stringify(hosts, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, mobile, region, district, city, community } = await req.json()

    if (!name || !email || !password || !mobile || !region || !district || !city) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled' }, { status: 400 })
    }

    const hosts = readHosts()

    // Check if email already exists
    if (hosts.find((h: any) => h.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ success: false, message: 'A host with this email already exists' }, { status: 409 })
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const newHost = {
      id: `host${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      mobile,
      profilePhoto: '/avatars/male.svg',
      region,
      district,
      city,
      community: community || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      members: [],
      events: [],
    }

    hosts.push(newHost)
    writeHosts(hosts)

    const { password: _, ...hostData } = newHost
    return NextResponse.json({ success: true, host: hostData }, { status: 201 })
  } catch (error) {
    console.error('Host register error:', error)
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
