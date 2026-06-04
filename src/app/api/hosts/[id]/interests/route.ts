import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const API_VERSION = process.env.API_VERSION || 'v1'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const authHeader = req.headers.get('authorization')
    const url = `${BACKEND_URL}/api/${API_VERSION}/hosts/${params.id}/interests${status ? `?status=${status}` : ''}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Host interests fetch error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch interests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization')
    const res = await fetch(`${BACKEND_URL}/api/${API_VERSION}/hosts/${params.id}/interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Interest create error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create interest' }, { status: 500 })
  }
}
