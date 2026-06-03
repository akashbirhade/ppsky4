'use client'

import { UserProfile } from '@/lib/database'
import { MapPin, GraduationCap, Briefcase, BadgeCheck, Crown, Sparkles } from 'lucide-react'
import HalfHeart from './HalfHeart'
import Link from 'next/link'

interface ProfileCardProps {
  profile: UserProfile
  compatibility?: number
}

export default function ProfileCard({ profile, compatibility }: ProfileCardProps) {
  const score = compatibility || Math.floor(70 + Math.random() * 25)
  
  return (
    <div className="glass-card profile-hover group relative overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-fuchsia-600/0 group-hover:from-purple-600/5 group-hover:to-fuchsia-600/5 transition-all duration-500 rounded-3xl" />
      
      <div className="relative">
        {/* Avatar Section */}
        <div className="relative mb-4">
          <div className="w-full h-44 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-pink-500/20 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-400/10">
            {/* Illustrated avatar fallback */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {profile.verified && (
              <span className="bg-blue-500/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-lg">
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
            <div className="w-12 h-12 rounded-full bg-dark-900 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <span className="text-xs font-bold text-purple-300">{score}%</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white group-hover:text-purple-200 transition-colors">
              {profile.name}
            </h3>
            <span className="text-xs text-purple-300/60">{profile.age} yrs</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-purple-200/60">
              <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-200/60">
              <GraduationCap className="h-3 w-3" /> {profile.education}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-200/60">
              <Briefcase className="h-3 w-3" /> {profile.occupation}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
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
        <div className="flex gap-2 mt-4 pt-4 border-t border-purple-500/10">
          <Link href={`/profile/${profile.id}`} className="flex-1 text-center py-2.5 text-xs font-medium text-purple-200 bg-white/5 rounded-xl border border-purple-400/10 hover:bg-white/10 hover:border-purple-400/30 transition-all">
            View Profile
          </Link>
          <button className="flex-1 py-2.5 text-xs font-medium text-white bg-purple-600/50 rounded-xl border border-purple-500/30 hover:bg-purple-600/70 transition-all flex items-center justify-center gap-1.5">
            <HalfHeart className="h-3 w-3" /> Interest
            <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  )
}
