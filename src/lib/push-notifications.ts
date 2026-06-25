import fs from 'fs'
import path from 'path'

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json')

interface PushSubscriptionData {
  userId: string
  subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
  createdAt: string
}

export interface NotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

function getSubscriptions(): PushSubscriptionData[] {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

/**
 * Send push notification to a specific user
 * Requires VAPID keys to be set in environment variables:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY
 * - VAPID_PRIVATE_KEY
 * - VAPID_SUBJECT (mailto:your@email.com)
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const subs = getSubscriptions()
    const userSub = subs.find(s => s.userId === userId)

    if (!userSub) {
      return false // User hasn't subscribed to push
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured. Push notifications disabled.')
      return false
    }

    // Use web-push library if available, otherwise log
    try {
      const webpush = require('web-push')
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@soulmatesync.com',
        vapidPublicKey,
        vapidPrivateKey
      )

      await webpush.sendNotification(
        userSub.subscription,
        JSON.stringify(payload)
      )
      return true
    } catch (e: any) {
      // If web-push not installed, log the notification
      if (e.code === 'MODULE_NOT_FOUND') {
        console.log(`[Push Notification] To: ${userId}`, payload)
        return false
      }
      // If subscription expired, remove it
      if (e.statusCode === 410) {
        const updated = subs.filter(s => s.userId !== userId)
        fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(updated, null, 2))
      }
      throw e
    }
  } catch (error) {
    console.error('Push notification error:', error)
    return false
  }
}

/**
 * Send notification for common events
 */
export async function notifyNewMatch(userId: string, matchName: string) {
  return sendPushNotification(userId, {
    title: '💕 New Match!',
    body: `${matchName} is interested in your profile. Check it out!`,
    url: '/matches',
  })
}

export async function notifyNewMessage(userId: string, senderName: string) {
  return sendPushNotification(userId, {
    title: '💬 New Message',
    body: `${senderName} sent you a message`,
    url: '/messages',
  })
}

export async function notifyProfileView(userId: string, viewerName: string) {
  return sendPushNotification(userId, {
    title: '👀 Profile Viewed',
    body: `${viewerName} viewed your profile`,
    url: '/matches?tab=visitors',
  })
}

export async function notifyInterestReceived(userId: string, senderName: string) {
  return sendPushNotification(userId, {
    title: '❤️ Interest Received',
    body: `${senderName} sent you an interest!`,
    url: '/matches?tab=received',
  })
}

export async function notifyVerificationComplete(userId: string, approved: boolean) {
  return sendPushNotification(userId, {
    title: approved ? '✅ Verification Approved' : '❌ Verification Rejected',
    body: approved
      ? 'Your profile is now verified! You\'ll get more responses.'
      : 'Your verification was not approved. Please upload a clearer document.',
    url: '/profile',
  })
}
