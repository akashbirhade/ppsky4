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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 })
    }

    const hosts = readHosts()
    const host = hosts.find((h: any) => h.email.toLowerCase() === email.toLowerCase())

    if (!host) {
      return NextResponse.json({ success: false, message: 'Host not found with this email' }, { status: 401 })
    }

    // For demo: accept "password123" for all demo hosts
    // In production, use bcrypt.compare
    const bcrypt = await import('bcryptjs')
    const isValid = await bcrypt.compare(password, host.password)

    if (!isValid && password !== 'password123') {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 })
    }

    // Return host data (without password)
    const { password: _, ...hostData } = host
    return NextResponse.json({ success: true, host: hostData })
  } catch (error) {
    console.error('Host login error:', error)
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 })
  }
}
