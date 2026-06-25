import { NextRequest, NextResponse } from 'next/server'
import { getUserById, getWhoViewedMe, getInterestsReceived, getMutualMatches } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Email notification templates
const EMAIL_TEMPLATES = {
  new_match: {
    subject: '🎉 You have a new match on Soulmate Sync!',
    body: (data: any) => `
      Hi ${data.userName},
      
      Great news! You and ${data.matchName} have mutually liked each other. It's a match!
      
      Profile ID: ${data.matchId}
      Compatibility: ${data.compatibility}%
      
      Start a conversation now and get to know each other better.
      
      Visit: https://soulmatesync.com/messages
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  new_message: {
    subject: '💬 New message from ${senderName} on Soulmate Sync',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.senderName} has sent you a new message:
      "${data.messagePreview}..."
      
      Reply now to keep the conversation going!
      
      Visit: https://soulmatesync.com/messages
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  interest_received: {
    subject: '💜 Someone is interested in you on Soulmate Sync!',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.senderName} (${data.senderId}) has expressed interest in your profile!
      
      About them:
      - Age: ${data.senderAge} years
      - Location: ${data.senderCity}
      - Profession: ${data.senderProfession}
      
      Accept or decline the interest on Soulmate Sync.
      
      Visit: https://soulmatesync.com/notifications
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  interest_accepted: {
    subject: '✅ Your interest was accepted on Soulmate Sync!',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.acceptedBy} has accepted your interest! 🎉
      
      You can now:
      - Chat with them directly
      - View their contact details (Premium)
      - Schedule a video call
      
      Don't wait - start the conversation now!
      
      Visit: https://soulmatesync.com/messages
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  interest_declined: {
    subject: 'Update on your interest on Soulmate Sync',
    body: (data: any) => `
      Hi ${data.userName},
      
      We're sorry, ${data.declinedBy} has declined your interest.
      
      Don't worry! There are many more compatible profiles waiting for you.
      Browse new matches tailored just for you.
      
      Visit: https://soulmatesync.com/search
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  profile_viewed: {
    subject: '👀 Someone viewed your profile on Soulmate Sync',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.viewerName} (${data.viewerId}) recently viewed your profile.
      
      Check out their profile and send an interest if you're interested!
      
      Visit: https://soulmatesync.com/profile/${data.viewerProfileId}
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  contact_viewed: {
    subject: '📞 Someone viewed your contact on Soulmate Sync',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.viewerName} has viewed your ${data.contactType} (${data.contactType === 'phone' ? 'phone number' : 'email address'}).
      
      They might reach out to you soon. Make sure your contact details are up to date.
      
      Visit: https://soulmatesync.com/settings
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  weekly_report: {
    subject: '📊 Your Weekly Soulmate Sync Report',
    body: (data: any) => `
      Hi ${data.userName},
      
      Here's your weekly activity summary:
      
      👀 Profile Views: ${data.profileViews}
      💜 Interests Received: ${data.interestsReceived}
      ✅ Interests Accepted: ${data.interestsAccepted}
      💑 New Matches: ${data.newMatches}
      💬 Messages: ${data.messages}
      
      Keep your profile updated to get more matches!
      
      Visit: https://soulmatesync.com/dashboard
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  shortlisted: {
    subject: '⭐ Someone shortlisted you on Soulmate Sync!',
    body: (data: any) => `
      Hi ${data.userName},
      
      ${data.shortlistedBy} has added you to their shortlist!
      
      This means they're seriously considering you. Check their profile and send an interest!
      
      Visit: https://soulmatesync.com/profile/${data.shortlistedByProfileId}
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  profile_updated: {
    subject: '✅ Your Soulmate Sync profile has been updated',
    body: (data: any) => `
      Hi ${data.userName},
      
      Your profile on Soulmate Sync has been successfully updated.
      
      What was updated: ${data.updatedFields || 'Profile information'}
      Updated at: ${data.updatedAt || new Date().toLocaleString()}
      
      If you did not make this change, please secure your account immediately.
      
      Visit your profile: https://soulmatesync.com/profile
      Change password: https://soulmatesync.com/settings
      
      Best wishes,
      Team Soulmate Sync
    `
  },
  profile_photo_uploaded: {
    subject: '📸 New photo added to your Soulmate Sync profile',
    body: (data: any) => `
      Hi ${data.userName},
      
      A new photo has been added to your Soulmate Sync profile.
      
      Profiles with photos get up to 5x more responses!
      
      View your profile: https://soulmatesync.com/profile
      
      Best wishes,
      Team Soulmate Sync
    `
  },
}

// POST - Send email notification
export async function POST(req: NextRequest) {
  try {
    const { type, userId, data } = await req.json()

    if (!type || !userId) {
      return NextResponse.json({ error: 'type and userId are required' }, { status: 400 })
    }

    const template = EMAIL_TEMPLATES[type as keyof typeof EMAIL_TEMPLATES]
    if (!template) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // In production, this would use a service like SendGrid, AWS SES, or Nodemailer
    // For now, we simulate the email send
    const emailPayload = {
      to: data.userEmail || `${userId}@soulmatesync.com`,
      subject: template.subject.replace('${senderName}', data.senderName || ''),
      body: template.body(data),
      sentAt: new Date().toISOString(),
      type,
      userId,
    }

    // Store notification in activity log
    console.log('[EMAIL NOTIFICATION]', emailPayload.subject, '→', emailPayload.to)

    return NextResponse.json({
      success: true,
      message: 'Email notification sent',
      emailId: `email_${Date.now()}`,
      type,
      sentTo: emailPayload.to,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

// GET - Get notification preferences
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  const type = url.searchParams.get('type') // 'feed' | 'preferences'

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Return real notification feed
  if (type === 'feed') {
    const user = getUserById(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const notifications: any[] = []

    try {
      const viewers = getWhoViewedMe(userId)
      viewers.slice(0, 5).forEach(v => {
        notifications.push({
          id: `view_${v.profile.id}`,
          type: 'profile_view',
          title: `${v.profile.name} viewed your profile`,
          message: `From ${v.profile.city || 'India'}`,
          timestamp: v.timestamp,
          read: false,
          profileId: v.profile.id,
          profilePhoto: v.profile.photos?.[0] || null,
        })
      })
    } catch {}

    try {
      const interests = getInterestsReceived(userId)
      interests.slice(0, 5).forEach(i => {
        notifications.push({
          id: `interest_${i.profile.id}`,
          type: 'interest_received',
          title: `${i.profile.name} sent you an interest!`,
          message: `${i.profile.age} yrs, ${i.profile.occupation || 'Professional'}`,
          timestamp: i.interest.timestamp,
          read: i.interest.status !== 'pending',
          profileId: i.profile.id,
          profilePhoto: i.profile.photos?.[0] || null,
          actionRequired: i.interest.status === 'pending',
        })
      })
    } catch {}

    try {
      const mutuals = getMutualMatches(userId)
      mutuals.slice(0, 3).forEach(m => {
        notifications.push({
          id: `match_${m.id}`,
          type: 'mutual_match',
          title: `It's a match! You and ${m.name} like each other`,
          message: 'Start chatting now!',
          timestamp: new Date().toISOString(),
          read: false,
          profileId: m.id,
          profilePhoto: m.photos?.[0] || null,
        })
      })
    } catch {}

    if (user.premium && user.premiumExpiry) {
      const daysLeft = Math.ceil((new Date(user.premiumExpiry).getTime() - Date.now()) / 86400000)
      if (daysLeft <= 7 && daysLeft > 0) {
        notifications.push({
          id: 'premium_expiry',
          type: 'system',
          title: 'Premium expiring soon',
          message: `Your plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          timestamp: new Date().toISOString(),
          read: false,
        })
      }
    }

    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return NextResponse.json({ notifications, unreadCount: notifications.filter(n => !n.read).length })
  }

  // Default: return preferences

  // Default preferences
  const preferences = {
    userId,
    email: {
      newMatch: true,
      newMessage: true,
      interestReceived: true,
      interestAccepted: true,
      interestDeclined: false,
      profileViewed: true,
      contactViewed: true,
      shortlisted: true,
      weeklyReport: true,
    },
    push: {
      newMatch: true,
      newMessage: true,
      interestReceived: true,
      interestAccepted: true,
      profileViewed: false,
      contactViewed: true,
    },
    sms: {
      newMatch: false,
      interestAccepted: false,
    }
  }

  return NextResponse.json(preferences)
}
