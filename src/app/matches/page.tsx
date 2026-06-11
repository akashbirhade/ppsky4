'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, Heart, Users, Star, MapPin, Clock, Send, Inbox, HandHeart, Bookmark, Brain, Sparkles, Crown, Check, X, User, BadgeCheck } from 'lucide-react'
import { useProfileSlide } from '@/hooks/useGsap'
import { useChatSidebar } from '@/context/ChatSidebarContext'

interface ProfileItem {
  profile: { id: string; name: string; age: number; city: string; state: string; education: string; occupation: string; height: string; verified: boolean; premium: boolean; gender: string; photos?: string[]; about?: string; religion?: string; motherTongue?: string; income?: string; maritalStatus?: string }
  timestamp?: string
  interest?: { id: string; status: string; timestamp: string }
}

export default function MatchesPage() {
  const { user, authFetch } = useAuth()
  const router = useRouter()
  const { isOpen: chatSidebarOpen } = useChatSidebar()
  const [activeTab, setActiveTab] = useState('daily')
  const [data, setData] = useState<ProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [counts, setCounts] = useState({ profileViews: 0, interestsReceived: 0, interestsSent: 0, shortlistedBy: 0, mutualMatches: 0, recentVisitors: 0 })
  const [shortlistCount, setShortlistCount] = useState(0)
  const { ref: profileSlideRef, animateSlide } = useProfileSlide()
  const [connectPopup, setConnectPopup] = useState<{ profileId: string; rippling: boolean } | null>(null)
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  // Countdown timer - resets daily at midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      const diff = end.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

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

  const fetchCounts = useCallback(async () => {
    try {
      const res = await authFetch(`/api/activity/matches?userId=${user!.id}&type=counts`)
      const d = await res.json()
      if (d.counts) setCounts(d.counts)
      // fetch user's own shortlist count
      const slRes = await authFetch(`/api/activity/shortlist?userId=${user!.id}`)
      const slData = await slRes.json()
      setShortlistCount(slData.profiles?.length || 0)
    } catch {}
  }, [authFetch, user])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let res
      switch (activeTab) {
        case 'daily':
          res = await authFetch(`/api/activity/matches?userId=${user!.id}&type=daily`)
          const daily = await res.json()
          const dailyProfiles = (daily.profiles || []).map((p: any) => ({ profile: p }))
          setData(dailyProfiles)
          setMatchCount(dailyProfiles.length)
          break
        case 'viewed':
          res = await authFetch(`/api/activity/views?userId=${user!.id}&type=viewed`)
          const viewed = await res.json()
          setData(viewed.profiles || [])
          break
        case 'visitors':
          res = await authFetch(`/api/activity/views?userId=${user!.id}&type=visitors`)
          const visitors = await res.json()
          setData(visitors.profiles || [])
          break
        case 'sent':
          res = await authFetch(`/api/activity/interests?userId=${user!.id}&type=sent`)
          const sent = await res.json()
          setData(sent.interests || [])
          break
        case 'received':
          res = await authFetch(`/api/activity/interests?userId=${user!.id}&type=received`)
          const received = await res.json()
          setData(received.interests || [])
          break
        case 'mutual':
          res = await authFetch(`/api/activity/interests?userId=${user!.id}&type=mutual`)
          const mutual = await res.json()
          setData((mutual.profiles || []).map((p: any) => ({ profile: p })))
          break
        case 'shortlist':
          res = await authFetch(`/api/activity/shortlist?userId=${user!.id}`)
          const sl = await res.json()
          setData(sl.profiles || [])
          break
        case 'nearby':
          res = await authFetch(`/api/activity/matches?userId=${user!.id}&type=nearby`)
          const nearby = await res.json()
          setData((nearby.profiles || []).map((p: any) => ({ profile: p })))
          break
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [activeTab, authFetch, user])

  useEffect(() => { if (user) { fetchCounts(); fetchData() } }, [user, fetchCounts, fetchData])

  const handleAccept = async (interestId: string) => {
    await authFetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interestId, action: 'accepted' }) })
    fetchData()
    fetchCounts()
  }
  const handleDecline = async (interestId: string) => {
    await authFetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interestId, action: 'declined' }) })
    fetchData()
    fetchCounts()
  }
  const handleSendInterest = async (profileId: string) => {
    await authFetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: user!.id, receiverId: profileId }) })
    fetchData()
  }

  const handleConnectClick = (profileId: string) => {
    setConnectPopup({ profileId, rippling: true })
    handleSendInterest(profileId)
    setTimeout(() => {
      setConnectPopup(null)
      setLikedProfiles(prev => new Set(prev).add(profileId))
    }, 500)
  }
  const handleShortlist = async (profileId: string) => {
    await authFetch('/api/activity/shortlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user!.id, profileId }) })
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
      <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 ${chatSidebarOpen ? 'xl:pr-80' : ''}`}>
        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-purple-500/10 mb-6 glass-card !rounded-b-none !p-0 px-6 py-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-300 border-b-2 border-purple-400'
                  : 'text-purple-300/60 hover:text-purple-200'
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
          <button className="text-purple-300/50 text-sm hover:text-purple-200 ml-auto">More Matches</button>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium text-purple-200/80">
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
                <span className="text-xs text-purple-300/60">Time left to Connect</span>
                <span className="text-sm font-mono text-pink-400 font-medium">{timeLeft}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-purple-300/60 hover:text-purple-200 disabled:opacity-30 text-sm"
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
                    // eslint-disable-next-line @next/next/no-img-element
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
                      <p className="text-[10px] text-purple-300/60">Selfie verified with Profile Photo</p>
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
                    <div className="flex items-center gap-3 mt-1 text-sm text-purple-300/70">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${currentProfile.gender ? 'bg-green-500' : 'bg-gray-400'}`}></span> {currentProfile.gender ? 'Online' : 'Offline'}
                      </span>
                      <span>You & {currentProfile.gender === 'Female' ? 'Her' : 'Him'}</span>
                      <span className="text-amber-400">⭐ Astro</span>
                    </div>
                  </div>
                  {/* Like / Connect / Accept / Decline Button */}
                  <div className="text-center">
                    {activeTab === 'received' && data[currentIndex]?.interest ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-purple-300/60 mb-1">Respond to Interest</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAccept(data[currentIndex].interest!.id)}
                            className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/40 transition-all hover:scale-110 shadow-lg"
                            title="Accept"
                          >
                            <Check className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => handleDecline(data[currentIndex].interest!.id)}
                            className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all hover:scale-110 shadow-lg"
                            title="Decline"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    ) : likedProfiles.has(currentProfile.id) ? (
                      <div className="flex items-center gap-2 animate-fade-in-up">
                        {/* WhatsApp */}
                        <button
                          onClick={() => { const msg = encodeURIComponent(`Hi ${currentProfile.name}! I found your profile on Soulmate Sync and would love to connect. 💜`); window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank') }}
                          className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20b957] flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
                          title="WhatsApp"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                        {/* Call */}
                        <button
                          onClick={() => router.push(`/call?type=audio&target=${currentProfile.id}&name=${encodeURIComponent(currentProfile.name)}`)}
                          className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/40 flex items-center justify-center text-blue-300 shadow-lg transition-all hover:scale-110"
                          title="Call"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </button>
                        {/* Chat */}
                        <button
                          onClick={() => router.push(`/messages?chat=${currentProfile.id}`)}
                          className="w-11 h-11 rounded-full bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg transition-all hover:scale-110"
                          title="Chat"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <p className="text-xs text-purple-300/60 mb-1">Like this profile?</p>
                        <button
                          onClick={() => handleConnectClick(currentProfile.id)}
                          className="relative w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)] overflow-hidden"
                        >
                          <Heart className="h-6 w-6 relative z-10" />
                          {connectPopup?.profileId === currentProfile.id && connectPopup.rippling && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/60" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info Grid */}
                <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-300/70">{currentProfile.age} yrs, {currentProfile.height || '5\' 6"'}</span>
                    <span className="text-purple-200">{currentProfile.maritalStatus || 'Never Married'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/70">{currentProfile.motherTongue || 'Hindi'}</span>
                    <span className="text-purple-200">{currentProfile.state || 'Maharashtra'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/70">{currentProfile.religion || 'Hindu'}</span>
                    <span className="text-purple-200">{currentProfile.occupation || 'Professional'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/70">{currentProfile.education || 'Graduate'}</span>
                    <span className="text-purple-200">{currentProfile.income || 'Not specified'}</span>
                  </div>
                </div>

                {/* Tabs: Detailed Profile / Partner Preferences */}
                <div className="mt-6 border-t border-purple-500/10 pt-4">
                  <div className="flex gap-6 border-b border-purple-500/10">
                    <button className="pb-2 text-sm font-medium text-purple-300 border-b-2 border-purple-400">Detailed Profile</button>
                    <button className="pb-2 text-sm font-medium text-purple-300/50 hover:text-purple-200">Partner Preferences</button>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                      <span className="text-purple-400/30 text-lg">&ldquo;</span> About {currentProfile.name}
                    </h3>
                    <p className="text-sm text-purple-300/80 mt-2 leading-relaxed">
                      {currentProfile.about || `${currentProfile.name} is a ${currentProfile.education || 'well-educated'} professional from ${currentProfile.city || 'India'}. Looking for a compatible life partner.`}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] bg-white/5 text-purple-300/70 px-2 py-1 rounded-full border border-purple-500/10">ID: SM{currentProfile.id.slice(0, 8).toUpperCase()}</span>
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
            <p className="text-sm text-purple-300/60 mb-4">
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
