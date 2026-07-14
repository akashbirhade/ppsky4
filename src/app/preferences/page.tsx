'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, User, Users, MapPin, GraduationCap, Settings, Check, ArrowLeft, Save } from 'lucide-react'

type Tab = 'basic' | 'community' | 'location' | 'education' | 'other'

// Height <-> inches helpers for the range sliders (stored as e.g. 5'10")
const feetStrToInches = (s: string): number => {
  const m = s.match(/(\d+)'(\d+)/)
  return m ? parseInt(m[1], 10) * 12 + parseInt(m[2], 10) : 60
}
const inchesToFeetStr = (i: number): string => `${Math.floor(i / 12)}'${i % 12}"`

function AgeRangeSlider({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const RANGE_MIN = 18, RANGE_MAX = 65
  const minPercent = ((min - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  const maxPercent = ((max - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 dark:text-purple-300/50">Age Range</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-purple-200 bg-teal-100/50 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-purple-500/20">{min} – {max} yrs</span>
      </div>
      <div className="relative h-10 flex items-center">
        <div className="absolute w-full h-1.5 bg-teal-50 dark:bg-purple-500/10 rounded-full" />
        <div className="absolute h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={min} onChange={e => { const v = Math.min(Number(e.target.value), max - 1); onChange(v, max) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: min >= max - 1 ? 5 : 3 }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={max} onChange={e => { const v = Math.max(Number(e.target.value), min + 1); onChange(min, v) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-300 dark:text-purple-300/30 mt-1 px-0.5">
        {[18, 25, 30, 35, 40, 50, 65].map(v => (<span key={v}>{v}</span>))}
      </div>
    </div>
  )
}

function HeightRangeSlider({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const RANGE_MIN = 48, RANGE_MAX = 78
  const minPercent = ((min - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  const maxPercent = ((max - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 dark:text-purple-300/50">Height Range</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-purple-200 bg-teal-100/50 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-purple-500/20">{inchesToFeetStr(min)} – {inchesToFeetStr(max)}</span>
      </div>
      <div className="relative h-10 flex items-center">
        <div className="absolute w-full h-1.5 bg-teal-50 dark:bg-purple-500/10 rounded-full" />
        <div className="absolute h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={min} onChange={e => { const v = Math.min(Number(e.target.value), max - 1); onChange(v, max) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: min >= max - 1 ? 5 : 3 }} />
        <input type="range" min={RANGE_MIN} max={RANGE_MAX} value={max} onChange={e => { const v = Math.max(Number(e.target.value), min + 1); onChange(min, v) }} className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer age-range-input" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-300 dark:text-purple-300/30 mt-1 px-0.5">
        {[48, 54, 60, 66, 72, 78].map(v => (<span key={v}>{inchesToFeetStr(v)}</span>))}
      </div>
    </div>
  )
}

export default function PreferencesPage() {
  const { user, updateUserData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [prefs, setPrefs] = useState({
    // Basic
    ageMin: '22',
    ageMax: '30',
    heightMin: "5'0\"",
    heightMax: "5'10\"",
    maritalStatus: 'Never Married',
    // Community
    religion: 'Hindu',
    community: 'Any',
    motherTongue: 'Hindi',
    // Location
    country: 'India',
    state: 'Any',
    city: '',
    // Education & Career
    qualification: 'Any Graduate',
    workingWith: 'Private Company',
    profession: 'IT / Software',
    annualIncome: '₹5-10 Lakhs',
    // Other
    managedBy: 'Self',
    diet: 'Vegetarian',
  })

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])

  // Load previously saved preferences from the account (plus any local draft) on mount
  useEffect(() => {
    if (!user) return
    setPrefs(prev => {
      const merged = { ...prev }
      const pp = user.partnerPreferences
      if (pp) {
        if (pp.ageMin) merged.ageMin = String(pp.ageMin)
        if (pp.ageMax) merged.ageMax = String(pp.ageMax)
        if (pp.heightMin) merged.heightMin = pp.heightMin
        if (pp.heightMax) merged.heightMax = pp.heightMax
        if (pp.religion) merged.religion = pp.religion
        if (pp.education) merged.qualification = pp.education
        if (pp.city) merged.city = pp.city
      }
      try {
        const raw = localStorage.getItem('soulmateSync_preferences')
        if (raw) Object.assign(merged, JSON.parse(raw))
      } catch {}
      return merged
    })
  }, [user])

  const handleSave = () => {
    if (!user) return
    try {
      // Persist the full preference set locally so it survives reloads
      localStorage.setItem('soulmateSync_preferences', JSON.stringify(prefs))
      // Reflect the saved partner preferences on the in-memory user so
      // recommendations that read them update right away
      updateUserData({
        partnerPreferences: {
          ...(user.partnerPreferences || {}),
          ageMin: Number(prefs.ageMin),
          ageMax: Number(prefs.ageMax),
          heightMin: prefs.heightMin,
          heightMax: prefs.heightMax,
          religion: prefs.religion,
          education: prefs.qualification,
          city: prefs.city,
        },
      })
      setSaveError('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError('Could not save preferences. Please try again.')
    }
  }

  if (!user) return null

  const tabs = [
    { id: 'basic' as Tab, icon: User, label: 'Basic Details' },
    { id: 'community' as Tab, icon: Users, label: 'Community' },
    { id: 'location' as Tab, icon: MapPin, label: 'Location' },
    { id: 'education' as Tab, icon: GraduationCap, label: 'Education & Career' },
    { id: 'other' as Tab, icon: Settings, label: 'Other Details' },
  ]

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 dark:text-purple-300/50 hover:text-slate-800 dark:text-white transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-teal-600 dark:text-purple-400" /> Partner Preferences
            </h1>
            <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-0.5">Define what you&apos;re looking for in a life partner</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30'
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:text-purple-200 hover:bg-white/5 border border-transparent'
              }`}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card animate-fade-in-up">
          {/* Basic Details */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Basic Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <AgeRangeSlider
                    min={Number(prefs.ageMin) || 18}
                    max={Number(prefs.ageMax) || 30}
                    onChange={(lo, hi) => setPrefs(p => ({ ...p, ageMin: String(lo), ageMax: String(hi) }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <HeightRangeSlider
                    min={feetStrToInches(prefs.heightMin)}
                    max={feetStrToInches(prefs.heightMax)}
                    onChange={(lo, hi) => setPrefs(p => ({ ...p, heightMin: inchesToFeetStr(lo), heightMax: inchesToFeetStr(hi) }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Marital Status</label>
                  <select value={prefs.maritalStatus} onChange={e => setPrefs(p => ({ ...p, maritalStatus: e.target.value }))} className="input-field text-sm">
                    {['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', "Doesn't Matter"].map(s => (
                      <option key={s} value={s} className="bg-white dark:bg-dark-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Community */}
          {activeTab === 'community' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-400" /> Community
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Religion</label>
                  <select value={prefs.religion} onChange={e => setPrefs(p => ({ ...p, religion: e.target.value }))} className="input-field text-sm">
                    {['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Parsi', "Doesn't Matter"].map(r => (
                      <option key={r} value={r} className="bg-white dark:bg-dark-900">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Community / Caste</label>
                  <select value={prefs.community} onChange={e => setPrefs(p => ({ ...p, community: e.target.value }))} className="input-field text-sm">
                    {['Any', 'Brahmin', 'Maratha', 'Rajput', 'Kshatriya', 'Vaishya', 'Kayastha', 'Agarwal', 'Jat', 'Patel'].map(c => (
                      <option key={c} value={c} className="bg-white dark:bg-dark-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Mother Tongue</label>
                  <select value={prefs.motherTongue} onChange={e => setPrefs(p => ({ ...p, motherTongue: e.target.value }))} className="input-field text-sm">
                    {['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', "Doesn't Matter"].map(l => (
                      <option key={l} value={l} className="bg-white dark:bg-dark-900">{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {activeTab === 'location' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" /> Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Country</label>
                  <select value={prefs.country} onChange={e => setPrefs(p => ({ ...p, country: e.target.value }))} className="input-field text-sm">
                    {['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Singapore', "Doesn't Matter"].map(c => (
                      <option key={c} value={c} className="bg-white dark:bg-dark-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">State</label>
                  <select value={prefs.state} onChange={e => setPrefs(p => ({ ...p, state: e.target.value }))} className="input-field text-sm">
                    {['Any', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Madhya Pradesh'].map(s => (
                      <option key={s} value={s} className="bg-white dark:bg-dark-900">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">City / District</label>
                  <input type="text" value={prefs.city} onChange={e => setPrefs(p => ({ ...p, city: e.target.value }))} placeholder="Enter city or district..." className="input-field text-sm" />
                </div>
                <div className="p-3 bg-teal-50/50 dark:bg-purple-500/5 border border-teal-100 dark:border-purple-500/10 rounded-xl">
                  <p className="text-[11px] text-slate-400 dark:text-purple-300/50 flex items-center gap-1.5">
                    <Sparkle /> Suggested for you: Mumbai, Pune, Delhi, Bangalore
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Education & Career */}
          {activeTab === 'education' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-400" /> Education & Career
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Highest Qualification</label>
                  <select value={prefs.qualification} onChange={e => setPrefs(p => ({ ...p, qualification: e.target.value }))} className="input-field text-sm">
                    {['Any Graduate', 'B.Tech/B.E.', 'MBA/PGDM', 'M.Tech/M.E.', 'MBBS/MD', 'CA/CS', 'B.Com', 'B.Sc', 'PhD', "Doesn't Matter"].map(q => (
                      <option key={q} value={q} className="bg-white dark:bg-dark-900">{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Working With</label>
                  <select value={prefs.workingWith} onChange={e => setPrefs(p => ({ ...p, workingWith: e.target.value }))} className="input-field text-sm">
                    {['Private Company', 'Government', 'Business/Self Employed', 'Defence', 'Not Working', "Doesn't Matter"].map(w => (
                      <option key={w} value={w} className="bg-white dark:bg-dark-900">{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Profession</label>
                  <select value={prefs.profession} onChange={e => setPrefs(p => ({ ...p, profession: e.target.value }))} className="input-field text-sm">
                    {['IT / Software', 'Doctor', 'Engineer', 'Teacher', 'Banker', 'Lawyer', 'CA', 'Business', "Doesn't Matter"].map(p => (
                      <option key={p} value={p} className="bg-white dark:bg-dark-900">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Annual Income</label>
                  <select value={prefs.annualIncome} onChange={e => setPrefs(p => ({ ...p, annualIncome: e.target.value }))} className="input-field text-sm">
                    {['₹2-5 Lakhs', '₹5-10 Lakhs', '₹10-15 Lakhs', '₹15-25 Lakhs', '₹25-50 Lakhs', '₹50 Lakhs+', "Doesn't Matter"].map(i => (
                      <option key={i} value={i} className="bg-white dark:bg-dark-900">{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Other Details */}
          {activeTab === 'other' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-teal-400" /> Other Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Profile Managed By</label>
                  <select value={prefs.managedBy} onChange={e => setPrefs(p => ({ ...p, managedBy: e.target.value }))} className="input-field text-sm">
                    {['Self', 'Parent/Guardian', 'Sibling', 'Friend', "Doesn't Matter"].map(m => (
                      <option key={m} value={m} className="bg-white dark:bg-dark-900">{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Diet Preference</label>
                  <select value={prefs.diet} onChange={e => setPrefs(p => ({ ...p, diet: e.target.value }))} className="input-field text-sm">
                    {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain', "Doesn't Matter"].map(d => (
                      <option key={d} value={d} className="bg-white dark:bg-dark-900">{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-5 border-t border-teal-100 dark:border-purple-500/10 flex items-center justify-between">
            {saveError ? (
              <p className="text-[11px] text-red-400 flex-1 min-w-0">{saveError}</p>
            ) : (
              <p className="text-[10px] text-slate-300 dark:text-purple-300/30">Changes auto-apply to your match recommendations</p>
            )}
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved ? 'bg-green-600/30 text-green-300 border border-green-500/30' : 'btn-primary'
              }`}>
              {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Preferences</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparkle() {
  return <span className="text-purple-400">✨</span>
}
