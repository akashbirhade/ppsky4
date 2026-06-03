// Notification service - handles sending email + push + in-app notifications

export interface NotificationEvent {
  type: 'interest_received' | 'interest_accepted' | 'interest_declined' | 'profile_view' | 'match' | 'message' | 'contact_viewed' | 'shortlisted' | 'photo_request'
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  metadata?: Record<string, any>
}

export async function sendNotification(event: NotificationEvent) {
  // 1. Send email notification
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: event.type,
        userId: event.toUserId,
        data: {
          userName: event.toUserName,
          senderName: event.fromUserName,
          senderId: `Sh${event.fromUserId.replace(/\D/g, '').slice(0, 8).padEnd(8, '0')}`,
          ...event.metadata,
        }
      })
    })
  } catch (e) {
    console.error('[Notification] Email send failed:', e)
  }

  // 2. Store in-app notification (would use DB in production)
  const notification = {
    id: Date.now().toString(),
    type: event.type,
    title: getNotificationTitle(event.type),
    message: getNotificationMessage(event),
    time: 'Just now',
    read: false,
    avatar: event.fromUserName.split(' ').map(n => n[0]).join(''),
    emailSent: true,
  }

  // Store in localStorage for persistence
  const stored = JSON.parse(localStorage.getItem('soulmateSync_notifications') || '[]')
  stored.unshift(notification)
  localStorage.setItem('soulmateSync_notifications', JSON.stringify(stored.slice(0, 50)))

  // 3. Push notification (if supported)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
    })
  }

  return notification
}

function getNotificationTitle(type: NotificationEvent['type']): string {
  switch (type) {
    case 'interest_received': return 'New Interest Received! 💜'
    case 'interest_accepted': return 'Interest Accepted! 🎉'
    case 'interest_declined': return 'Interest Declined'
    case 'profile_view': return 'Profile Viewed 👀'
    case 'match': return 'Mutual Match! 💑'
    case 'message': return 'New Message 💬'
    case 'contact_viewed': return 'Contact Viewed 📞'
    case 'shortlisted': return 'You\'re Shortlisted! ⭐'
    case 'photo_request': return 'Photo Request 📷'
    default: return 'New Notification'
  }
}

function getNotificationMessage(event: NotificationEvent): string {
  switch (event.type) {
    case 'interest_received':
      return `${event.fromUserName} has sent you an interest`
    case 'interest_accepted':
      return `${event.fromUserName} accepted your interest. Start chatting!`
    case 'interest_declined':
      return `${event.fromUserName} has declined your interest`
    case 'profile_view':
      return `${event.fromUserName} viewed your profile`
    case 'match':
      return `You and ${event.fromUserName} both liked each other!`
    case 'message':
      return `${event.fromUserName} sent you a message: "${event.metadata?.preview || 'Hi!'}"` 
    case 'contact_viewed':
      return `${event.fromUserName} viewed your ${event.metadata?.contactType || 'contact'} details`
    case 'shortlisted':
      return `${event.fromUserName} has shortlisted your profile`
    case 'photo_request':
      return `${event.fromUserName} has requested to see your photos`
    default:
      return `New activity from ${event.fromUserName}`
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Get unread count from localStorage
export function getUnreadCount(): number {
  if (typeof window === 'undefined') return 0
  const stored = JSON.parse(localStorage.getItem('soulmateSync_notifications') || '[]')
  return stored.filter((n: any) => !n.read).length
}
