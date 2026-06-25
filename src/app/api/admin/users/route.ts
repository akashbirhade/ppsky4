import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { getUsers, getUserById, updateUser, banUser, unbanUser } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || 'all' // all, premium, verified, banned

  let users = getUsers()

  // Apply filters
  if (filter === 'premium') users = users.filter(u => u.premium)
  else if (filter === 'verified') users = users.filter(u => u.verified)
  else if (filter === 'banned') users = users.filter(u => (u as any).banned)
  else if (filter === 'unverified') users = users.filter(u => !u.verified)

  // Apply search
  if (search) {
    const q = search.toLowerCase()
    users = users.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) || 
      u.phone?.includes(q) ||
      u.city?.toLowerCase().includes(q)
    )
  }

  const total = users.length
  const paginated = users.slice((page - 1) * limit, page * limit).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    age: u.age,
    gender: u.gender,
    city: u.city,
    verified: u.verified,
    premium: u.premium,
    banned: (u as any).banned || false,
    createdAt: u.createdAt,
    photos: u.photos?.slice(0, 1) || [],
    lastActive: (u as any).lastActive || u.createdAt,
  }))

  return NextResponse.json({ users: paginated, total, page, totalPages: Math.ceil(total / limit) })
}

export async function PATCH(req: NextRequest) {
  const admin = authenticateAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { userId, action, reason, permanent, durationDays } = await req.json()
  if (!userId || !action) {
    return NextResponse.json({ error: 'userId and action required' }, { status: 400 })
  }

  const user = getUserById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  switch (action) {
    case 'ban':
      const ban = banUser(userId, reason || 'Violation of terms', (admin as any).email, permanent || false, durationDays)
      return NextResponse.json({ success: true, ban })
    case 'unban':
      unbanUser(userId)
      return NextResponse.json({ success: true, message: 'User unbanned' })
    case 'verify':
      updateUser(userId, { verified: true })
      return NextResponse.json({ success: true, message: 'User verified' })
    case 'unverify':
      updateUser(userId, { verified: false })
      return NextResponse.json({ success: true, message: 'Verification removed' })
    case 'remove_premium':
      updateUser(userId, { premium: false })
      return NextResponse.json({ success: true, message: 'Premium removed' })
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
