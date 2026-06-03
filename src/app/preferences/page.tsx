'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, User, Users, MapPin, GraduationCap, Settings, Check, ArrowLeft, Save } from 'lucide-react'

type Tab = 'basic' | 'community' | 'location' | 'education' | 'other'

export default function PreferencesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [saved, setSaved] = useState(false)

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

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const handleSave = () => {
    localStorage.setItem('soulmateSync_preferences', JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
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
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Min Age</label>
                  <select value={prefs.ageMin} onChange={e => setPrefs(p => ({ ...p, ageMin: e.target.value }))} className="input-field text-sm">
                    {Array.from({ length: 20 }, (_, i) => 18 + i).map(age => (
                      <option key={age} value={age} className="bg-white dark:bg-dark-900">{age} years</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Max Age</label>
                  <select value={prefs.ageMax} onChange={e => setPrefs(p => ({ ...p, ageMax: e.target.value }))} className="input-field text-sm">
                    {Array.from({ length: 20 }, (_, i) => 22 + i).map(age => (
                      <option key={age} value={age} className="bg-white dark:bg-dark-900">{age} years</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Min Height</label>
                  <select value={prefs.heightMin} onChange={e => setPrefs(p => ({ ...p, heightMin: e.target.value }))} className="input-field text-sm">
                    {["4'6\"","4'8\"","4'10\"","5'0\"","5'2\"","5'4\"","5'6\"","5'8\"","5'10\"","6'0\"","6'2\"","6'4\""].map(h => (
                      <option key={h} value={h} className="bg-white dark:bg-dark-900">{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 dark:text-purple-300/50 mb-1.5">Max Height</label>
                  <select value={prefs.heightMax} onChange={e => setPrefs(p => ({ ...p, heightMax: e.target.value }))} className="input-field text-sm">
                    {["4'8\"","4'10\"","5'0\"","5'2\"","5'4\"","5'6\"","5'8\"","5'10\"","6'0\"","6'2\"","6'4\"","6'6\""].map(h => (
                      <option key={h} value={h} className="bg-white dark:bg-dark-900">{h}</option>
                    ))}
                  </select>
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
            <p className="text-[10px] text-slate-300 dark:text-purple-300/30">Changes auto-apply to your match recommendations</p>
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
