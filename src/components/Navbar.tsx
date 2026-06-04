'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Menu, X, User, LogOut, Search, MessageCircle, Crown, Users, Settings, Bell, Mail, Shield, SlidersHorizontal, ChevronDown, HelpCircle, Sun, Moon } from 'lucide-react'
import HalfHeart from './HalfHeart'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [userInfoOpen, setUserInfoOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; message: string; time: string; read: boolean; link?: string }[]>([])
  const [inboxCount, setInboxCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [showSubNav, setShowSubNav] = useState(true)
  const lastScrollY = useRef(0)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const profileRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)

  const userInfoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false)
      if (userInfoRef.current && !userInfoRef.current.contains(e.target as Node)) setUserInfoOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`/api/activity/interests?userId=${user.id}&type=received`)
        const data = await res.json()
        const interests = data.interests || []
        const notifs = interests.slice(0, 5).map((item: any) => ({
          id: item.interest?.id || item.profile?.id || Math.random().toString(),
          type: item.interest?.status === 'pending' ? 'interest_received' : 'interest_' + item.interest?.status,
          title: item.interest?.status === 'pending' ? 'New Interest!' : 'Interest ' + (item.interest?.status || ''),
          message: `${item.profile?.name || 'Someone'} sent you an interest`,
          time: item.interest?.timestamp ? getTimeAgo(item.interest.timestamp) : 'recently',
          read: item.interest?.status !== 'pending',
          link: `/profile/${item.profile?.id}`,
        }))
        setNotifications(notifs)
        setNotifCount(notifs.filter((n: any) => !n.read).length)
      } catch {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [user])

  // Fetch dynamic inbox and match counts
  useEffect(() => {
    if (!user) return
    const fetchCounts = async () => {
      try {
        const [msgRes, matchRes] = await Promise.all([
          fetch(`/api/messages?userId=${user.id}`),
          fetch(`/api/activity/matches?userId=${user.id}&type=counts`)
        ])
        if (msgRes.ok) {
          const msgData = await msgRes.json()
          const unread = (msgData.conversations || []).reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0)
          setInboxCount(unread)
        }
        if (matchRes.ok) {
          const matchData = await matchRes.json()
          setMatchCount(matchData.counts?.interestsReceived || 0)
        }
      } catch {}
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < 10) {
        setShowSubNav(true)
      } else {
        setShowSubNav(false)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/90 backdrop-blur-xl border-b border-teal-100/60 dark:border-purple-500/10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center lg:justify-between items-center h-14 lg:h-16 relative">
          {/* Theme toggle - mobile only, right side */}
          <button
            onClick={toggleTheme}
            className="lg:hidden absolute right-0 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-purple-500/10 border border-slate-200 dark:border-purple-500/20 hover:bg-slate-200 dark:hover:bg-purple-500/20 transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
          </button>

          {/* Logo - centered on mobile, left on desktop */}
          <div className="flex items-center lg:flex-none">
            <Link href="/" className="flex items-center space-x-2 group">
              <HalfHeart className="h-7 w-7 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold gradient-text tracking-tight">Soulmate Sync</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <>
                <NavLink href="/dashboard" label="My Matches" />
                <NavLink href="/matches" label="Matches" badge={matchCount} />
                <NavLink href="/search" label="Search" />
                <NavLink href="/messages" label="Inbox" badge={inboxCount} />

                {/* Upgrade Button */}
                <Link href="/premium" className="ml-3 flex items-center gap-1.5 btn-gold text-sm py-2 px-4">
                  <Crown className="h-4 w-4" /> Upgrade Now
                </Link>

                {/* Help Dropdown */}
                <div ref={helpRef} className="relative ml-3">
                  <button onClick={() => setHelpOpen(!helpOpen)} className="flex items-center gap-1 text-purple-200/70 hover:text-white text-sm font-medium transition-colors">
                    Help <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {helpOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 rounded-lg shadow-xl border border-purple-500/20 py-2 z-50 animate-fade-in-down">
                      <a href="#" className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/10">Help Center</a>
                      <a href="#" className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/10">Contact Us</a>
                      <a href="#" className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/10">FAQs</a>
                      <a href="#" className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-500/10">Safety Tips</a>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="ml-3 w-9 h-9 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-400" />}
                </button>

                {/* User Info Icon */}
                <div ref={userInfoRef} className="relative ml-3">
                  <button
                    onClick={() => setUserInfoOpen(!userInfoOpen)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4 text-purple-300" />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">{notifCount}</span>
                    )}
                  </button>
                  {userInfoOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-500/20 z-50 animate-fade-in-down overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {notifCount > 0 && <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">{notifCount} new</span>}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                          <Link key={n.id} href={n.link || '/notifications'} onClick={() => setUserInfoOpen(false)}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-purple-500/5 transition-colors border-b border-purple-500/5 ${!n.read ? 'bg-purple-500/[0.03]' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-pink-500/20' : 'bg-white/5'}`}>
                              <Bell className={`h-3.5 w-3.5 ${!n.read ? 'text-pink-400' : 'text-purple-300/50'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${!n.read ? 'text-white' : 'text-purple-200/70'}`}>{n.title}</p>
                              <p className="text-[11px] text-purple-300/50 truncate">{n.message}</p>
                              <p className="text-[9px] text-purple-300/30 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>}
                          </Link>
                        )) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="h-6 w-6 text-purple-300/20 mx-auto mb-2" />
                            <p className="text-xs text-purple-300/40">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <Link href="/notifications" onClick={() => setUserInfoOpen(false)}
                        className="block text-center py-2.5 text-xs text-purple-400 hover:text-purple-300 border-t border-purple-500/10 transition-colors">
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Avatar Dropdown */}
                <div ref={profileRef} className="relative ml-3">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-1.5 group">
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 border-2 border-purple-400/30 flex items-center justify-center overflow-hidden group-hover:border-purple-300/50 transition-all">
                      {user.photos && user.photos.length > 0 ? (
                        <img src={user.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-purple-300/60" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800 rounded-xl shadow-2xl border border-purple-500/20 z-50 animate-fade-in-down overflow-hidden">
                      {/* Dropdown Menu Items */}
                      <div className="grid grid-cols-2 gap-0 p-4 border-b border-purple-500/10">
                        <Link href="/profile" className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200" onClick={() => setProfileOpen(false)}>
                          <User className="h-4 w-4 text-purple-400" /> My Profile
                        </Link>
                        <Link href="/notifications" className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200" onClick={() => setProfileOpen(false)}>
                          <Mail className="h-4 w-4 text-purple-400" /> Alerts
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200" onClick={() => setProfileOpen(false)}>
                          <Settings className="h-4 w-4 text-purple-400" /> Settings
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200" onClick={() => setProfileOpen(false)}>
                          <Shield className="h-4 w-4 text-purple-400" /> Privacy
                        </Link>
                        <Link href="/search" className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 text-sm text-purple-200" onClick={() => setProfileOpen(false)}>
                          <SlidersHorizontal className="h-4 w-4 text-purple-400" /> Filters
                        </Link>
                        <button onClick={() => { logout(); setProfileOpen(false) }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-sm text-red-300">
                          <LogOut className="h-4 w-4 text-red-400" /> Logout
                        </button>
                      </div>
                      {/* Account Type */}
                      <div className="p-4 text-center">
                        <p className="text-sm text-purple-300/60 mb-2">Account Type: <span className="font-semibold text-purple-200">{user.premium ? user.premiumPlan || 'Premium' : 'Free'}</span></p>
                        {!user.premium && (
                          <>
                            <Link href="/premium" className="block w-full btn-gold py-2.5 px-4 text-sm" onClick={() => setProfileOpen(false)}>
                              Upgrade Now
                            </Link>
                            <Link href="/premium" className="block mt-2 text-purple-400 text-sm hover:underline" onClick={() => setProfileOpen(false)}>
                              Compare memberships
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink href="/search" label="Browse" />
                <button
                  onClick={toggleTheme}
                  className="ml-3 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-purple-500/10 border border-slate-200 dark:border-purple-500/20 hover:bg-slate-200 dark:hover:bg-purple-500/20 transition-all"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
                </button>
                <Link href="/login" className="ml-3 btn-secondary text-sm py-2 px-5">Login</Link>
                <Link href="/register" className="ml-2 btn-primary text-xs py-1.5 px-3">Register Free</Link>
              </>
            )}
          </div>


        </div>

        {/* Sub Navigation (only when logged in) */}
        {user && (
          <div className={`hidden lg:flex items-center gap-6 h-10 border-t border-purple-500/10 -mx-4 px-4 transition-all duration-300 overflow-hidden ${showSubNav ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}>
            <SubNavLink href="/dashboard" label="Dashboard" />
            <SubNavLink href="/profile" label="My Profile" />
            <SubNavLink href="/hosts" label="Hosts" />
            <SubNavLink href="/meeting" label="Meeting Planner" />
            <SubNavLink href="/preferences" label="Partner Preferences" />
            <SubNavLink href="/settings" label="Settings" />
            <SubNavLink href="/hosts/events" label="Events" />
          </div>
        )}
      </div>


    </nav>
  )
}

function NavLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
  return (
    <Link href={href} className="relative flex items-center text-slate-700 dark:text-purple-200/70 hover:text-slate-900 dark:hover:text-white px-4 py-2 text-sm font-semibold transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

function SubNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-purple-300/50 hover:text-purple-200 text-xs font-medium transition-colors">
      {label}
    </Link>
  )
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-purple-200 py-3 px-4 rounded-lg hover:bg-purple-500/10 font-medium text-sm">
      {label}
    </Link>
  )
}

function getTimeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
