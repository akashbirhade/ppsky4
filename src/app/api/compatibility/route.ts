import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const targetId = searchParams.get('targetId')

  if (!userId || !targetId) {
    return NextResponse.json({ error: 'userId and targetId required' }, { status: 400 })
  }

  const user = getUserById(userId)
  const target = getUserById(targetId)

  if (!user || !target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Calculate compatibility based on preferences match
  let score = 50 // Base score
  let factors: { label: string; score: number; match: boolean }[] = []

  // Age preference match
  const targetAge = target.age
  if (targetAge >= user.partnerPreferences.ageMin && targetAge <= user.partnerPreferences.ageMax) {
    score += 10
    factors.push({ label: 'Age Preference', score: 10, match: true })
  } else {
    factors.push({ label: 'Age Preference', score: 0, match: false })
  }

  // Religion match
  if (!user.partnerPreferences.religion || user.partnerPreferences.religion === target.religion || user.partnerPreferences.religion.includes(target.religion)) {
    score += 12
    factors.push({ label: 'Religion', score: 12, match: true })
  } else {
    factors.push({ label: 'Religion', score: 0, match: false })
  }

  // Education match
  if (!user.partnerPreferences.education || target.education.toLowerCase().includes(user.partnerPreferences.education.toLowerCase().split('/')[0])) {
    score += 10
    factors.push({ label: 'Education', score: 10, match: true })
  } else {
    factors.push({ label: 'Education', score: 0, match: false })
  }

  // City match
  if (!user.partnerPreferences.city || user.partnerPreferences.city.toLowerCase().includes(target.city.toLowerCase()) || user.partnerPreferences.city === 'Any Metro') {
    score += 8
    factors.push({ label: 'Location', score: 8, match: true })
  } else {
    factors.push({ label: 'Location', score: 0, match: false })
  }

  // Profile completeness bonus
  if (target.profileComplete) {
    score += 5
    factors.push({ label: 'Complete Profile', score: 5, match: true })
  }

  // Verified bonus
  if (target.verified) {
    score += 5
    factors.push({ label: 'Verified Profile', score: 5, match: true })
  }

  // Cap at 99
  score = Math.min(score, 99)

  return NextResponse.json({ 
    score, 
    factors,
    level: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Low'
  })
}
