'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Search, Filter, Brain, Sparkles, MapPin, Clock, Users, Zap, Star, Save, SlidersHorizontal, BadgeCheck, Crown, BookOpen } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'
import ProfileCard from '@/components/ProfileCard'
import { UserProfile } from '@/lib/database'

type FilterTab = 'all' | 'new' | 'daily' | 'myMatch' | 'nearMe' | 'moreMatch' | 'premium' | 'verified' | 'recentActive'

function AgeRangeSlider({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const RANGE_MIN = 18, RANGE_MAX = 65
  const trackRef = useRef<HTMLDivElement>(null)
  const minPercent = ((min - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  const maxPercent = ((max - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-purple-300/50">Age Range</span>
        <span className="text-xs font-semibold text-purple-200 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/20">{min} – {max} yrs</span>
      </div>
      <div className="relative h-10 flex items-center" ref={trackRef}>
        <div className="absolute w-full h-1.5 bg-purple-500/10 rounded-full" />
        <div className="absolute h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={min} onChange={e => { const v = Math.min(Number(e.target.value), max - 1); onChange(v, max) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: min >= max - 1 ? 5 : 3 }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={max} onChange={e => { const v = Math.max(Number(e.target.value), min + 1); onChange(min, v) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between text-[10px] text-purple-300/30 mt-1 px-0.5">
        {[18, 25, 30, 35, 40, 50, 65].map(v => (<span key={v}>{v}</span>))}
      </div>
    </div>
  )
}

function HeightRangeSlider({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const RANGE_MIN = 48, RANGE_MAX = 78
  const inchesToFeet = (i: number) => `${Math.floor(i / 12)}'${i % 12}"`
  const minPercent = ((min - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  const maxPercent = ((max - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-purple-300/50">Height Range</span>
        <span className="text-xs font-semibold text-purple-200 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/20">{inchesToFeet(min)} – {inchesToFeet(max)}</span>
      </div>
      <div className="relative h-10 flex items-center">
        <div className="absolute w-full h-1.5 bg-purple-500/10 rounded-full" />
        <div className="absolute h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={min} onChange={e => { const v = Math.min(Number(e.target.value), max - 1); onChange(v, max) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: min >= max - 1 ? 5 : 3 }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={max} onChange={e => { const v = Math.max(Number(e.target.value), min + 1); onChange(min, v) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between text-[10px] text-purple-300/30 mt-1 px-0.5">
        {[48, 54, 60, 66, 72, 78].map(v => (<span key={v}>{inchesToFeet(v)}</span>))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [ageSaved, setAgeSaved] = useState(false)
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [profileIdSearch, setProfileIdSearch] = useState('')
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const oppositeGender = user?.gender === 'Male' ? 'Female' : 'Male'

  const defaultAgeMin = user?.gender === 'Male' ? 18 : 22
  const defaultAgeMax = user?.gender === 'Male' ? 35 : 40
  const [ageRange, setAgeRange] = useState<[number, number]>([defaultAgeMin, defaultAgeMax])
  const [heightRange, setHeightRange] = useState<[number, number]>([54, 72])
  const [filters, setFilters] = useState({
    religion: '', city: '', education: '', occupation: '', community: '',
    motherTongue: '', income: '', manglik: '', maritalStatus: '',
    onlineNow: false, verifiedOnly: false, premiumOnly: false, withPhoto: false
  })

  useEffect(() => {
    if (user) {
      fetchProfiles()
      const saved = localStorage.getItem(`savedSearches_${user.id}`)
      if (saved) setSavedSearches(JSON.parse(saved))
    }
  }, [user])

  const fetchProfiles = async (f?: typeof filters, age?: [number, number]) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const sf = f || filters
      const [amin, amax] = age || ageRange
      if (sf.religion) params.set('religion', sf.religion)
      if (sf.city) params.set('city', sf.city)
      if (sf.education) params.set('education', sf.education)
      if (sf.occupation) params.set('occupation', sf.occupation)
      if (sf.motherTongue) params.set('motherTongue', sf.motherTongue)
      if (sf.income) params.set('income', sf.income)
      if (sf.community) params.set('community', sf.community)
      if (amin) params.set('ageMin', String(amin))
      if (amax) params.set('ageMax', String(amax))
      params.set('gender', oppositeGender)
      if (user?.id) params.set('excludeId', user.id)
      const res = await fetch(`/api/profiles?${params.toString()}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const saveAgeRange = useCallback((min: number, max: number) => {
    if (!user?.id) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/profiles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, partnerAgeMin: String(min), partnerAgeMax: String(max) })
        })
        setAgeSaved(true)
        setTimeout(() => setAgeSaved(false), 2000)
      } catch {}
    }, 800)
  }, [user?.id])

  const handleAgeChange = (min: number, max: number) => { setAgeRange([min, max]); fetchProfiles(filters, [min, max]); saveAgeRange(min, max) }
  const handleHeightChange = (min: number, max: number) => { setHeightRange([min, max]) }
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchProfiles() }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFilters(prev => ({ ...prev, [e.target.name]: value }))
  }

  const handleProfileIdSearch = () => { if (profileIdSearch.trim()) window.location.href = `/profile/${profileIdSearch.trim()}` }

  const saveCurrentSearch = () => {
    if (!user?.id) return
    const label = [filters.religion, filters.city, filters.education, `${ageRange[0]}-${ageRange[1]} yrs`].filter(Boolean).join(', ') || 'All'
    const updated = [...savedSearches, label].slice(-5)
    setSavedSearches(updated)
    localStorage.setItem(`savedSearches_${user.id}`, JSON.stringify(updated))
  }

  const clearFilters = () => {
    const empty = { religion: '', city: '', education: '', occupation: '', community: '', motherTongue: '', income: '', manglik: '', maritalStatus: '', onlineNow: false, verifiedOnly: false, premiumOnly: false, withPhoto: false }
    setFilters(empty)
    setAgeRange([defaultAgeMin, defaultAgeMax])
    setHeightRange([54, 72])
    fetchProfiles(empty, [defaultAgeMin, defaultAgeMax])
  }

  const activeFilterCount = Object.entries(filters).filter(([, v]) => typeof v === 'boolean' ? v : v !== '').length

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12">
      <div className="relative py-4 border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: 'all' as FilterTab, icon: Filter, label: 'All' },
              { id: 'new' as FilterTab, icon: Sparkles, label: 'New' },
              { id: 'daily' as FilterTab, icon: Clock, label: 'Daily Picks' },
              { id: 'myMatch' as FilterTab, icon: HalfHeart, label: 'My Match' },
              { id: 'nearMe' as FilterTab, icon: MapPin, label: 'Near Me' },
              { id: 'moreMatch' as FilterTab, icon: Users, label: 'More Match' },
              { id: 'premium' as FilterTab, icon: Crown, label: 'Premium' },
              { id: 'verified' as FilterTab, icon: BadgeCheck, label: 'Verified' },
              { id: 'recentActive' as FilterTab, icon: Zap, label: 'Recently Active' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-purple-600/40 text-white border border-purple-500/40 shadow-[0_0_12px_rgba(147,51,234,0.2)]' : 'bg-white/[0.03] text-purple-300/50 border border-purple-500/10 hover:bg-purple-500/10 hover:text-purple-200'
                }`}>
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="glass-card p-4 animate-fade-in-up delay-200" style={{opacity:0}}>
            <div className="flex flex-wrap gap-3">
              <select name="religion" value={filters.religion} onChange={handleChange} className="input-field flex-1 min-w-[130px]">
                <option value="" className="bg-dark-900">Any Religion</option>
                {['Hindu','Muslim','Sikh','Christian','Jain','Buddhist','Parsi'].map(r => (<option key={r} value={r} className="bg-dark-900">{r}</option>))}
              </select>
              <select name="community" value={filters.community} onChange={handleChange} className="input-field flex-1 min-w-[130px]">
                <option value="" className="bg-dark-900">Any Community</option>
                {['Brahmin','Rajput','Maratha','Kayastha','Agarwal','Jat','Patel','Reddy','Nair','Iyer','Khatri','Gupta'].map(c => (<option key={c} value={c} className="bg-dark-900">{c}</option>))}
              </select>
              <input type="text" name="city" value={filters.city} onChange={handleChange} placeholder="City / Location..." className="input-field flex-1 min-w-[120px]" />
              <button type="submit" className="btn-primary px-6 flex items-center gap-2 text-sm"><Search className="h-4 w-4" /> Search</button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary px-4 flex items-center gap-2 text-sm relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 text-white text-[9px] rounded-full flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>

            {/* Profile ID Search & Saved Searches */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-purple-500/10">
              <div className="flex items-center gap-2 flex-1">
                <input type="text" value={profileIdSearch} onChange={e => setProfileIdSearch(e.target.value)} placeholder="Profile ID..." className="input-field text-sm flex-1 max-w-[180px]" />
                <button type="button" onClick={handleProfileIdSearch} className="text-xs text-purple-300 hover:text-white transition-colors px-3 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">Go</button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={saveCurrentSearch} className="text-xs text-purple-300/60 hover:text-purple-200 flex items-center gap-1 px-3 py-2 bg-purple-500/5 rounded-xl border border-purple-500/10 transition-all hover:bg-purple-500/10">
                  <Save className="h-3 w-3" /> Save
                </button>
                {savedSearches.length > 0 && (
                  <button type="button" onClick={() => setShowSavedSearches(!showSavedSearches)} className="text-xs text-purple-300/60 hover:text-purple-200 flex items-center gap-1 px-3 py-2 bg-purple-500/5 rounded-xl border border-purple-500/10 transition-all hover:bg-purple-500/10">
                    <BookOpen className="h-3 w-3" /> Saved ({savedSearches.length})
                  </button>
                )}
              </div>
            </div>

            {showSavedSearches && savedSearches.length > 0 && (
              <div className="mt-3 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <p className="text-[10px] text-purple-300/40 uppercase tracking-wider mb-2">Saved Searches</p>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((s, i) => (<span key={i} className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-200 rounded-full border border-purple-500/20">{s}</span>))}
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-purple-500/10 animate-fade-in-up">
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div className="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <AgeRangeSlider min={ageRange[0]} max={ageRange[1]} onChange={handleAgeChange} />
                    {ageSaved && <div className="flex items-center gap-1.5 mt-2 text-[10px] text-green-400"><Save className="w-3 h-3" /> Saved</div>}
                  </div>
                  <div className="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <HeightRangeSlider min={heightRange[0]} max={heightRange[1]} onChange={handleHeightChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  <select name="education" value={filters.education} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Any Education</option>
                    {['MBA','B.Tech/B.E','MBBS','CA','M.Tech','B.Sc','M.Sc','LLB','PhD','Diploma'].map(e => (<option key={e} value={e} className="bg-dark-900">{e}</option>))}
                  </select>
                  <select name="occupation" value={filters.occupation} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Any Occupation</option>
                    {['Software Engineer','Doctor','Business Owner','Government Job','Teacher','Lawyer','CA/Finance','Engineer','Manager','Scientist'].map(o => (<option key={o} value={o} className="bg-dark-900">{o}</option>))}
                  </select>
                  <select name="income" value={filters.income} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Any Income</option>
                    {['Below 5 LPA','5-10 LPA','10-15 LPA','15-20 LPA','20-30 LPA','30-50 LPA','50+ LPA'].map(i => (<option key={i} value={i} className="bg-dark-900">{i}</option>))}
                  </select>
                  <select name="motherTongue" value={filters.motherTongue} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Any Mother Tongue</option>
                    {['Hindi','English','Marathi','Tamil','Telugu','Kannada','Gujarati','Punjabi','Bengali','Malayalam','Urdu'].map(l => (<option key={l} value={l} className="bg-dark-900">{l}</option>))}
                  </select>
                  <select name="manglik" value={filters.manglik} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Manglik Status</option>
                    <option value="yes" className="bg-dark-900">Manglik</option>
                    <option value="no" className="bg-dark-900">Non-Manglik</option>
                  </select>
                  <select name="maritalStatus" value={filters.maritalStatus} onChange={handleChange} className="input-field text-sm">
                    <option value="" className="bg-dark-900">Marital Status</option>
                    <option value="neverMarried" className="bg-dark-900">Never Married</option>
                    <option value="divorced" className="bg-dark-900">Divorced</option>
                    <option value="widowed" className="bg-dark-900">Widowed</option>
                  </select>
                </div>

                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer hover:bg-purple-500/10 transition-all">
                    <input type="checkbox" name="onlineNow" checked={filters.onlineNow} onChange={handleChange} className="w-3.5 h-3.5 rounded accent-purple-500" />
                    <span className="text-xs text-purple-200">Online Now</span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer hover:bg-purple-500/10 transition-all">
                    <input type="checkbox" name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleChange} className="w-3.5 h-3.5 rounded accent-purple-500" />
                    <span className="text-xs text-purple-200">Verified Only</span>
                    <BadgeCheck className="h-3 w-3 text-green-400" />
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer hover:bg-purple-500/10 transition-all">
                    <input type="checkbox" name="premiumOnly" checked={filters.premiumOnly} onChange={handleChange} className="w-3.5 h-3.5 rounded accent-purple-500" />
                    <span className="text-xs text-purple-200">Premium Only</span>
                    <Crown className="h-3 w-3 text-amber-400" />
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer hover:bg-purple-500/10 transition-all">
                    <input type="checkbox" name="withPhoto" checked={filters.withPhoto} onChange={handleChange} className="w-3.5 h-3.5 rounded accent-purple-500" />
                    <span className="text-xs text-purple-200">With Photo</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={clearFilters} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 hover:bg-red-500/20 transition-all">Clear All</button>
                  <button type="submit" className="btn-primary px-6 py-2 text-sm flex items-center gap-2"><Search className="h-3.5 w-3.5" /> Apply Filters</button>
                </div>
              </div>
            )}
          </form>

          {/* Smart Suggestions */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <Brain className="h-3.5 w-3.5 text-purple-400/60 shrink-0" />
            <span className="text-[10px] text-purple-300/40 shrink-0">AI Suggestions:</span>
            {['Highly Compatible', 'Same City', 'Similar Education', 'New This Week', 'Top Matches'].map(s => (
              <button key={s} className="text-[10px] px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 text-purple-300/50 hover:text-purple-200 hover:bg-purple-500/10 whitespace-nowrap transition-all">{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-purple-300/50">
            {loading ? 'Searching...' : `${profiles.length} profiles found`}
            {activeFilterCount > 0 && !loading && <span className="ml-2 text-purple-400">({activeFilterCount} filters)</span>}
          </p>
          <div className="flex items-center gap-3">
            <select className="text-[11px] bg-transparent border border-purple-500/10 rounded-lg px-2 py-1 text-purple-300/50 outline-none">
              <option>Relevance</option>
              <option>Newest First</option>
              <option>Last Active</option>
              <option>Age: Low to High</option>
            </select>
            <div className="flex items-center gap-1.5 text-[10px] text-purple-400/40"><Brain className="h-3.5 w-3.5" /> AI-Ranked</div>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (<div key={i} className="glass-card animate-pulse"><div className="h-44 bg-purple-500/5 rounded-2xl mb-3" /><div className="h-4 bg-purple-500/5 rounded w-3/4 mb-2" /><div className="h-3 bg-purple-500/5 rounded w-1/2" /></div>))}
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, i) => (
              <div key={profile.id} className="animate-fade-in-up" style={{animationDelay: `${i * 0.08}s`, opacity: 0}}>
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <HalfHeart className="h-16 w-16 opacity-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No profiles found</h3>
            <p className="text-sm text-purple-300/40">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 btn-secondary text-sm px-6 py-2">Reset Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}