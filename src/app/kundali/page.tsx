'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Moon, Sun, Sparkles, CheckCircle, AlertTriangle, User } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface KundaliResult {
  score: number; manglik: string; nakshatraMatch: string; gunaScore: number; recommendation: string
}

interface Profile {
  id: string; name: string; age: number; city: string; gender: string
}

export default function KundaliPage() {
  const { user, authFetch, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [result, setResult] = useState<KundaliResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState('')

  const fetchProfiles = useCallback(async () => {
    try {
      const oppositeGender = user!.gender === 'Male' ? 'Female' : 'Male'
      const res = await authFetch(`/api/profiles?gender=${oppositeGender}&excludeId=${user!.id}`)
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch {}
  }, [user, authFetch])

  useEffect(() => { if (!authLoading && !user) router.push('/login'); else if (user) fetchProfiles() }, [user, authLoading, router, fetchProfiles])

  const checkKundali = async () => {
    if (!selectedProfile) return
    setLoading(true)
    try {
      const res = await authFetch(`/api/activity/kundali?userId=${user!.id}&profileId=${selectedProfile}`)
      const data = await res.json()
      setResult(data.kundali)
      const p = profiles.find(p => p.id === selectedProfile)
      setSelectedName(p?.name || '')
    } catch {}
    setLoading(false)
  }

  if (!user) return null

  const gunaCategories = [
    { name: 'Varna', max: 1, desc: 'Spiritual development' },
    { name: 'Vashya', max: 2, desc: 'Dominance & control' },
    { name: 'Tara', max: 3, desc: 'Birth star compatibility' },
    { name: 'Yoni', max: 4, desc: 'Physical compatibility' },
    { name: 'Graha Maitri', max: 5, desc: 'Intellectual level' },
    { name: 'Gana', max: 6, desc: 'Temperament' },
    { name: 'Bhakoot', max: 7, desc: 'Love & family' },
    { name: 'Nadi', max: 8, desc: 'Health & genes' },
  ]

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-4 py-2 rounded-full mb-4">
            <Star className="h-3.5 w-3.5" /> Vedic Astrology
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Kundali <span className="gradient-text">Matching</span>
          </h1>
          <p className="text-sm text-purple-200/40">Check horoscope compatibility based on Ashtakoota Guna Milan (36 Gunas)</p>
        </div>

        {/* Selection */}
        <div className="glass-card mb-6 animate-fade-in-up delay-100" style={{opacity:0}}>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Moon className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Select a profile to check compatibility
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)} className="input-field flex-1">
              <option value="" className="bg-white dark:bg-dark-900">Choose a match...</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-dark-900">{p.name} - {p.age} yrs, {p.city}</option>
              ))}
            </select>
            <button onClick={checkKundali} disabled={!selectedProfile || loading} className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-40">
              {loading ? <><span className="animate-spin">⏳</span> Checking...</> : <><Star className="h-4 w-4" /> Check Kundali</>}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Score Card */}
            <div className="glass-card text-center border-amber-500/10">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(147,51,234,0.1)" strokeWidth="8" />
                  <circle cx="64" cy="64" r="56" fill="none" stroke="url(#kundaliGrad)" strokeWidth="8"
                    strokeDasharray={`${result.score * 3.52} 352`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="kundaliGrad">
                      <stop stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800 dark:text-white">{result.gunaScore}</span>
                  <span className="text-[10px] text-slate-300 dark:text-purple-300/40">out of 36</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                {user.name} & {selectedName}
              </h3>
              <p className={`text-sm font-medium ${
                result.score >= 75 ? 'text-green-400' : result.score >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {result.recommendation}
              </p>
              <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">{result.score}% Compatibility</p>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Manglik Status */}
              <div className="glass-card">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Sun className="h-4 w-4 text-red-400" /> Manglik Status
                </h4>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    result.manglik === 'No' ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    {result.manglik === 'No' ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 dark:text-white font-medium">{result.manglik}</p>
                    <p className="text-[10px] text-slate-300 dark:text-purple-300/40">{result.manglik === 'No' ? 'No Mangal Dosha' : 'Mangal Dosha Present'}</p>
                  </div>
                </div>
              </div>

              {/* Nakshatra Match */}
              <div className="glass-card">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-400" /> Nakshatra Compatibility
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 dark:text-white font-medium">{result.nakshatraMatch}</p>
                    <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Star alignment compatibility</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guna Breakdown */}
            <div className="glass-card">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Ashtakoota Guna Breakdown
              </h4>
              <div className="space-y-3">
                {gunaCategories.map((guna, i) => {
                  // Deterministic distribution based on guna index and total score
                  const seed = (result!.gunaScore * 7 + i * 13) % 100
                  const ratio = (seed / 100) * 0.5 + 0.5 // range 0.5 to 1.0 deterministically
                  const earned = Math.ceil((result!.gunaScore / 36) * guna.max * ratio)
                  const clamped = Math.min(earned, guna.max)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-24 text-[11px] text-slate-500 dark:text-purple-200/50">{guna.name}</div>
                      <div className="flex-1 h-2 bg-teal-50 dark:bg-purple-500/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all" style={{ width: `${(clamped / guna.max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-300 dark:text-purple-300/40 w-10 text-right">{clamped}/{guna.max}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-teal-100 dark:border-purple-500/10 flex justify-between items-center">
                <span className="text-xs text-slate-300 dark:text-purple-300/40">Total Guna Score</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{result.gunaScore}/36</span>
              </div>
            </div>

            {/* Interpretation */}
            <div className="glass-card border-amber-500/10">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Interpretation</h4>
              <div className="space-y-2 text-xs text-slate-500 dark:text-purple-200/50">
                <p>• <span className="text-green-400">18+ Gunas:</span> Good match, marriage is recommended</p>
                <p>• <span className="text-amber-400">24+ Gunas:</span> Very good match with high compatibility</p>
                <p>• <span className="text-purple-400">30+ Gunas:</span> Excellent match, ideal for marriage</p>
                <p>• <span className="text-red-400">Below 18:</span> Not recommended, consult an astrologer</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 justify-center">
              <Link href={`/profile/${selectedProfile}`} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                <User className="h-4 w-4" /> View Full Profile
              </Link>
              <Link href="/matches" className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2">
                <HalfHeart className="h-4 w-4" /> Send Interest
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
