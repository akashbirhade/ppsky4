import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const API_VERSION = process.env.API_VERSION || 'v1'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization')
    const res = await fetch(`${BACKEND_URL}/api/${API_VERSION}/hosts/${params.id}/members/transfer`, {
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
    console.error('Member transfer error:', error)
    return NextResponse.json({ success: false, message: 'Failed to transfer member' }, { status: 500 })
  }
}
