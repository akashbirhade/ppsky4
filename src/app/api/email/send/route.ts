import { NextRequest, NextResponse } from 'next/server'
import { getUserById, searchProfiles } from '@/lib/database'
import { sendProfileViewedEmail, sendNewMatchesEmail, sendInterestReceivedEmail, sendVerificationMail, sendWelcomeEmail, sendWeeklyDigestEmail } from '@/lib/email-service'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/email/send - Trigger email notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, userId, data } = body

    if (!type || !userId) {
      return NextResponse.json({ error: 'type and userId required' }, { status: 400 })
    }

    const user = getUserById(userId)
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found or no email' }, { status: 404 })
    }

    let result

    switch (type) {
      case 'profile_viewed': {
        const viewer = data?.viewerId ? getUserById(data.viewerId) : null
        if (!viewer) return NextResponse.json({ error: 'Viewer not found' }, { status: 400 })
        result = await sendProfileViewedEmail(user.email, {
          userName: user.name,
          viewerName: viewer.name,
          viewerAge: viewer.age,
          viewerCity: viewer.city,
          viewerOccupation: viewer.occupation,
          viewerPhoto: viewer.photos?.[0],
          viewerId: viewer.id,
        })
        break
      }

      case 'interest_received': {
        const sender = data?.senderId ? getUserById(data.senderId) : null
        if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 400 })
        result = await sendInterestReceivedEmail(user.email, {
          userName: user.name,
          senderName: sender.name,
          senderAge: sender.age,
          senderCity: sender.city,
          senderOccupation: sender.occupation,
          senderPhoto: sender.photos?.[0],
          senderId: sender.id,
        })
        break
      }

      case 'new_matches': {
        // Find profiles matching user preferences
        const matches = searchProfiles({
          gender: user.gender === 'Male' ? 'Female' : 'Male',
          religion: user.religion,
          city: user.city,
        })
        if (!matches || matches.length === 0) {
          return NextResponse.json({ message: 'No new matches to send' })
        }
        result = await sendNewMatchesEmail(user.email, {
          userName: user.name,
          profiles: matches.slice(0, 5).map((p: any) => ({
            name: p.name,
            age: p.age,
            city: p.city,
            occupation: p.occupation,
            photo: p.photos?.[0],
            id: p.id,
          })),
        })
        break
      }

      case 'verification': {
        const verifyUrl = data?.verifyUrl
        if (!verifyUrl) return NextResponse.json({ error: 'verifyUrl required' }, { status: 400 })
        result = await sendVerificationMail(user.email, {
          userName: user.name,
          verifyUrl,
        })
        break
      }

      case 'welcome': {
        result = await sendWelcomeEmail(user.email, { userName: user.name })
        break
      }

      case 'weekly_digest': {
        result = await sendWeeklyDigestEmail(user.email, {
          userName: user.name,
          viewCount: data?.viewCount || 0,
          interestCount: data?.interestCount || 0,
          newMatchCount: data?.newMatchCount || 0,
          topProfiles: data?.topProfiles || [],
        })
        break
      }

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: result?.success, messageId: result?.messageId })
  } catch (error: any) {
    console.error('[Email API] Error:', error.message)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

// GET /api/email/send - Preview email templates (dev only)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const template = searchParams.get('template')

  const { profileViewedTemplate, newMatchesTemplate, verificationEmailTemplate, interestReceivedTemplate, welcomeEmailTemplate, weeklyDigestTemplate } = await import('@/lib/email-service')

  const templates: Record<string, string> = {
    profile_viewed: profileViewedTemplate({
      userName: 'Priya', viewerName: 'Rahul Verma', viewerAge: 28,
      viewerCity: 'Mumbai', viewerOccupation: 'Software Engineer',
      viewerPhoto: '', viewerId: '2',
    }),
    new_matches: newMatchesTemplate({
      userName: 'Rahul',
      profiles: [
        { name: 'Priya Sharma', age: 25, city: 'Delhi', occupation: 'Doctor', photo: '', id: '3' },
        { name: 'Anita Patel', age: 27, city: 'Mumbai', occupation: 'Designer', photo: '', id: '4' },
      ],
    }),
    verification: verificationEmailTemplate({ userName: 'Rahul', verifyUrl: 'http://localhost:3002/verify?token=abc123' }),
    interest_received: interestReceivedTemplate({
      userName: 'Priya', senderName: 'Rahul Verma', senderAge: 28,
      senderCity: 'Mumbai', senderOccupation: 'Software Engineer',
      senderPhoto: '', senderId: '2',
    }),
    welcome: welcomeEmailTemplate({ userName: 'Rahul' }),
    weekly_digest: weeklyDigestTemplate({
      userName: 'Rahul', viewCount: 24, interestCount: 5, newMatchCount: 12,
      topProfiles: [
        { name: 'Priya Sharma', age: 25, city: 'Delhi', occupation: 'Doctor', photo: '', id: '3' },
      ],
    }),
  }

  if (template && templates[template]) {
    return new NextResponse(templates[template], { headers: { 'Content-Type': 'text/html' } })
  }

  const links = Object.keys(templates).map(t => `<li><a href="?template=${t}">${t}</a></li>`).join('')
  return new NextResponse(`<h2>Email Templates Preview</h2><ul>${links}</ul>`, { headers: { 'Content-Type': 'text/html' } })
}
