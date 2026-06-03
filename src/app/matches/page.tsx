'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, Heart, Users, Star, MapPin, Clock, Send, Inbox, HandHeart, Bookmark, Brain, Sparkles, Crown, Check, X, User, BadgeCheck } from 'lucide-react'
import { useProfileSlide } from '@/hooks/useGsap'

interface ProfileItem {
  profile: { id: string; name: string; age: number; city: string; state: string; education: string; occupation: string; height: string; verified: boolean; premium: boolean; gender: string; photos?: string[]; about?: string; religion?: string; motherTongue?: string; income?: string; maritalStatus?: string }
  timestamp?: string
  interest?: { id: string; status: string; timestamp: string }
}

export default function MatchesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('daily')
  const [data, setData] = useState<ProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchCount, setMatchCount] = useState(20)
  const [counts, setCounts] = useState({ profileViews: 0, interestsReceived: 0, interestsSent: 0, shortlistedBy: 0, mutualMatches: 0, recentVisitors: 0 })
  const [shortlistCount, setShortlistCount] = useState(0)
  const { ref: profileSlideRef, animateSlide } = useProfileSlide()
  const [connectPopup, setConnectPopup] = useState<{ profileId: string; rippling: boolean } | null>(null)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])
  useEffect(() => { if (user) { fetchCounts(); fetchData() } }, [user, activeTab])

  const handleNext = () => {
    if (currentIndex >= data.length - 1) return
    setCurrentIndex(currentIndex + 1)
    animateSlide('next')
  }

  const handlePrev = () => {
    if (currentIndex === 0) return
    setCurrentIndex(currentIndex - 1)
    animateSlide('prev')
  }

  const fetchCounts = async () => {
    try {
      const res = await fetch(`/api/activity/matches?userId=${user!.id}&type=counts`)
      const d = await res.json()
      if (d.counts) setCounts(d.counts)
      // fetch user's own shortlist count
      const slRes = await fetch(`/api/activity/shortlist?userId=${user!.id}`)
      const slData = await slRes.json()
      setShortlistCount(slData.profiles?.length || 0)
    } catch {}
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let res
      switch (activeTab) {
        case 'daily':
          res = await fetch(`/api/activity/matches?userId=${user!.id}&type=daily`)
          const daily = await res.json()
          setData((daily.profiles || []).map((p: any) => ({ profile: p })))
          break
        case 'viewed':
          res = await fetch(`/api/activity/views?userId=${user!.id}&type=viewed`)
          const viewed = await res.json()
          setData(viewed.profiles || [])
          break
        case 'visitors':
          res = await fetch(`/api/activity/views?userId=${user!.id}&type=visitors`)
          const visitors = await res.json()
          setData(visitors.profiles || [])
          break
        case 'sent':
          res = await fetch(`/api/activity/interests?userId=${user!.id}&type=sent`)
          const sent = await res.json()
          setData(sent.interests || [])
          break
        case 'received':
          res = await fetch(`/api/activity/interests?userId=${user!.id}&type=received`)
          const received = await res.json()
          setData(received.interests || [])
          break
        case 'mutual':
          res = await fetch(`/api/activity/interests?userId=${user!.id}&type=mutual`)
          const mutual = await res.json()
          setData((mutual.profiles || []).map((p: any) => ({ profile: p })))
          break
        case 'shortlist':
          res = await fetch(`/api/activity/shortlist?userId=${user!.id}`)
          const sl = await res.json()
          setData(sl.profiles || [])
          break
        case 'nearby':
          res = await fetch(`/api/activity/matches?userId=${user!.id}&type=nearby`)
          const nearby = await res.json()
          setData((nearby.profiles || []).map((p: any) => ({ profile: p })))
          break
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleAccept = async (interestId: string) => {
    await fetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interestId, action: 'accepted' }) })
    fetchData()
    fetchCounts()
  }
  const handleDecline = async (interestId: string) => {
    await fetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interestId, action: 'declined' }) })
    fetchData()
    fetchCounts()
  }
  const handleSendInterest = async (profileId: string) => {
    await fetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: user!.id, receiverId: profileId }) })
    fetchData()
  }

  const handleConnectClick = (profileId: string) => {
    setConnectPopup({ profileId, rippling: true })
    setTimeout(() => setConnectPopup({ profileId, rippling: false }), 500)
  }
  const handleShortlist = async (profileId: string) => {
    await fetch('/api/activity/shortlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user!.id, profileId }) })
    fetchData()
  }

  if (!user) return null

  const tabs = [
    { id: 'daily', label: "Today's Matches", count: matchCount },
    { id: 'received', label: 'New Matches', count: counts.interestsReceived },
    { id: 'mutual', label: 'My Matches', count: counts.mutualMatches },
    { id: 'shortlist', label: 'Shortlisted', count: shortlistCount },
    { id: 'nearby', label: 'Near Me', count: 0 },
  ]

  const getTimeAgo = (ts?: string) => {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const currentProfile = data[currentIndex]?.profile

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12">
      <div className="max-w-6xl mx-auto px-4 xl:pr-80">
        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-purple-500/10 mb-6 glass-card !rounded-b-none !p-0 px-6 py-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-300 border-b-2 border-purple-400'
                  : 'text-purple-300/40 hover:text-purple-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-purple-300/50'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
          <button className="text-purple-300/30 text-sm hover:text-purple-200 ml-auto">More Matches</button>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium text-purple-200/60">
            Here are Today&apos;s top Matches for you. Connect with them now!
          </h2>
        </div>

        {loading ? (
          <div className="glass-card p-8 animate-pulse">
            <div className="flex gap-6">
              <div className="w-80 h-96 bg-purple-500/10 rounded-xl" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-purple-500/10 rounded w-1/3" />
                <div className="h-4 bg-purple-500/10 rounded w-1/2" />
                <div className="h-4 bg-purple-500/10 rounded w-2/3" />
              </div>
            </div>
          </div>
        ) : data.length > 0 && currentProfile ? (
          <div className="glass-card !p-0 overflow-hidden">
            {/* Time & Navigation */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-purple-300/40">Time left to Connect</span>
                <span className="text-sm font-mono text-pink-400 font-medium">22h : 44m : 22s</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-purple-300/40 hover:text-purple-200 disabled:opacity-30 text-sm"
                >
                  ← Prev
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentIndex >= data.length - 1}
                  className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center gap-1"
                >
                  Next →
                </button>
              </div>
            </div>

            <div ref={profileSlideRef} className="flex flex-col lg:flex-row">
              {/* Left: Large Photo */}
              <div className="lg:w-80 shrink-0 p-4">
                <div className="relative rounded-xl overflow-hidden">
                  {currentProfile.photos && currentProfile.photos.length > 0 ? (
                    <img src={currentProfile.photos[0]} alt={currentProfile.name} className="w-full h-80 object-cover rounded-xl" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentProfile.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'} alt={currentProfile.name} className="w-full h-80 object-cover rounded-xl" />
                  )}
                  {currentProfile.verified && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">VIP</span>
                  )}
                </div>
                {/* Verification Badge */}
                {currentProfile.verified && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <BadgeCheck className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-xs font-medium text-green-300">Verified profile</p>
                      <p className="text-[10px] text-purple-300/40">Selfie verified with Profile Photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Profile Details */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {currentProfile.name}
                      {currentProfile.premium && <Crown className="h-4 w-4 text-amber-400" />}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-purple-300/50">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                      </span>
                      <span>You & Her</span>
                      <span className="text-amber-400">⭐ Astro</span>
                    </div>
                  </div>
                  {/* Like / Connect Button */}
                  <div className="text-center relative">
                    <p className="text-xs text-purple-300/40 mb-1">Like this profile?</p>
                    <div className="relative inline-block">
                      <button
                        onClick={() => handleConnectClick(currentProfile.id)}
                        className="relative w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] overflow-hidden"
                      >
                        <Heart className="h-6 w-6 relative z-10" />
                        {connectPopup?.profileId === currentProfile.id && connectPopup.rippling && (
                          <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/60" />
                        )}
                      </button>

                      {/* Connect Options Popup */}
                      {connectPopup?.profileId === currentProfile.id && !connectPopup.rippling && (
                        <div className="absolute bottom-full right-0 mb-3 flex flex-col gap-1.5 items-end animate-fade-in-up z-50">
                          {/* Close */}
                          <button
                            onClick={() => setConnectPopup(null)}
                            className="self-end w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-purple-300/60 hover:text-white hover:bg-white/20 transition-colors mb-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => {
                              const msg = encodeURIComponent(`Hi ${currentProfile.name}! I found your profile on Soulmate Sync and would love to connect. 💜`)
                              window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank')
                              setConnectPopup(null)
                            }}
                            className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 bg-[#25D366] hover:bg-[#20b957] text-white text-xs font-semibold rounded-full shadow-lg transition-all hover:scale-105 whitespace-nowrap"
                          >
                            {/* WhatsApp SVG logo */}
                            <svg viewBox="0 0 32 32" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="16" fill="#25D366"/>
                              <path d="M23.5 8.5A10.45 10.45 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.48 3.65 1.4 5.24L5.5 26.5l5.4-1.38A10.46 10.46 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.43-3.0-7.5zm-7.5 16.1c-1.57 0-3.1-.42-4.44-1.2l-.32-.19-3.2.82.85-3.1-.21-.33A8.63 8.63 0 0 1 7.37 16c0-4.76 3.87-8.63 8.63-8.63 2.3 0 4.47.9 6.1 2.53a8.58 8.58 0 0 1 2.52 6.1c0 4.76-3.87 8.6-8.62 8.6zm4.72-6.45c-.26-.13-1.53-.75-1.77-.84-.23-.09-.4-.13-.57.13-.17.26-.65.84-.8 1.01-.14.17-.29.19-.55.06-.26-.13-1.1-.4-2.09-1.28-.77-.68-1.3-1.53-1.45-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.4-.46.13-.16.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.32-.23.26-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.25 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.57.2-1.07.14-1.17-.06-.1-.23-.16-.49-.29z" fill="white"/>
                            </svg>
                            WhatsApp
                          </button>

                          {/* Chat */}
                          <button
                            onClick={() => { router.push('/messages'); setConnectPopup(null) }}
                            className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-full shadow-lg transition-all hover:scale-105 whitespace-nowrap"
                          >
                            {/* Chat bubble icon */}
                            <svg viewBox="0 0 32 32" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="16" fill="#7c3aed"/>
                              <path d="M8 10.5A1.5 1.5 0 0 1 9.5 9h13A1.5 1.5 0 0 1 24 10.5v9A1.5 1.5 0 0 1 22.5 21H18l-3.5 3-3.5-3H9.5A1.5 1.5 0 0 1 8 19.5v-9z" fill="white"/>
                              <rect x="11" y="13" width="10" height="1.5" rx="0.75" fill="#7c3aed"/>
                              <rect x="11" y="16" width="7" height="1.5" rx="0.75" fill="#7c3aed"/>
                            </svg>
                            Chat Now
                          </button>

                          {/* Video Call */}
                          <button
                            onClick={() => { router.push(`/call?type=video&name=${encodeURIComponent(currentProfile.name)}`); setConnectPopup(null) }}
                            className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg transition-all hover:scale-105 whitespace-nowrap"
                          >
                            {/* Video camera icon */}
                            <svg viewBox="0 0 32 32" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="16" fill="#c026d3"/>
                              <rect x="7" y="11.5" width="12" height="9" rx="2" fill="white"/>
                              <path d="M19 14.2l6-3.2v10l-6-3.2v-3.6z" fill="white"/>
                            </svg>
                            Video Call
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info Grid */}
                <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-300/50">{currentProfile.age} yrs, {currentProfile.height || '5\' 6"'}</span>
                    <span className="text-purple-200">{currentProfile.maritalStatus || 'Never Married'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/50">{currentProfile.motherTongue || 'Hindi'}</span>
                    <span className="text-purple-200">{currentProfile.state || 'Maharashtra'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/50">{currentProfile.religion || 'Hindu'}</span>
                    <span className="text-purple-200">{currentProfile.occupation || 'Professional'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/50">{currentProfile.education || 'Graduate'}</span>
                    <span className="text-purple-200">{currentProfile.income || 'Not specified'}</span>
                  </div>
                </div>

                {/* Tabs: Detailed Profile / Partner Preferences */}
                <div className="mt-6 border-t border-purple-500/10 pt-4">
                  <div className="flex gap-6 border-b border-purple-500/10">
                    <button className="pb-2 text-sm font-medium text-purple-300 border-b-2 border-purple-400">Detailed Profile</button>
                    <button className="pb-2 text-sm font-medium text-purple-300/30 hover:text-purple-200">Partner Preferences</button>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                      <span className="text-purple-400/30 text-lg">&ldquo;</span> About {currentProfile.name}
                    </h3>
                    <p className="text-sm text-purple-300/60 mt-2 leading-relaxed">
                      {currentProfile.about || `${currentProfile.name} is a ${currentProfile.education || 'well-educated'} professional from ${currentProfile.city || 'India'}. Looking for a compatible life partner.`}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] bg-white/5 text-purple-300/50 px-2 py-1 rounded-full border border-purple-500/10">ID: SM{currentProfile.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card text-center py-16">
            <User className="h-12 w-12 text-purple-400/20 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No results yet</h3>
            <p className="text-sm text-purple-300/40 mb-4">
              {activeTab === 'daily' ? 'Check back tomorrow for new recommendations!' :
               activeTab === 'nearby' ? 'No profiles found in your area' :
               'Start browsing profiles to see activity here'}
            </p>
            <Link href="/search" className="inline-block btn-primary text-sm py-2.5 px-6">
              Browse Profiles
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
