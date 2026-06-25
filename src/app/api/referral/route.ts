import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser, getUserByEmail } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const REFERRALS_FILE = path.join(process.cwd(), 'data', 'referrals.json')

interface Referral {
  id: string
  referrerId: string
  referredEmail: string
  referredUserId: string | null
  status: 'pending' | 'registered' | 'rewarded'
  referralCode: string
  createdAt: string
  completedAt: string | null
}

function getReferrals(): Referral[] {
  try {
    if (fs.existsSync(REFERRALS_FILE)) {
      return JSON.parse(fs.readFileSync(REFERRALS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveReferrals(referrals: Referral[]) {
  try {
    const dir = path.dirname(REFERRALS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(REFERRALS_FILE, JSON.stringify(referrals, null, 2))
  } catch (e) {
    console.error('Failed to save referrals:', e)
  }
}

function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SS${userId.slice(-3).toUpperCase()}${random}`
}

// Get referral info & code
export async function GET(req: NextRequest) {
  try {
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const userId = authResult.user.userId
    const user = getUserById(userId) as any
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate referral code if not exists
    let referralCode = user.referralCode
    if (!referralCode) {
      referralCode = generateReferralCode(userId)
      updateUser(userId, { referralCode } as any)
    }

    // Get referral stats
    const referrals = getReferrals()
    const myReferrals = referrals.filter(r => r.referrerId === userId)
    const successful = myReferrals.filter(r => r.status === 'rewarded').length
    const pending = myReferrals.filter(r => r.status === 'pending' || r.status === 'registered').length

    // Premium days earned (7 days per successful referral)
    const daysEarned = successful * 7

    return NextResponse.json({
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://soulmatesync.com'}/register?ref=${referralCode}`,
      stats: {
        totalReferred: myReferrals.length,
        successful,
        pending,
        daysEarned,
      },
      referrals: myReferrals.map(r => ({
        email: r.referredEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
        status: r.status,
        date: r.createdAt,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Apply referral code (called during registration)
export async function POST(req: NextRequest) {
  try {
    const { referralCode, newUserId, newUserEmail } = await req.json()

    if (!referralCode || !newUserId || !newUserEmail) {
      return NextResponse.json({ error: 'referralCode, newUserId, and newUserEmail are required' }, { status: 400 })
    }

    // Find the referrer by code
    const allUsers = require('@/lib/database').getStoredUsers ? 
      require('@/lib/database').getStoredUsers() : []
    
    // Search through users to find who owns this referral code
    const referrer = allUsers.find((u: any) => u.referralCode === referralCode)
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    if (referrer.id === newUserId) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 })
    }

    // Check if this user was already referred
    const referrals = getReferrals()
    const existing = referrals.find(r => r.referredUserId === newUserId || r.referredEmail === newUserEmail)
    if (existing) {
      return NextResponse.json({ error: 'Referral already applied' }, { status: 409 })
    }

    // Create referral record
    const referral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      referrerId: referrer.id,
      referredEmail: newUserEmail,
      referredUserId: newUserId,
      status: 'registered',
      referralCode,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }

    referrals.push(referral)

    // Reward the referrer with 7 days premium
    const currentExpiry = referrer.premiumExpiry ? new Date(referrer.premiumExpiry) : new Date()
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()))
    newExpiry.setDate(newExpiry.getDate() + 7)

    updateUser(referrer.id, {
      premium: true,
      premiumPlan: referrer.premiumPlan || 'referral',
      premiumExpiry: newExpiry.toISOString().split('T')[0],
    } as any)

    // Also give the new user 3 days premium
    const newUserExpiry = new Date()
    newUserExpiry.setDate(newUserExpiry.getDate() + 3)
    updateUser(newUserId, {
      premium: true,
      premiumPlan: 'referral_bonus',
      premiumExpiry: newUserExpiry.toISOString().split('T')[0],
    } as any)

    referral.status = 'rewarded'
    referral.completedAt = new Date().toISOString()
    saveReferrals(referrals)

    return NextResponse.json({
      success: true,
      message: 'Referral applied! Both you and your friend get free premium days.',
      rewards: {
        referrer: '7 days premium added',
        referred: '3 days premium added',
      },
    })
  } catch (error) {
    console.error('Referral error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
