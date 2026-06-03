'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Save, Camera, Upload, BadgeCheck, MapPin, GraduationCap, Briefcase, Heart, Globe, BookOpen, Sparkles, TrendingUp, Star, Video } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [photos, setPhotos] = useState<string[]>([])
  const [profile, setProfile] = useState({
    religion: '', caste: '', motherTongue: '', height: '',
    education: '', occupation: '', income: '',
    city: '', state: '', country: 'India', about: '',
    partnerAgeMin: '22', partnerAgeMax: '35',
    partnerReligion: 'Any', partnerEducation: 'Any', partnerCity: 'Any'
  })

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, userId: user?.id })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (!user) return null

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'video', label: 'Video Intro', icon: Video },
  ]

  // Calculate profile completion
  const completionFields = [
    profile.religion, profile.caste, profile.motherTongue, profile.height,
    profile.education, profile.occupation, profile.income, profile.city,
    profile.about, photos.length > 0 ? 'yes' : ''
  ]
  const completionScore = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="glass-card mb-6 p-8 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 dark:bg-purple-600/10 rounded-full blur-[60px]" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center border-2 border-teal-200/50 dark:border-purple-400/30 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                {photos.length > 0 ? (
                  <img src={photos[0]} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-slate-400 dark:text-purple-300/60" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-dark-900 hover:bg-purple-500 transition-colors group-hover:scale-110">
                <Camera className="h-4 w-4 text-slate-800 dark:text-white" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{user.name}</h1>
              <p className="text-slate-400 dark:text-purple-300/50 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="text-[10px] bg-teal-100/50 dark:bg-purple-500/20 text-slate-600 dark:text-purple-300 px-2.5 py-1 rounded-full border border-teal-200/50 dark:border-purple-500/20 flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> Active Member
                </span>
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/20">
                  Online
                </span>
              </div>
            </div>
            {/* Completion Score */}
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" stroke="rgba(147,51,234,0.1)" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="35" stroke="url(#scoreGradient)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${completionScore * 2.2} 220`} />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">{completionScore}%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40 mt-1">Profile Score</p>
            </div>
          </div>

          {/* Completion Tips */}
          {completionScore < 100 && (
            <div className="mt-5 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
              <TrendingUp className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-300 font-medium">Complete your profile for 10x more responses</p>
                <p className="text-[10px] text-amber-300/50 mt-0.5">
                  {!profile.about && 'Add an About Me • '}
                  {!profile.education && 'Add Education • '}
                  {!profile.occupation && 'Add Occupation • '}
                  {photos.length === 0 && 'Upload Photos'}
                </p>
              </div>
            </div>
          )}

          {/* Profile Analytics */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
              <p className="text-lg font-bold text-slate-800 dark:text-white">47</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Profile Views</p>
            </div>
            <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
              <p className="text-lg font-bold text-slate-800 dark:text-white">12</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Interests</p>
            </div>
            <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
              <p className="text-lg font-bold text-slate-800 dark:text-white">5</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Shortlisted</p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-3 rounded-2xl mb-4 text-sm animate-fade-in-up flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Profile updated successfully!
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] p-1.5 rounded-2xl border border-teal-100 dark:border-purple-500/10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:text-purple-200 hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Personal Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Religion</label>
                  <select name="religion" value={profile.religion} onChange={handleChange} className="input-field">
                    <option value="" className="bg-white dark:bg-dark-900">Select</option>
                    {['Hindu','Muslim','Sikh','Christian','Jain','Buddhist','Other'].map(r => (
                      <option key={r} value={r} className="bg-white dark:bg-dark-900">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Caste</label>
                  <input type="text" name="caste" value={profile.caste} onChange={handleChange} className="input-field" placeholder="Enter caste" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Mother Tongue</label>
                  <select name="motherTongue" value={profile.motherTongue} onChange={handleChange} className="input-field">
                    <option value="" className="bg-white dark:bg-dark-900">Select</option>
                    {['Hindi','English','Marathi','Tamil','Telugu','Kannada','Gujarati','Punjabi','Bengali','Malayalam','Urdu'].map(l => (
                      <option key={l} value={l} className="bg-white dark:bg-dark-900">{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Height</label>
                  <select name="height" value={profile.height} onChange={handleChange} className="input-field">
                    <option value="" className="bg-white dark:bg-dark-900">Select</option>
                    {["5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""].map(h => (
                      <option key={h} value={h} className="bg-white dark:bg-dark-900">{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">About Me</label>
                <textarea name="about" value={profile.about} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Share your personality, interests, values & what makes you unique..." />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <Camera className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Photo Gallery
              </h2>
              <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-4">Upload 4-6 photos for the best results. Profiles with photos get 10x more responses.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-teal-200/50 dark:border-purple-500/20 group">
                    <img src={photo} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-800 dark:text-white text-xs bg-red-500/80 px-3 py-1.5 rounded-lg">
                        Remove
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-2 left-2 text-[9px] bg-purple-600 text-slate-800 dark:text-white px-2 py-0.5 rounded-full">Primary</span>
                    )}
                  </div>
                ))}
                
                {/* Upload Button */}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-teal-200/50 dark:border-purple-500/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400/40 hover:bg-teal-50/50 dark:bg-purple-500/5 transition-all group">
                  <Upload className="h-8 w-8 text-teal-600 dark:text-purple-400/40 group-hover:text-slate-600 dark:text-purple-300 transition-colors mb-2" />
                  <span className="text-xs text-slate-300 dark:text-purple-300/40 group-hover:text-slate-700 dark:text-purple-200">Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" multiple />
                </label>
              </div>

              <div className="mt-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                <p className="text-[11px] text-amber-300/60">💡 Tips: Use clear, recent photos. Include at least one close-up and one full-length photo. Avoid group photos as your primary.</p>
              </div>
            </div>
          )}

          {/* Career Tab */}
          {activeTab === 'career' && (
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Education & Career
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Education</label>
                  <select name="education" value={profile.education} onChange={handleChange} className="input-field">
                    <option value="" className="bg-white dark:bg-dark-900">Select</option>
                    {["Bachelor's","Master's","MBA","B.Tech/B.E","M.Tech","MBBS","MD","CA","PhD","Other"].map(e => (
                      <option key={e} value={e} className="bg-white dark:bg-dark-900">{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Occupation</label>
                  <input type="text" name="occupation" value={profile.occupation} onChange={handleChange} className="input-field" placeholder="e.g., Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Annual Income</label>
                  <select name="income" value={profile.income} onChange={handleChange} className="input-field">
                    <option value="" className="bg-white dark:bg-dark-900">Select</option>
                    {['Below 5 LPA','5-10 LPA','10-15 LPA','15-20 LPA','20-30 LPA','30-50 LPA','50+ LPA'].map(i => (
                      <option key={i} value={i} className="bg-white dark:bg-dark-900">{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mt-6 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Location
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="text" name="city" value={profile.city} onChange={handleChange} className="input-field" placeholder="City" />
                <input type="text" name="state" value={profile.state} onChange={handleChange} className="input-field" placeholder="State" />
                <input type="text" name="country" value={profile.country} onChange={handleChange} className="input-field" placeholder="Country" />
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" /> Partner Preferences
              </h2>
              <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-4">Help our AI find better matches by telling us what you&apos;re looking for.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Age Range</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" name="partnerAgeMin" value={profile.partnerAgeMin} onChange={handleChange} className="input-field w-20 text-center" />
                    <span className="text-purple-400/40 text-xs">to</span>
                    <input type="number" name="partnerAgeMax" value={profile.partnerAgeMax} onChange={handleChange} className="input-field w-20 text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Religion</label>
                  <select name="partnerReligion" value={profile.partnerReligion} onChange={handleChange} className="input-field">
                    {['Any','Hindu','Muslim','Sikh','Christian','Jain'].map(r => (
                      <option key={r} value={r} className="bg-white dark:bg-dark-900">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Education</label>
                  <select name="partnerEducation" value={profile.partnerEducation} onChange={handleChange} className="input-field">
                    {['Any','Graduate+','Postgraduate','Professional Degree'].map(e => (
                      <option key={e} value={e} className="bg-white dark:bg-dark-900">{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-purple-200/50 mb-1.5">Location</label>
                  <input type="text" name="partnerCity" value={profile.partnerCity} onChange={handleChange} className="input-field" placeholder="e.g., Mumbai, Delhi, Any" />
                </div>
              </div>
            </div>
          )}

          {/* Video Intro Tab */}
          {activeTab === 'video' && (
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <Video className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Video Introduction
              </h2>
              <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-4">Record a short video to introduce yourself. Profiles with videos get 5x more responses!</p>
              
              <div className="border-2 border-dashed border-teal-200/50 dark:border-purple-500/20 rounded-2xl p-10 text-center hover:border-purple-400/40 transition-colors">
                <Video className="h-12 w-12 text-teal-600 dark:text-purple-400/30 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Upload Your Video Introduction</h3>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-4">Maximum 2 minutes • MP4, MOV format</p>
                <label className="btn-primary px-6 py-2.5 text-sm cursor-pointer inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Choose Video
                  <input type="file" accept="video/*" className="hidden" />
                </label>
              </div>

              <div className="mt-5 p-4 bg-teal-50/50 dark:bg-purple-500/5 border border-teal-100 dark:border-purple-500/10 rounded-xl">
                <h4 className="text-sm font-medium text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Tips for a great video
                </h4>
                <ul className="space-y-2">
                  {[
                    'Introduce yourself naturally — name, occupation, hobbies',
                    'Mention what you\'re looking for in a partner',
                    'Keep it under 90 seconds for best engagement',
                    'Film in good lighting with clear audio',
                    'Be genuine and smile!'
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-slate-400 dark:text-purple-300/50 flex items-start gap-2">
                      <Star className="h-3 w-3 text-teal-600 dark:text-purple-400/60 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button type="submit" disabled={loading} className="w-full mt-6 btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-base">
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
