import { NextRequest, NextResponse } from 'next/server'

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

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

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
