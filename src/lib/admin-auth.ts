import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { getUserByEmail } from '@/lib/database'

const ADMIN_EMAILS = ['admin@soulmatesync.com', 'priya@example.com', 'skybirhade@gmail.com', 'yash@gmail.com', process.env.NEXT_PUBLIC_ADMIN_EMAIL].filter(Boolean)

export function authenticateAdmin(req: NextRequest): { email: string } | NextResponse {
  const authResult = authenticateRequest(req)
  if ('error' in authResult) return authResult.error
  
  const user = getUserByEmail(authResult.user.email)
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  
  return { email: user.email }
}
