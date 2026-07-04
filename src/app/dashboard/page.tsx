'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Crown, MapPin, Briefcase, Search, SlidersHorizontal, X, ChevronRight, Users, Eye, MessageCircle, TrendingUp, Sparkles, BadgeCheck } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'
import ProfileCompletion from '@/components/ProfileCompletion'
import ProfileMiniCard from '@/components/ProfileMiniCard'
import { UserProfile } from '@/lib/database'
import { useSlideIn } from '@/hooks/useGsap'
import { useChatSidebar } from '@/context/ChatSidebarContext'

export default function DashboardPage() {
  const { user, authFetch, updateUserData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { isOpen: chatOpen } = useChatSidebar()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [nearbyProfiles, setNearbyProfiles] = useState<UserProfile[]>([])
  const [dailyPicks, setDailyPicks] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ ageMin: '18', ageMax: '60', religion: '', city: '', education: '' })
  const [sentInterests, setSentInterests] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({ profileViews: 0, interestsReceived: 0, conversations: 0 })

  const profileScore = useMemo(() => {
    if (!user) return 0
    const fields = [user.name, user.email, user.gender, user.age, user.religion, user.city, user.education, user.occupation, user.about]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [user])

  const lookingFor = user?.gender === 'Male' ? 'Bride' : 'Groom'

  const fetchProfiles = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const oppositeGender = user.gender === 'Male' ? 'Female' : 'Male'
      const params = new URLSearchParams({ gender: oppositeGender })
      params.set('excludeId', user.id)
      if (filters.ageMin) params.set('ageMin', filters.ageMin)
      if (filters.ageMax) params.set('ageMax', filters.ageMax)
      if (filters.religion) params.set('religion', filters.religion)
      if (filters.city) params.set('city', filters.city)
      if (filters.education) params.set('education', filters.education)
      const res = await authFetch(`/api/profiles?${params.toString()}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [user, filters, authFetch])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    fetchProfiles()
  }, [user?.id, authLoading, router, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    authFetch(`/api/activity/matches?userId=${user.id}&type=nearby`).then(r => r.json()).then(d => setNearbyProfiles(d.profiles || [])).catch(() => {})
    authFetch(`/api/activity/matches?userId=${user.id}&type=daily`).then(r => r.json()).then(d => setDailyPicks(d.profiles || [])).catch(() => {})
    authFetch(`/api/activity/interests?userId=${user.id}&type=sent`).then(r => r.json()).then(d => { if (d.interests) setSentInterests(new Set(d.interests.map((i: any) => i.interest.receiverId))) }).catch(() => {})
    authFetch(`/api/activity/matches?userId=${user.id}&type=counts`).then(r => r.json()).then(d => { if (d.counts) setStats(prev => ({ ...prev, profileViews: d.counts.profileViews, interestsReceived: d.counts.interestsReceived })) }).catch(() => {})
    authFetch(`/api/messages?userId=${user.id}`).then(r => r.json()).then(d => setStats(prev => ({ ...prev, conversations: d.conversations?.length || 0 }))).catch(() => {})
    authFetch(`/api/profiles/${user.id}`).then(r => r.json()).then(d => { if (d.profile) updateUserData({ religion: d.profile.religion, education: d.profile.education, occupation: d.profile.occupation, city: d.profile.city, about: d.profile.about, height: d.profile.height, photos: d.profile.photos, partnerPreferences: d.profile.partnerPreferences, verified: d.profile.verified }) }).catch(() => {})
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendInterest = async (e: React.MouseEvent, profileId: string) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    setSentInterests(prev => new Set(prev).add(profileId))
    await authFetch('/api/activity/interests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: user.id, receiverId: profileId }) })
  }

  const headerRef = useSlideIn('left', 0.1)
  const premiumProfiles = useMemo(() => profiles.filter(p => p.premium), [profiles])
  const sameFieldProfiles = useMemo(() => {
    if (!user?.occupation) return []
    const kw = user.occupation.toLowerCase().split(' ')[0]
    return profiles.filter(p => p.occupation && p.occupation.toLowerCase().includes(kw))
  }, [profiles, user?.occupation])
  const verifiedProfiles = useMemo(() => profiles.filter(p => p.verified), [profiles])

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-mesh pt-20 sm:pt-[104px] pb-20">
      <div className={`max-w-7xl mx-auto px-3 sm:px-4 transition-all duration-300 ${chatOpen ? 'xl:pr-80' : 'xl:pr-4'}`}>
        {user && <ProfileCompletion user={user} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-4" ref={headerRef}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" /> Find Your {lookingFor}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300/50 mt-0.5">{profiles.length} matches available</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"><Search className="h-4 w-4" /></Link>
            <button onClick={() => setShowFilters(!showFilters)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Link href="/matches" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 whitespace-nowrap hover:bg-purple-500/20 transition-all"><Eye className="h-3.5 w-3.5 text-purple-400" /><span className="text-sm font-bold text-slate-800 dark:text-white">{stats.profileViews}</span><span className="text-[10px] text-slate-500 dark:text-purple-300/40">Views</span></Link>
          <Link href="/matches" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 whitespace-nowrap hover:bg-pink-500/20 transition-all"><HalfHeart className="h-3.5 w-3.5" /><span className="text-sm font-bold text-slate-800 dark:text-white">{stats.interestsReceived}</span><span className="text-[10px] text-slate-500 dark:text-purple-300/40">Interests</span></Link>
          <Link href="/messages" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 whitespace-nowrap hover:bg-blue-500/20 transition-all"><MessageCircle className="h-3.5 w-3.5 text-blue-400" /><span className="text-sm font-bold text-slate-800 dark:text-white">{stats.conversations}</span><span className="text-[10px] text-slate-500 dark:text-purple-300/40">Chats</span></Link>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 whitespace-nowrap"><TrendingUp className="h-3.5 w-3.5 text-green-400" /><span className="text-sm font-bold text-slate-800 dark:text-white">{profileScore}%</span><span className="text-[10px] text-slate-500 dark:text-purple-300/40">Score</span></div>
          <Link href="/premium" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 whitespace-nowrap hover:bg-amber-500/20 transition-all"><Crown className="h-3.5 w-3.5 text-amber-400" /><span className="text-[10px] text-amber-700 dark:text-amber-200 font-medium">Go Premium</span></Link>
        </div>

        {/* Mobile Filters */}
        {showFilters && typeof document !== 'undefined' && createPortal(
          <div className="md:hidden"><div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowFilters(false)} /><div className="fixed inset-x-0 bottom-0 z-[9999] rounded-t-2xl p-5 pb-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-purple-500/20 shadow-2xl"><div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-purple-500/30" /><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-800 dark:text-white">Filter Profiles</h3><button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-5 w-5" /></button></div><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase">Age From</label><input type="number" value={filters.ageMin} onChange={e => setFilters({...filters, ageMin: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none" /></div><div><label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase">Age To</label><input type="number" value={filters.ageMax} onChange={e => setFilters({...filters, ageMax: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none" /></div><div><label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase">Religion</label><select value={filters.religion} onChange={e => setFilters({...filters, religion: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none"><option value="">Any</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option></select></div><div><label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase">City</label><input type="text" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} placeholder="Any" className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none" /></div></div><button onClick={() => { fetchProfiles(); setShowFilters(false) }} className="mt-4 w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"><Search className="h-4 w-4" /> Apply Filters</button></div></div>,
          document.body
        )}

        {/* Desktop Filters */}
        {showFilters && (<div className="hidden md:block glass-card mb-5"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-800 dark:text-white">Filter</h3><button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-5 w-5" /></button></div><div className="grid grid-cols-5 gap-3"><div><label className="text-[10px] text-slate-500 uppercase">Age From</label><input type="number" value={filters.ageMin} onChange={e => setFilters({...filters, ageMin: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none" /></div><div><label className="text-[10px] text-slate-500 uppercase">Age To</label><input type="number" value={filters.ageMax} onChange={e => setFilters({...filters, ageMax: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none" /></div><div><label className="text-[10px] text-slate-500 uppercase">Religion</label><select value={filters.religion} onChange={e => setFilters({...filters, religion: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none"><option value="">Any</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option></select></div><div><label className="text-[10px] text-slate-500 uppercase">City</label><input type="text" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} placeholder="Any" className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none" /></div><div><label className="text-[10px] text-slate-500 uppercase">Education</label><select value={filters.education} onChange={e => setFilters({...filters, education: e.target.value})} className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none"><option value="">Any</option><option value="B.Tech">B.Tech</option><option value="MBBS">MBBS</option><option value="MBA">MBA</option><option value="CA">CA</option></select></div></div><button onClick={() => { fetchProfiles(); setShowFilters(false) }} className="mt-3 btn-primary text-sm py-2 px-6 flex items-center gap-2"><Search className="h-4 w-4" /> Apply</button></div>)}

        {/* SECTIONS */}
        {loading ? (
          <div className="space-y-6">{[1,2,3].map(s => (<div key={s}><div className="h-5 w-40 bg-purple-500/10 rounded mb-3" /><div className="flex gap-3 overflow-hidden">{[1,2,3,4].map(i => (<div key={i} className="w-[140px] sm:w-[160px] shrink-0 rounded-2xl border border-slate-200/30 dark:border-purple-500/10 overflow-hidden animate-pulse"><div className="h-[150px] sm:h-[170px] bg-purple-500/5" /><div className="p-2 space-y-1.5"><div className="h-3 bg-purple-500/5 rounded w-3/4" /><div className="h-3 bg-purple-500/5 rounded w-1/2" /></div></div>))}</div></div>))}</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20"><Users className="h-16 w-16 text-purple-400/30 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No profiles found</h3><p className="text-sm text-slate-500 dark:text-purple-300/50">Try adjusting your filters</p></div>
        ) : (
          <div className="space-y-6">
            {dailyPicks.length > 0 && (<Section title="Today's Top Picks" icon={<Sparkles className="h-4 w-4 text-amber-400" />} count={dailyPicks.length} href="/search">{dailyPicks.slice(0, 8).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>)}

            {sameFieldProfiles.length > 0 && (<Section title={`In Your Field${user.occupation ? ' \u2022 ' + user.occupation.split(' ')[0] : ''}`} icon={<Briefcase className="h-4 w-4 text-blue-400" />} count={sameFieldProfiles.length} href="/search">{sameFieldProfiles.slice(0, 8).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>)}

            {nearbyProfiles.length > 0 && (<Section title={`Near You${user.city ? ' \u2022 ' + user.city : ''}`} icon={<MapPin className="h-4 w-4 text-green-400" />} count={nearbyProfiles.length} href="/search">{nearbyProfiles.slice(0, 8).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>)}

            {premiumProfiles.length > 0 && (<Section title="Premium Profiles" icon={<Crown className="h-4 w-4 text-amber-400" />} count={premiumProfiles.length} href="/search">{premiumProfiles.slice(0, 8).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>)}

            {verifiedProfiles.length > 0 && (<Section title="Verified Profiles" icon={<BadgeCheck className="h-4 w-4 text-green-400" />} count={verifiedProfiles.length} href="/search">{verifiedProfiles.slice(0, 8).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>)}

            <Section title="Newly Joined" icon={<Sparkles className="h-4 w-4 text-pink-400" />} count={profiles.length} href="/search">{profiles.slice(0, 10).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}</Section>

            {/* All Profiles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2"><Users className="h-4 w-4 text-purple-400" /> All Profiles <span className="text-[10px] text-slate-400 dark:text-purple-300/40 font-normal ml-1">{profiles.length}</span></h2>
                <Link href="/search" className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5">Advanced Search <ChevronRight className="h-3 w-3" /></Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {profiles.slice(0, 20).map(p => (<ProfileMiniCard key={p.id} profile={p} onClick={() => router.push(`/profile/${p.id}`)} onSendInterest={(e) => handleSendInterest(e, p.id)} interestSent={sentInterests.has(p.id)} />))}
              </div>
              {profiles.length > 20 && (<div className="text-center mt-4"><Link href="/search" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-sm text-purple-700 dark:text-purple-300 hover:bg-purple-600/20 transition-all">View All {profiles.length} Profiles <ChevronRight className="h-4 w-4" /></Link></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon, count, href, children }: { title: string; icon: React.ReactNode; count: number; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">{icon} {title} <span className="text-[10px] text-slate-400 dark:text-purple-300/40 font-normal">{count}</span></h2>
        <Link href={href} className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5">View All <ChevronRight className="h-3 w-3" /></Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>{children}</div>
    </div>
  )
}
