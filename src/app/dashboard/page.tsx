'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Crown, MapPin, Briefcase, GraduationCap, Search, SlidersHorizontal, X, ChevronDown, Users, Eye, MessageCircle, TrendingUp, Calendar, Sparkles, BadgeCheck, Phone } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'
import { UserProfile } from '@/lib/database'
import { useSlideIn, useStaggerCards } from '@/hooks/useGsap'
import { useChatSidebar } from '@/context/ChatSidebarContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { isOpen: chatOpen } = useChatSidebar()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ ageMin: '18', ageMax: '60', religion: '', city: '', education: '' })
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'nearby' | 'premium'>('all')

  const [sentInterests, setSentInterests] = useState<Set<string>>(new Set())
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({ profileViews: 0, interestsReceived: 0, conversations: 0, profileScore: 0 })

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
      const res = await fetch(`/api/profiles?${params.toString()}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [user, filters])

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchProfiles()
    // Load already-sent interests
    fetch(`/api/activity/interests?userId=${user.id}&type=sent`)
      .then(r => r.json())
      .then(data => {
        if (data.interests) {
          setSentInterests(new Set(data.interests.map((i: { interest: { receiverId: string } }) => i.interest.receiverId)))
        }
      })
      .catch(() => {})
    // Load shortlisted profiles
    fetch(`/api/activity/shortlist?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.profiles) {
          setShortlisted(new Set(data.profiles.map((p: { profile: { id: string } }) => p.profile.id)))
        }
      })
      .catch(() => {})
    // Load dynamic stats
    fetch(`/api/activity/matches?userId=${user.id}&type=counts`)
      .then(r => r.json())
      .then(data => {
        if (data.counts) {
          setStats(prev => ({ ...prev, profileViews: data.counts.profileViews, interestsReceived: data.counts.interestsReceived }))
        }
      })
      .catch(() => {})
    fetch(`/api/messages?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setStats(prev => ({ ...prev, conversations: data.conversations?.length || 0 }))
      })
      .catch(() => {})
    // Profile completeness score
    const fields = [user.name, user.email, user.gender, user.age, (user as any).religion, (user as any).city, (user as any).education, (user as any).occupation, (user as any).about]
    const filled = fields.filter(Boolean).length
    setStats(prev => ({ ...prev, profileScore: Math.round((filled / fields.length) * 100) }))
  }, [user, router, fetchProfiles])

  const handleSendInterest = async (e: React.MouseEvent, profileId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setSentInterests(prev => new Set(prev).add(profileId))
    await fetch('/api/activity/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: user.id, receiverId: profileId })
    })
  }

  const handleShortlist = async (e: React.MouseEvent, profileId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    const isCurrently = shortlisted.has(profileId)
    setShortlisted(prev => {
      const next = new Set(prev)
      if (isCurrently) next.delete(profileId)
      else next.add(profileId)
      return next
    })
    await fetch('/api/activity/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, profileId, action: isCurrently ? 'remove' : 'add' })
    })
  }

  const headerRef = useSlideIn('left', 0.1)
  const filtersRef = useSlideIn('right', 0.2)
  const gridRef = useStaggerCards()

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12">
      <div className={`max-w-7xl mx-auto px-4 transition-all duration-300 ${chatOpen ? 'xl:pr-80' : 'xl:pr-4'}`}>
        
        {/* Header - What they're looking for */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" ref={headerRef}>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              Find Your {lookingFor}
            </h1>
            <p className="text-sm text-slate-500 dark:text-purple-300/50 mt-1">
              {profiles.length} {lookingFor === 'Bride' ? 'women' : 'men'} matching your preferences
            </p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 glass-card !p-0 !px-4 !py-2.5 text-sm text-slate-700 dark:text-purple-200 hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Profile Analytics Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="glass-card !p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.profileViews}</p>
            <p className="text-[10px] text-slate-500 dark:text-purple-300/40">Profile Views</p>
          </div>
          <div className="glass-card !p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-2">
              <HalfHeart className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.interestsReceived}</p>
            <p className="text-[10px] text-slate-500 dark:text-purple-300/40">Interests Received</p>
          </div>
          <div className="glass-card !p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.conversations}</p>
            <p className="text-[10px] text-slate-500 dark:text-purple-300/40">Conversations</p>
          </div>
          <div className="glass-card !p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.profileScore}%</p>
            <p className="text-[10px] text-slate-500 dark:text-purple-300/40">Profile Score</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-200 hover:bg-purple-500/20 transition-all whitespace-nowrap">
            <Search className="h-3.5 w-3.5" /> Search Profiles
          </Link>
          <Link href="/meeting" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-700 dark:text-pink-200 hover:bg-pink-500/20 transition-all whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" /> Schedule Meeting
          </Link>
          <Link href="/premium" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-200 hover:bg-amber-500/20 transition-all whitespace-nowrap">
            <Crown className="h-3.5 w-3.5" /> Go Premium
          </Link>
          <Link href="/verify" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-200 hover:bg-green-500/20 transition-all whitespace-nowrap">
            <BadgeCheck className="h-3.5 w-3.5" /> Get Verified
          </Link>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card mb-6 animate-fade-in-up" ref={filtersRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Filter Profiles</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">Age From</label>
                <input type="number" value={filters.ageMin} onChange={e => setFilters({...filters, ageMin: e.target.value})}
                  className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">Age To</label>
                <input type="number" value={filters.ageMax} onChange={e => setFilters({...filters, ageMax: e.target.value})}
                  className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">Religion</label>
                <select value={filters.religion} onChange={e => setFilters({...filters, religion: e.target.value})}
                  className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-400 outline-none">
                  <option value="">Any</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">City</label>
                <input type="text" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} placeholder="Any city"
                  className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/30 focus:border-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">Education</label>
                <select value={filters.education} onChange={e => setFilters({...filters, education: e.target.value})}
                  className="w-full mt-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-400 outline-none">
                  <option value="">Any</option>
                  <option value="B.Tech">B.Tech / B.E.</option>
                  <option value="MBBS">MBBS / MD</option>
                  <option value="MBA">MBA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="CA">CA</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>
            <button onClick={fetchProfiles} className="mt-4 btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {(['all', 'new', 'nearby', 'premium'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/5 text-purple-300/60 hover:bg-white/10 hover:text-purple-200'
              }`}>
              {tab === 'all' && `All ${lookingFor}s`}
              {tab === 'new' && 'Newly Joined'}
              {tab === 'nearby' && 'Near Me'}
              {tab === 'premium' && 'Premium'}
            </button>
          ))}
        </div>

        {/* Profiles Grid - THE MAIN CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} className="glass-card animate-pulse !p-0 overflow-hidden">
                <div className="h-52 bg-purple-500/10" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-purple-500/10 rounded w-2/3" />
                  <div className="h-4 bg-purple-500/10 rounded w-1/2" />
                  <div className="h-4 bg-purple-500/10 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-purple-400/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No profiles found</h3>
            <p className="text-sm text-purple-300/50">Try adjusting your filters to see more matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" ref={gridRef}>
            {profiles
              .filter(p => {
                if (activeTab === 'new') return true // show all as "new" for now
                if (activeTab === 'nearby') return !!p.city
                if (activeTab === 'premium') return p.premium
                return true
              })
              .map((profile) => (
              <Link key={profile.id} href={`/profile/${profile.id}`} 
                className="glass-card !p-0 overflow-hidden group hover:border-purple-400/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
                {/* Photo */}
                <div className="relative h-52 bg-gradient-to-br from-purple-900/40 to-dark-900">
                  {profile.photos && profile.photos.length > 0 ? (
                    <ProfileImage src={profile.photos[0]} name={profile.name} gender={profile.gender} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
                        <circle cx="50" cy="50" r="50" fill={profile.gender === 'Female' ? '#3b1d6e' : '#1e2a5e'} />
                        <circle cx="50" cy="35" r="18" fill={profile.gender === 'Female' ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.5)'} />
                        <ellipse cx="50" cy="78" rx="28" ry="24" fill={profile.gender === 'Female' ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.5)'} />
                      </svg>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {profile.verified && (
                      <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Verified</span>
                    )}
                    {profile.premium && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Crown className="h-2.5 w-2.5" /> Premium
                      </span>
                    )}
                  </div>
                  {/* Overlay gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                  {/* Name on photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white drop-shadow-lg">{profile.name}, {profile.age}</h3>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-300/60">
                    {profile.city && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>
                    )}
                  </div>
                  {profile.occupation && (
                    <p className="flex items-center gap-1.5 text-xs text-purple-300/60">
                      <Briefcase className="h-3 w-3 shrink-0" /> {profile.occupation}
                    </p>
                  )}
                  {profile.education && (
                    <p className="flex items-center gap-1.5 text-xs text-purple-300/60">
                      <GraduationCap className="h-3 w-3 shrink-0" /> {profile.education}
                    </p>
                  )}
                  {profile.religion && (
                    <p className="text-xs text-purple-300/40">{profile.religion}{profile.caste ? ` - ${profile.caste}` : ''}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {sentInterests.has(profile.id) ? (
                      <>
                        <a href={`https://wa.me/?text=${encodeURIComponent(`Hi ${profile.name}, I found your profile on Soulmate Sync and would like to connect!`)}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank" rel="noopener"
                          className="flex-1 py-2 text-xs bg-green-600/80 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
                          title="WhatsApp">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/call?type=audio&target=${profile.id}&name=${encodeURIComponent(profile.name)}`) }}
                          className="py-2 px-3 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/20" title="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/messages?chat=${profile.id}`) }}
                          className="py-2 px-3 text-xs bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/20" title="Chat">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => handleShortlist(e, profile.id)}
                          className={`py-2 px-3 text-xs rounded-lg transition-colors border ${shortlisted.has(profile.id) ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/5 text-purple-300 border-purple-500/20 hover:bg-white/10'}`} title="Shortlist">
                          <Star className={`h-3.5 w-3.5 ${shortlisted.has(profile.id) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleSendInterest(e, profile.id)} 
                          className="flex-1 py-2 text-xs bg-purple-600/80 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-1.5">
                          <HalfHeart className="h-3.5 w-3.5" /> Send Interest
                        </button>
                        <button onClick={(e) => handleShortlist(e, profile.id)}
                          className={`py-2 px-3 text-xs rounded-lg transition-colors border ${shortlisted.has(profile.id) ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/5 text-purple-300 border-purple-500/20 hover:bg-white/10'}`}>
                          <Star className={`h-3.5 w-3.5 ${shortlisted.has(profile.id) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileImage({ src, name, gender }: { src: string; name: string; gender?: string }) {
  const [err, setErr] = useState(false)
  if (err || !src) {
    return (
      <img
        src={gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'}
        alt="Avatar"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setErr(true)} />
}
