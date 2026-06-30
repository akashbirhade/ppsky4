'use client'

import { UserProfile } from '@/lib/database'
import { MapPin, GraduationCap, Briefcase, BadgeCheck, Crown, Sparkles, Lock } from 'lucide-react'
import HalfHeart from './HalfHeart'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from './Toast'

interface ProfileCardProps {
  profile: UserProfile
  compatibility?: number
  interestStatus?: 'none' | 'pending' | 'accepted' | 'declined'
}

export default function ProfileCard({ profile, compatibility, interestStatus = 'none' }: ProfileCardProps) {
  const { user, authFetch } = useAuth()
  const { showToast } = useToast()
  const [sending, setSending] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(interestStatus)
  // Use a deterministic score based on profile ID hash instead of Math.random()
  const fallbackScore = compatibility ? 0 : (profile.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 25 + 70)
  const score = compatibility || fallbackScore
  const isPremium = user?.premium === true
  const photoVisible = currentStatus === 'accepted'

  const handleSendInterest = async () => {
    if (!user) {
      showToast('error', 'Login Required', 'Please login to send interest')
      return
    }

    if (!isPremium) {
      showToast('info', 'Premium Required', 'Upgrade to premium to send interest')
      return
    }

    setSending(true)
    try {
      const res = await authFetch('/api/activity/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, receiverId: profile.id })
      })
      const data = await res.json()
      
      if (!res.ok) {
        showToast('error', 'Failed to Send Interest', data.error || 'Something went wrong')
      } else {
        setCurrentStatus('pending')
        showToast('success', 'Interest Sent! 💜', `You've sent interest to ${profile.name}`)
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to send interest')
    } finally {
      setSending(false)
    }
  }
  
  return (
    <div className="glass-card profile-hover group relative overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-fuchsia-600/0 group-hover:from-purple-600/5 group-hover:to-fuchsia-600/5 transition-all duration-500 rounded-3xl" />
      
      <div className="relative">
        {/* Avatar Section */}
        <div className="relative mb-4">
          <div className="w-full h-44 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-pink-500/20 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-400/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'}
              alt="Avatar"
              className={`w-full h-full object-cover transition-all duration-300 ${!photoVisible ? 'blur-[8px] scale-105' : ''}`}
            />
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
            
            {/* Visible on Accept overlay */}
            {!photoVisible && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2">
                  <Lock className="h-5 w-5 text-white/80" />
                </div>
                <span className="text-[11px] font-medium text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Visible on Accept
                </span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {profile.verified && (
              <span className="bg-blue-500/80 backdrop-blur-sm text-slate-800 dark:text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-lg">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            {profile.premium && (
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
          </div>

          {/* Compatibility Score */}
          <div className="absolute -bottom-4 right-4">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-900 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <span className="text-xs font-bold text-slate-600 dark:text-purple-300">{score}%</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white group-hover:text-slate-700 dark:text-purple-200 transition-colors">
              {profile.name}
            </h3>
            <span className="text-xs text-purple-300/60">{profile.age} yrs</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-purple-200/60">
              <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-purple-200/60">
              <GraduationCap className="h-3 w-3" /> {profile.education}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-purple-200/60">
              <Briefcase className="h-3 w-3" /> {profile.occupation}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] bg-purple-500/15 text-slate-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-teal-200/50 dark:border-purple-500/20">
              {profile.religion}
            </span>
            <span className="text-[10px] bg-fuchsia-500/15 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/20">
              {profile.motherTongue}
            </span>
            <span className="text-[10px] bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/20">
              {profile.height}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-teal-100 dark:border-purple-500/10">
          <Link href={`/profile/${profile.id}`} className="flex-1 text-center py-2.5 text-xs font-medium text-slate-700 dark:text-purple-200 bg-white/5 rounded-xl border border-purple-400/10 hover:bg-white/10 hover:border-purple-400/30 transition-all">
            View Profile
          </Link>
          {!isPremium ? (
            <Link 
              href="/premium"
              className="flex-1 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Crown className="h-3 w-3" /> Upgrade to Connect
            </Link>
          ) : currentStatus === 'pending' ? (
            <button 
              disabled
              className="flex-1 py-2.5 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/30 cursor-default flex items-center justify-center gap-1.5"
            >
              <HalfHeart className="h-3 w-3" /> Request Sent
            </button>
          ) : currentStatus === 'accepted' ? (
            <button 
              disabled
              className="flex-1 py-2.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30 cursor-default flex items-center justify-center gap-1.5"
            >
              <HalfHeart className="h-3 w-3" /> Connected
            </button>
          ) : (
            <button 
              onClick={handleSendInterest}
              disabled={sending}
              className="flex-1 py-2.5 text-xs font-medium text-slate-800 dark:text-white bg-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-purple-500/30 hover:bg-purple-600/70 transition-all flex items-center justify-center gap-1.5"
            >
              <HalfHeart className="h-3 w-3" /> {sending ? 'Sending...' : 'Connect'}
              <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
