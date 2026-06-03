'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Eye, Star, MessageCircle, BadgeCheck, Crown, Sparkles, Settings, Trash2, UserCheck, UserX, Phone, Mail, Shield, CheckCircle, XCircle, Users } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface Notification {
  id: string
  type: 'interest_received' | 'interest_accepted' | 'interest_declined' | 'profile_view' | 'match' | 'message' | 'contact_viewed' | 'shortlisted' | 'photo_request' | 'system' | 'reminder'
  title: string
  message: string
  time: string
  read: boolean
  link?: string
  avatar?: string
  emailSent?: boolean
}

// Comprehensive notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'interest_received', title: 'New Interest Received!', message: 'Priya Sharma (Sh28491035) has sent you an interest', time: '2 min ago', read: false, link: '/profile/1', avatar: 'PS', emailSent: true },
  { id: '2', type: 'interest_accepted', title: 'Interest Accepted! 🎉', message: 'Ananya Desai has accepted your interest. Start chatting now!', time: '10 min ago', read: false, link: '/messages', avatar: 'AD', emailSent: true },
  { id: '3', type: 'profile_view', title: 'Profile Viewed', message: 'Meera Patel viewed your profile', time: '30 min ago', read: false, link: '/profile/3', avatar: 'MP', emailSent: true },
  { id: '4', type: 'message', title: 'New Message', message: 'Kavitha Rao sent you a message: "Hi! I liked your profile..."', time: '1 hour ago', read: false, link: '/messages', avatar: 'KR', emailSent: true },
  { id: '5', type: 'match', title: 'Mutual Match! 💜', message: 'You and Neha Gupta both liked each other! It\'s a match!', time: '2 hours ago', read: false, link: '/matches', avatar: 'NG', emailSent: true },
  { id: '6', type: 'contact_viewed', title: 'Contact Viewed', message: 'Riya Kapoor viewed your contact number', time: '3 hours ago', read: true, link: '/profile/2', avatar: 'RK', emailSent: true },
  { id: '7', type: 'interest_declined', title: 'Interest Declined', message: 'Simran Kaur has declined your interest', time: '5 hours ago', read: true, link: '/search', avatar: 'SK', emailSent: true },
  { id: '8', type: 'shortlisted', title: 'You\'re Shortlisted! ⭐', message: 'Divya Sharma has shortlisted your profile', time: '6 hours ago', read: true, link: '/profile/4', avatar: 'DS', emailSent: true },
  { id: '9', type: 'photo_request', title: 'Photo Request', message: 'Aisha Begum has requested to see your photos', time: '8 hours ago', read: true, avatar: 'AB' },
  { id: '10', type: 'profile_view', title: 'Premium Member Viewed', message: 'A Premium member (Sh19283746) viewed your profile', time: '1 day ago', read: true, link: '/premium', avatar: '👑', emailSent: true },
  { id: '11', type: 'reminder', title: 'Complete Your Profile', message: 'Add hobbies & interests to get 3x more matches', time: '1 day ago', read: true, link: '/profile' },
  { id: '12', type: 'system', title: 'Weekly Match Report', message: '18 profile views, 5 interests received, 2 mutual matches this week!', time: '2 days ago', read: true, emailSent: true },
  { id: '13', type: 'message', title: 'New Message', message: 'Rohan Verma: "Thank you for accepting! When are you free to..."', time: '2 days ago', read: true, link: '/messages', avatar: 'RV', emailSent: true },
  { id: '14', type: 'interest_received', title: 'New Interest!', message: 'Tanvi Reddy (Sh38571920) has sent you an interest', time: '3 days ago', read: true, link: '/profile/5', avatar: 'TR', emailSent: true },
  { id: '15', type: 'contact_viewed', title: 'Email Viewed', message: 'Pooja Nair viewed your email address', time: '3 days ago', read: true, avatar: 'PN', emailSent: true },
]

type FilterType = 'all' | 'unread' | 'interests' | 'messages' | 'views' | 'matches'

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState<FilterType>('all')
  const [emailPrefs, setEmailPrefs] = useState({
    newMatch: true,
    newMessage: true,
    interestReceived: true,
    interestAccepted: true,
    profileViewed: true,
    contactViewed: true,
    weeklyReport: true,
  })
  const [showEmailSettings, setShowEmailSettings] = useState(false)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.read)
      case 'interests': return notifications.filter(n => ['interest_received', 'interest_accepted', 'interest_declined'].includes(n.type))
      case 'messages': return notifications.filter(n => n.type === 'message')
      case 'views': return notifications.filter(n => ['profile_view', 'contact_viewed'].includes(n.type))
      case 'matches': return notifications.filter(n => ['match', 'shortlisted'].includes(n.type))
      default: return notifications
    }
  }

  const filtered = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'interest_received': return <HalfHeart className="h-4 w-4" />
      case 'interest_accepted': return <UserCheck className="h-4 w-4 text-green-400" />
      case 'interest_declined': return <UserX className="h-4 w-4 text-red-400" />
      case 'profile_view': return <Eye className="h-4 w-4 text-teal-600 dark:text-purple-400" />
      case 'match': return <Sparkles className="h-4 w-4 text-yellow-400" />
      case 'message': return <MessageCircle className="h-4 w-4 text-blue-400" />
      case 'contact_viewed': return <Phone className="h-4 w-4 text-green-400" />
      case 'shortlisted': return <Star className="h-4 w-4 text-amber-400" />
      case 'photo_request': return <Eye className="h-4 w-4 text-fuchsia-400" />
      case 'reminder': return <Bell className="h-4 w-4 text-orange-400" />
      case 'system': return <Bell className="h-4 w-4 text-slate-600 dark:text-purple-300" />
    }
  }

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'interest_received': return 'from-pink-500/20 to-rose-500/10'
      case 'interest_accepted': return 'from-green-500/20 to-emerald-500/10'
      case 'interest_declined': return 'from-red-500/20 to-red-500/5'
      case 'profile_view': return 'from-purple-500/20 to-fuchsia-500/10'
      case 'match': return 'from-yellow-500/20 to-amber-500/10'
      case 'message': return 'from-blue-500/20 to-cyan-500/10'
      case 'contact_viewed': return 'from-green-500/15 to-teal-500/10'
      case 'shortlisted': return 'from-amber-500/20 to-orange-500/10'
      case 'photo_request': return 'from-fuchsia-500/20 to-pink-500/10'
      case 'reminder': return 'from-orange-500/20 to-amber-500/10'
      case 'system': return 'from-purple-500/10 to-purple-500/5'
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-teal-600 dark:text-purple-400" /> Notifications
            </h1>
            <p className="text-slate-500 dark:text-purple-200/50 mt-1 text-sm">{unreadCount} unread notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmailSettings(!showEmailSettings)} className="text-xs text-slate-400 dark:text-purple-300/60 hover:text-slate-700 dark:text-purple-200 transition-colors p-1.5 rounded-lg hover:bg-white/5" title="Email settings">
              <Mail className="h-4 w-4" />
            </button>
            <button onClick={markAllRead} className="text-xs text-slate-400 dark:text-purple-300/60 hover:text-slate-700 dark:text-purple-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Mark all read
            </button>
            <button onClick={clearAll} className="text-xs text-red-300/60 hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Email Notification Settings */}
        {showEmailSettings && (
          <div className="glass-card mb-6 animate-fade-in-up border-blue-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Email Notification Preferences</h3>
            </div>
            <p className="text-[11px] text-slate-300 dark:text-purple-300/40 mb-4">Choose which notifications you receive via email</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { key: 'newMatch', label: 'New Mutual Match' },
                { key: 'newMessage', label: 'New Message' },
                { key: 'interestReceived', label: 'Interest Received' },
                { key: 'interestAccepted', label: 'Interest Accepted' },
                { key: 'profileViewed', label: 'Profile Viewed' },
                { key: 'contactViewed', label: 'Contact Viewed' },
                { key: 'weeklyReport', label: 'Weekly Report' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={emailPrefs[item.key as keyof typeof emailPrefs]}
                    onChange={e => setEmailPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-teal-200 dark:border-purple-500/30 bg-white/5 text-teal-600 dark:text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="text-xs text-slate-500 dark:text-purple-200/70">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-teal-100 dark:border-purple-500/10 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[10px] text-green-300/60">Email notifications will be sent to {user.email}</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 animate-fade-in-up scrollbar-hide" style={{ animationDelay: '0.1s', opacity: 0, scrollbarWidth: 'none' }}>
          {([
            { id: 'all' as FilterType, label: 'All', count: notifications.length },
            { id: 'unread' as FilterType, label: 'Unread', count: unreadCount },
            { id: 'interests' as FilterType, label: 'Interests', count: notifications.filter(n => ['interest_received', 'interest_accepted', 'interest_declined'].includes(n.type)).length },
            { id: 'messages' as FilterType, label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
            { id: 'views' as FilterType, label: 'Views', count: notifications.filter(n => ['profile_view', 'contact_viewed'].includes(n.type)).length },
            { id: 'matches' as FilterType, label: 'Matches', count: notifications.filter(n => ['match', 'shortlisted'].includes(n.type)).length },
          ]).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                filter === f.id ? 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30' : 'text-slate-400 dark:text-purple-300/50 hover:bg-white/5 border border-transparent'
              }`}>
              {f.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${filter === f.id ? 'bg-purple-500/30' : 'bg-white/5'}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <Bell className="h-16 w-16 text-purple-300/15 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">All caught up!</h3>
            <p className="text-sm text-purple-200/40">No new notifications right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n, i) => (
              <div
                key={n.id}
                onClick={() => { markRead(n.id); if (n.link) router.push(n.link) }}
                className={`glass-card !p-4 cursor-pointer hover:border-teal-200/50 dark:border-purple-400/30 transition-all animate-fade-in-up group ${
                  !n.read ? 'border-teal-200 dark:border-purple-500/30 bg-teal-50/50 dark:bg-purple-500/5' : ''
                }`}
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                      <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                      <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
                    </svg>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${!n.read ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-purple-200/70'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-purple-200/50 mt-0.5 truncate">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-300 dark:text-purple-300/30">{n.time}</p>
                      {n.emailSent && (
                        <span className="text-[9px] text-blue-300/40 flex items-center gap-0.5">
                          <Mail className="h-2.5 w-2.5" /> Email sent
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action indicator */}
                  <div className="flex flex-col items-end gap-1">
                    {n.link && (
                      <div className="text-purple-300/20 group-hover:text-slate-400 dark:text-purple-300/60 transition-colors text-sm">→</div>
                    )}
                    {n.type === 'interest_received' && !n.read && (
                      <div className="flex gap-1 mt-1">
                        <button onClick={e => { e.stopPropagation(); markRead(n.id) }} className="text-[9px] bg-green-500/10 text-green-300 px-2 py-0.5 rounded-full border border-green-500/20 hover:bg-green-500/20">Accept</button>
                        <button onClick={e => { e.stopPropagation(); markRead(n.id) }} className="text-[9px] bg-red-500/10 text-red-300 px-2 py-0.5 rounded-full border border-red-500/20 hover:bg-red-500/20">Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Push Notification Prompt */}
        <div className="mt-8 glass-card p-5 border-teal-200/50 dark:border-purple-500/20 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100/50 dark:bg-purple-500/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-teal-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">Enable Push Notifications</p>
              <p className="text-xs text-purple-200/40">Never miss when someone shows interest</p>
            </div>
            <button className="btn-primary text-xs py-2 px-4">Enable</button>
          </div>
        </div>
      </div>
    </div>
  )
}
