'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, GraduationCap, Briefcase, Heart, BadgeCheck, Crown, ArrowLeft, MessageCircle, User, Phone, Video, Star, Shield, Sparkles, Flag, UserX, X, AlertTriangle, Share2, EyeOff, Bookmark, BookmarkCheck, Lock, Utensils, Building, Users, Gem, Check, Moon, MessageSquare, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Profile {
  id: string; name: string; gender: string; age: number; religion: string; caste: string;
  motherTongue: string; height: string; education: string; occupation: string; income: string;
  city: string; state: string; country: string; about: string; verified: boolean; premium: boolean;
  photos: string[]; phone: string; email: string; maritalStatus: string; diet: string;
  hobbies: string[]; familyDetails: any; online: boolean; lastActive: string;
  partnerPreferences: { ageMin: number; ageMax: number; religion: string; education: string; city: string }
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, checkPremium, authFetch } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [interestSent, setInterestSent] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [shortlisted, setShortlisted] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [compatibility, setCompatibility] = useState<{ score: number; level: string; factors: any[] } | null>(null)
  // Premium feature states
  const [contactUnlocked, setContactUnlocked] = useState(false)
  const [contactData, setContactData] = useState<{ phone: string; email: string } | null>(null)
  const [callLoading, setCallLoading] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumAction, setPremiumAction] = useState('')
  const [detailTab, setDetailTab] = useState<'about' | 'preferences'>('about')
  const [similarProfiles, setSimilarProfiles] = useState<any[]>([])

  const fetchSimilarProfiles = useCallback(async () => {
    try {
      const params = new URLSearchParams({ gender: profile!.gender, religion: profile!.religion || '', city: profile!.city || '', excludeId: profile!.id })
      const res = await authFetch(`/api/profiles?${params.toString()}`)
      const data = await res.json()
      setSimilarProfiles((data.profiles || []).slice(0, 6))
    } catch {}
  }, [profile, authFetch])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authFetch('/api/profiles')
      const data = await res.json()
      const found = data.profiles?.find((p: Profile) => p.id === params.id)
      setProfile(found || null)
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [authFetch, params.id])

  const fetchCompatibility = useCallback(async () => {
    if (!user || !profile) return
    try {
      const res = await authFetch(`/api/compatibility?userId=${user.id}&targetId=${profile.id}`)
      const data = await res.json()
      if (data.score) setCompatibility(data)
    } catch {}
  }, [authFetch, user, profile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile && user) fetchCompatibility()
  }, [profile, user, fetchCompatibility])

  useEffect(() => {
    if (profile) fetchSimilarProfiles()
  }, [profile, fetchSimilarProfiles])

  const handleBlock = async () => {
    if (!user || !profile) return
    await authFetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block', userId: user.id, targetId: profile.id })
    })
    setBlocked(true)
  }

  const handleReport = async () => {
    if (!user || !profile || !reportReason) return
    await authFetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'report', userId: user.id, targetId: profile.id, reason: reportReason, details: reportDetails })
    })
    setReportSent(true)
    setTimeout(() => { setShowReport(false); setReportSent(false) }, 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${profile?.name} - Soulmate Sync`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Premium feature handlers
  const handleViewContact = async () => {
    if (!user || !profile) return
    try {
      const res = await authFetch('/api/premium-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view_contact', userId: user.id, targetId: profile.id })
      })
      const data = await res.json()
      if (data.success) {
        setContactUnlocked(true)
        setContactData(data.contact)
      } else if (data.requiresPremium) {
        setPremiumAction('view contact details')
        setShowPremiumModal(true)
      }
    } catch {}
  }

  const handleCall = async (type: 'audio' | 'video') => {
    if (!user || !profile) return
    setCallLoading(true)
    try {
      const res = await authFetch('/api/premium-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call', userId: user.id, targetId: profile.id, callType: type })
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/call?type=${type}&target=${profile.id}&callId=${data.callId}&name=${encodeURIComponent(profile.name)}`)
      } else if (data.requiresPremium) {
        setPremiumAction(`make ${type} calls`)
        setShowPremiumModal(true)
      }
    } catch {}
    setCallLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center pt-20">
      <div className="text-purple-300/50 animate-pulse">Loading profile...</div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center pt-20">
      <div className="text-center">
        <User className="h-16 w-16 text-purple-400/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Profile not found</h2>
        <Link href="/search" className="text-purple-400 hover:text-purple-300 text-sm">← Back to Search</Link>
      </div>
    </div>
  )

  // ── Locked / Guest view ─────────────────────────────────────────────────────
  if (!user) {
    const nameParts = profile.name.split(' ')
    const maskedName = nameParts.map(p => p[0] + '...').join(' ')

    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-300/50 hover:text-purple-200 mb-6 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="glass-card p-0 overflow-hidden animate-fade-in-up">
            {/* Blurred Photo with lock */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-900/40 to-dark-900">
              {profile.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photos[0]}
                  alt="Locked profile"
                  className="w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 opacity-20">
                    <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                    <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                    <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
                  </svg>
                </div>
              )}
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-dark-900/60 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center">
                  <Lock className="h-9 w-9 text-purple-300" />
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-semibold text-lg">Photos are hidden</p>
                  <p className="text-purple-300/60 text-sm mt-1">Register free to view this profile</p>
                </div>
              </div>
            </div>

            {/* Masked info */}
            <div className="p-6">
              {/* Name + basic */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white tracking-wide">{maskedName}</h1>
                    {profile.premium && (
                      <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Crown className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {profile.verified && (
                      <BadgeCheck className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-purple-300/60 text-sm">
                    {profile.age} yrs · {profile.height} · {profile.maritalStatus}
                  </p>
                  <p className="text-purple-300/50 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30 bg-purple-900/40 flex items-center justify-center shrink-0">
                  <Lock className="h-7 w-7 text-purple-400/50" />
                </div>
              </div>

              {/* Blurred details grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: GraduationCap, label: 'Education', value: profile.education },
                  { icon: Briefcase, label: 'Profession', value: '••••••••' },
                  { icon: Building, label: 'Income', value: '••••••' },
                  { icon: Users, label: 'Religion', value: profile.religion },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-purple-500/10">
                    <p className="text-[10px] text-purple-300/40 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-white/80 flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-purple-400/60 shrink-0" />
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* About blurred */}
              <div className="mb-6 relative">
                <p className="text-sm text-purple-300/30 line-clamp-2 blur-sm select-none">
                  {profile.about || 'This member has written an interesting bio about themselves and their preferences. Register to read the full profile.'}
                </p>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-purple-400/60 bg-dark-900/80 px-3 py-1 rounded-full border border-purple-500/20">
                    <Lock className="h-3 w-3 inline mr-1" />Register to read bio
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Link href={`/register`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl text-white font-semibold hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">
                  <Sparkles className="h-4 w-4" />
                  Register Free to View Full Profile
                </Link>
                <Link href={`/login?redirect=/profile/${profile.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-200 text-sm hover:bg-purple-500/20 transition-all">
                  Already have an account? <span className="font-semibold text-purple-300">Sign in</span>
                </Link>
              </div>

              <p className="text-center text-[10px] text-purple-300/30 mt-4">
                🔒 Profile details are protected. Register to connect.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // ── End locked view ─────────────────────────────────────────────────────────

  const score = compatibility?.score || Math.floor(75 + Math.random() * 20)
  const profileId = `Sh${profile.id.replace(/\D/g, '').slice(0, 8).padEnd(8, '0')}`

  // Mock extended data
  const extendedData = {
    born: '15 Mar 1997',
    maritalStatus: 'Never Married',
    diet: 'Vegetarian',
    hobbies: ['Reading', 'Traveling', 'Yoga', 'Cooking', 'Photography', 'Music'],
    managedBy: 'Parent',
    family: {
      father: 'Retired (Govt. Officer)',
      mother: 'Homemaker',
      siblings: '1 Brother (Married), 1 Sister (Unmarried)',
      financialStatus: 'Upper Middle Class',
      annualIncome: '₹15-20 Lakhs'
    },
    career: {
      profession: profile.occupation,
      company: 'Infosys Technologies',
      annualIncomeSelf: profile.income,
      annualIncomeFamily: '₹15-20 Lakhs',
      highestQualification: profile.education,
      educationField: 'Computer Science',
      college: 'IIT Delhi'
    },
    contact: {
      phone: '+91 98XXX XXXXX',
      email: `${profile.name.split(' ')[0].toLowerCase()}@email.com`,
    },
    herPreferences: {
      age: '25-30 years',
      height: "5'6\" - 5'11\"",
      religion: profile.religion,
      education: 'Post Graduate',
      location: profile.city,
      income: '₹8+ Lakhs',
      maritalStatus: 'Never Married',
    },
    commonBetween: ['Religion', 'Mother Tongue', 'City Preference', 'Education Level', 'Vegetarian Diet'],
  }

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-300/50 hover:text-purple-200 mb-6 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Hero Card - Horizontal Layout (Photo Left + Details Right) */}
        <div className="glass-card p-0 overflow-hidden mb-6 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Photo Gallery */}
            <div className="relative lg:w-[380px] xl:w-[420px] shrink-0 bg-gradient-to-br from-purple-900/30 to-dark-900">
              {profile.photos && profile.photos.length > 0 ? (
                <div className="relative w-full aspect-[3/4] lg:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={profile.photos[0]} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-purple-900/60 to-dark-900 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
                      <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                      <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                      <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
                    </svg>
                  </div>
                  {/* Photo counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-dark-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-500/20">
                    <button className="text-white/60 hover:text-white text-xs">‹</button>
                    <span className="text-[10px] text-white/80 font-medium">1 of {profile.photos.length}</span>
                    <button className="text-white/60 hover:text-white text-xs">›</button>
                  </div>
                  {/* Premium Badge */}
                  {profile.premium && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <Crown className="h-3 w-3" /> Premium
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[3/4] lg:h-full bg-gradient-to-br from-purple-900/40 to-dark-900 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                    <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                    <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                    <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
                  </svg>
                </div>
              )}

              {/* Verified Section Below Photo */}
              {profile.verified && (
                <div className="p-4 border-t border-purple-500/10 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-green-400" />
                    <p className="text-xs font-semibold text-green-300">Verified profile</p>
                  </div>
                  <p className="text-[10px] text-purple-300/40 ml-6">Selfie verified with Profile Photo</p>
                  <p className="text-[10px] text-purple-300/40 ml-6">Mobile no. is verified</p>
                  <button className="text-[10px] text-purple-400 hover:text-purple-300 ml-6 mt-1 transition-colors">Get Your Blue Tick →</button>
                </div>
              )}
            </div>

            {/* Right: Profile Details */}
            <div className="flex-1 p-6">
              {/* Name & Status Row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                    {profile.verified && <BadgeCheck className="h-4 w-4 text-blue-400" />}
                    {profile.premium && <Crown className="h-4 w-4 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-purple-300/50">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${profile.online ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                      {profile.online ? 'Online now' : 'Offline'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> You & Her
                    </span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Astro
                    </span>
                  </div>
                </div>

                {/* Upgrade / Call CTA */}
                <div className="text-right shrink-0">
                  {user?.premium ? (
                    <button onClick={() => handleCall('audio')} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs hover:bg-blue-500/20 transition-all">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-[10px] text-purple-300/40 mb-1">Upgrade to</p>
                      <p className="text-[10px] text-purple-300/40">Contact her directly</p>
                      <button onClick={() => { setPremiumAction('call'); setShowPremiumModal(true) }}
                        className="mt-1.5 flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs hover:bg-blue-500/20 transition-all">
                        <Phone className="h-3 w-3" /> Call
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="mt-4 flex items-center gap-3">
                <div className="relative w-9 h-9">
                  <svg className="w-9 h-9 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(147,51,234,0.15)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="url(#gradP)" strokeWidth="3" strokeDasharray={`${score * 0.88} 88`} strokeLinecap="round" />
                    <defs><linearGradient id="gradP"><stop stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{score}%</span>
                </div>
                <span className="text-[11px] text-purple-300/50">AI Match Score</span>
              </div>

              {/* Details Grid */}
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px]">
                <div className="flex justify-between py-1.5 border-b border-purple-500/5">
                  <span className="text-purple-300/40">{profile.age} yrs, {profile.height}</span>
                  <span className="text-purple-200 font-medium">{extendedData.maritalStatus}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-purple-500/5">
                  <span className="text-purple-300/40">{profile.motherTongue}</span>
                  <span className="text-purple-200 font-medium">{profile.city}, {profile.state}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-purple-500/5">
                  <span className="text-purple-300/40">{profile.religion}</span>
                  <span className="text-purple-200 font-medium">{profile.occupation}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-purple-500/5">
                  <span className="text-purple-300/40">{profile.education}</span>
                  <span className="text-purple-200 font-medium">{profile.income}</span>
                </div>
              </div>

              {/* Interest Status */}
              <div className="mt-4 py-2.5 px-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                {interestSent ? (
                  <p className="text-[11px] text-green-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> You Accepted her Invitation on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.
                  </p>
                ) : (
                  <p className="text-[11px] text-purple-300/50">Send interest to start connecting</p>
                )}
              </div>

              {/* Intro Quote */}
              {profile.about && (
                <div className="mt-4 flex items-start gap-2">
                  <span className="text-purple-400/20 text-2xl leading-none">&ldquo;</span>
                  <p className="text-[12px] text-purple-200/60 leading-relaxed line-clamp-3">{profile.about}</p>
                </div>
              )}

              {/* Tabs Section */}
              <div className="mt-5 border-t border-purple-500/10 pt-4">
                <div className="flex gap-6 border-b border-purple-500/10">
                  <button onClick={() => setDetailTab('about')} className={`pb-2 text-xs font-medium transition-colors ${detailTab === 'about' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-purple-300/30 hover:text-purple-200'}`}>Detailed Profile</button>
                  <button onClick={() => setDetailTab('preferences')} className={`pb-2 text-xs font-medium transition-colors ${detailTab === 'preferences' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-purple-300/30 hover:text-purple-200'}`}>Partner Preferences</button>
                </div>
                {detailTab === 'about' ? (
                  <div className="mt-3 text-[11px] text-purple-200/60 leading-relaxed">
                    <p className="font-semibold text-white text-xs mb-2 flex items-center gap-1.5">
                      <span className="text-purple-400/30">&ldquo;</span> About {profile.name.split(' ')[0]}
                    </p>
                    <p className="line-clamp-4">{profile.about || `A well-educated ${profile.occupation} based in ${profile.city}. Looking for a compatible life partner.`}</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-white mb-2">{profile.name.split(' ')[0]} is looking for:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(extendedData.herPreferences).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-purple-500/10">
                          <span className="text-[10px] text-purple-300/50 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-[10px] text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* ID Badge */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[10px] bg-white/[0.03] text-purple-300/40 px-3 py-1.5 rounded-full border border-purple-500/10 flex items-center gap-1.5">
                    ID: {profileId}
                  </span>
                  <span className="text-[10px] bg-white/[0.03] text-purple-300/40 px-3 py-1.5 rounded-full border border-purple-500/10">
                    Profile Managed by {extendedData.managedBy}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-5">
                <button 
                  onClick={() => setInterestSent(true)}
                  className={`btn-primary py-2 px-4 flex items-center gap-2 text-xs ${interestSent ? '!bg-green-600/50 !shadow-[0_0_15px_rgba(34,197,94,0.2)]' : ''}`}
                >
                  {interestSent ? <><Check className="h-3.5 w-3.5" /> Interest Sent</> : <><Heart className="h-3.5 w-3.5" /> Send Interest</>}
                </button>
                <button onClick={() => setShortlisted(!shortlisted)}
                  className={`btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs ${shortlisted ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : ''}`}>
                  {shortlisted ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {shortlisted ? 'Saved' : 'Shortlist'}
                </button>
                <button onClick={handleShare} className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button onClick={() => setShowReport(true)} className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs text-red-300/50 border-red-500/15 hover:bg-red-500/10">
                  <Flag className="h-3.5 w-3.5" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Profiles Section */}
        <div className="glass-card mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" /> Similar Profiles
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {similarProfiles.length > 0 ? similarProfiles.map((sp) => (
              <Link key={sp.id} href={`/profile/${sp.id}`} className="shrink-0 w-32 p-3 rounded-xl bg-white/[0.02] border border-purple-500/10 text-center hover:bg-purple-500/5 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto border border-purple-500/10">
                  {sp.photos && sp.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sp.photos[0]} alt={sp.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <circle cx="50" cy="50" r="50" fill={sp.gender === 'Female' ? '#3b1d6e' : '#1e2a5e'} />
                      <circle cx="50" cy="38" r="16" fill={sp.gender === 'Female' ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.5)'} />
                      <ellipse cx="50" cy="80" rx="26" ry="22" fill={sp.gender === 'Female' ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.5)'} />
                    </svg>
                  )}
                </div>
                <p className="text-[11px] text-white mt-2 font-medium truncate">{sp.name}</p>
                <p className="text-[9px] text-purple-300/40 mt-0.5">{sp.age} yrs, {sp.city || 'India'}</p>
              </Link>
            )) : (
              <p className="text-xs text-purple-300/40 py-4">Loading similar profiles...</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-400" /> About {profile.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-purple-200/60 leading-relaxed">{profile.about}</p>
            </div>

            {/* Hobbies & Interests */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-fuchsia-400" /> Hobbies & Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {extendedData.hobbies.map(hobby => (
                  <span key={hobby} className="text-xs bg-purple-500/10 text-purple-200/70 px-3 py-1.5 rounded-full border border-purple-500/15">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" /> Basic Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Profile ID', value: profileId },
                  { label: 'Age', value: `${profile.age} years` },
                  { label: 'Height', value: profile.height },
                  { label: 'Date of Birth', value: extendedData.born },
                  { label: 'Marital Status', value: extendedData.maritalStatus },
                  { label: 'Lives In', value: `${profile.city}, ${profile.state}` },
                  { label: 'Religion', value: `${profile.religion}${profile.caste ? ' - ' + profile.caste : ''}` },
                  { label: 'Mother Tongue', value: profile.motherTongue },
                  { label: 'Diet Preference', value: extendedData.diet },
                  { label: 'Managed By', value: extendedData.managedBy },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-purple-500/5">
                    <span className="text-[11px] text-purple-300/40">{item.label}</span>
                    <span className="text-[11px] text-white font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details (Premium Locked) */}
            <div className="glass-card animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-400" /> Contact Details
              </h2>
              {contactUnlocked && contactData ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                    <span className="text-[11px] text-purple-300/40">Contact Number</span>
                    <a href={`tel:${contactData.phone}`} className="text-[11px] text-green-300 font-mono font-semibold">
                      {contactData.phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                    <span className="text-[11px] text-purple-300/40">Email ID</span>
                    <a href={`mailto:${contactData.email}`} className="text-[11px] text-green-300 font-mono font-semibold">
                      {contactData.email}
                    </a>
                  </div>
                  <p className="text-[10px] text-green-300/50 flex items-center gap-1 mt-2">
                    <Check className="h-3 w-3" /> Contact unlocked
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-purple-500/5">
                      <span className="text-[11px] text-purple-300/40">Contact Number</span>
                      <span className="text-[11px] text-white/30 font-mono flex items-center gap-1">
                        <Lock className="h-3 w-3" /> +91 XXXXX XXXXX
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-purple-500/5">
                      <span className="text-[11px] text-purple-300/40">Email ID</span>
                      <span className="text-[11px] text-white/30 font-mono flex items-center gap-1">
                        <Lock className="h-3 w-3" /> xxxxxxx@email.com
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-400" />
                      <span className="text-xs text-amber-200/70">Unlock contact details</span>
                    </div>
                    <button onClick={handleViewContact} className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full font-semibold hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                      {user?.premium ? 'View Contact' : 'Go Premium →'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Family Details */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-400" /> Family Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Father', value: extendedData.family.father },
                  { label: 'Mother', value: extendedData.family.mother },
                  { label: 'Siblings', value: extendedData.family.siblings },
                  { label: 'Family Status', value: extendedData.family.financialStatus },
                  { label: 'Annual Family Income', value: extendedData.family.annualIncome },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-purple-500/5">
                    <span className="text-[11px] text-purple-300/40">{item.label}</span>
                    <span className="text-[11px] text-white font-medium text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career & Education */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Career & Education
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Profession', value: extendedData.career.profession },
                  { label: 'Company Name', value: extendedData.career.company },
                  { label: 'Annual Income (Self)', value: extendedData.career.annualIncomeSelf },
                  { label: 'Annual Income (Family)', value: extendedData.career.annualIncomeFamily },
                  { label: 'Highest Qualification', value: extendedData.career.highestQualification },
                  { label: 'Education Field', value: extendedData.career.educationField },
                  { label: 'College', value: extendedData.career.college },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-purple-500/5">
                    <span className="text-[11px] text-purple-300/40">{item.label}</span>
                    <span className="text-[11px] text-white font-medium text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Her Preferences (You & Her Match) */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" /> {profile.name.split(' ')[0]}&apos;s Partner Preferences
              </h2>
              <p className="text-[11px] text-purple-300/40 mb-3">See how you match with what she is looking for</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(extendedData.herPreferences).map(([key, value], i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-purple-500/5">
                    <span className="text-[11px] text-purple-300/40 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-[11px] text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Between Both */}
            <div className="glass-card animate-fade-in-up border-green-500/10" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" /> Common Between You Both
              </h2>
              <div className="flex flex-wrap gap-2">
                {extendedData.commonBetween.map(item => (
                  <span key={item} className="text-xs bg-green-500/10 text-green-300/80 px-3 py-1.5 rounded-full border border-green-500/20 flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Astrology & Kundli */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.45s', opacity: 0 }}>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Moon className="h-4 w-4 text-amber-400" /> Astrology & Kundli Match
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
                  <p className="text-2xl font-bold text-amber-300">7/8</p>
                  <p className="text-[10px] text-amber-200/50 mt-1">Gun Milan Score</p>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-green-500/5 border border-green-500/15 text-center">
                  <p className="text-lg font-bold text-green-300">Highly Compatible</p>
                  <p className="text-[10px] text-green-200/50 mt-1">Kundli Match Status</p>
                </div>
              </div>
              <Link href="/kundali" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs hover:bg-amber-500/20 transition-all">
                <Moon className="h-3.5 w-3.5" /> View Full Kundli Report →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Connect Section (Premium Gated) */}
            <div className="glass-card animate-fade-in-up border-purple-400/15" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-400" /> Connect
                {!user?.premium && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Premium</span>}
              </h3>
              <div className="space-y-2">
                <Link href={`/messages?chat=${profile.id}`} className="w-full flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs hover:bg-purple-500/20 transition-all">
                  <MessageCircle className="h-4 w-4" /> Chat Now
                </Link>
                <button 
                  onClick={() => handleCall('audio')} 
                  disabled={callLoading}
                  className="w-full flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs hover:bg-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Phone className="h-4 w-4" /> Audio Call {!user?.premium && <Lock className="h-3 w-3 ml-auto" />}
                </button>
                <button 
                  onClick={() => handleCall('video')} 
                  disabled={callLoading}
                  className="w-full flex items-center gap-2 p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-200 text-xs hover:bg-fuchsia-500/20 transition-all disabled:opacity-50"
                >
                  <Video className="h-4 w-4" /> Video Call {!user?.premium && <Lock className="h-3 w-3 ml-auto" />}
                </button>
                <button 
                  onClick={handleViewContact}
                  className="w-full flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-200 text-xs hover:bg-green-500/20 transition-all"
                >
                  <Phone className="h-4 w-4" /> View Contact {!user?.premium && !contactUnlocked && <Lock className="h-3 w-3 ml-auto" />}
                  {contactUnlocked && <Check className="h-3 w-3 ml-auto text-green-400" />}
                </button>
              </div>
            </div>

            {/* Online Status */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
              <h3 className="text-xs font-semibold text-white mb-3">Activity</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${profile.online ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-[11px] text-purple-200/60">{profile.online ? 'Online now' : `Last active: ${new Date(profile.lastActive).toLocaleDateString()}`}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <h3 className="text-xs font-semibold text-white mb-3">Profile Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[11px] text-purple-200/60">Active today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[11px] text-purple-200/60">ID Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-[11px] text-purple-200/60">Income: {profile.income}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                  <span className="text-[11px] text-purple-200/60">Mother Tongue: {profile.motherTongue}</span>
                </div>
              </div>
            </div>

            {/* Trust Score */}
            <div className="glass-card border-green-500/10 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-400" />
                <h3 className="text-xs font-semibold text-white">Trust Score</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-purple-500/10 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                </div>
                <span className="text-xs font-bold text-green-400">85%</span>
              </div>
              <p className="text-[10px] text-purple-300/40 mt-2">Profile verified with ID proof & phone number</p>
            </div>

            {/* Similar Profiles */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h3 className="text-xs font-semibold text-white mb-3">Similar Profiles</h3>
              <p className="text-[11px] text-purple-300/40">More profiles like this await in your search results.</p>
              <Link href="/search" className="mt-3 block text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Browse More →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Required Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="glass-card max-w-sm w-full text-center p-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Premium Required</h3>
            <p className="text-sm text-purple-200/50 mb-5">
              Upgrade to Premium to {premiumAction}. Get unlimited access to contacts, calls, and more.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowPremiumModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Later</button>
              <Link href="/checkout?plan=gold" className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1">
                <Crown className="h-4 w-4" /> Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="glass-card max-w-md w-full p-6 animate-scale-in">
            {reportSent ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Report Submitted</h3>
                <p className="text-sm text-purple-200/60">Our team will review this within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" /> Report Profile
                  </h3>
                  <button onClick={() => setShowReport(false)} className="text-purple-300/40 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-purple-200/60 mb-4">Why are you reporting {profile.name}?</p>
                <div className="space-y-2 mb-4">
                  {['Fake profile', 'Inappropriate content', 'Harassment', 'Scam/Fraud', 'Already married', 'Other'].map(reason => (
                    <button key={reason} onClick={() => setReportReason(reason)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                        reportReason === reason ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-purple-500/10 text-purple-200/60 hover:bg-white/[0.03]'
                      }`}>
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={3}
                  className="input-field w-full mb-4 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowReport(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                  <button onClick={handleReport} disabled={!reportReason}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600/50 rounded-xl border border-red-500/30 hover:bg-red-600/70 transition-all disabled:opacity-40">
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
