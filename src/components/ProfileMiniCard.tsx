'use client'

import { useState } from 'react'
import { MapPin, Briefcase, Crown, BadgeCheck } from 'lucide-react'
import { UserProfile } from '@/lib/database'
import HalfHeart from '@/components/HalfHeart'

interface ProfileMiniCardProps {
  profile: UserProfile
  onClick: () => void
  onSendInterest?: (e: React.MouseEvent) => void
  interestSent?: boolean
  variant?: 'default' | 'viewer'
  viewedTime?: string
}

export default function ProfileMiniCard({ profile, onClick, onSendInterest, interestSent, variant = 'default', viewedTime }: ProfileMiniCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const hasPhoto = profile.photos && profile.photos.length > 0 && !imgErr

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-purple-500/15 bg-white dark:bg-white/[0.03] hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group"
    >
      {/* Photo */}
      <div className="relative h-[150px] sm:h-[170px] bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-900/30 dark:to-dark-900">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photos![activePhoto] || profile.photos![0]}
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'}
              alt="Avatar"
              className="w-16 h-16 opacity-60"
            />
          </div>
        )}

        {/* Photo dots indicator for multiple photos */}
        {hasPhoto && profile.photos!.length > 1 && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {profile.photos!.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActivePhoto(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activePhoto ? 'bg-white shadow-sm scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Badges top */}
        <div className="absolute top-2 left-2 flex gap-1">
          {profile.verified && <BadgeCheck className="h-4 w-4 text-green-400 drop-shadow" />}
          {profile.premium && <Crown className="h-4 w-4 text-amber-400 drop-shadow" />}
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-1.5 left-2 right-2">
          <p className="text-[11px] font-bold text-white truncate drop-shadow">{profile.name}, {profile.age}</p>
        </div>

        {/* Viewed time badge */}
        {variant === 'viewer' && viewedTime && (
          <div className="absolute top-2 right-2 text-[8px] bg-black/50 text-white/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {viewedTime}
          </div>
        )}
      </div>

      {/* Horizontal scroll photo thumbnails */}
      {hasPhoto && profile.photos!.length > 1 && (
        <div className="flex gap-1 px-1.5 py-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {profile.photos!.slice(0, 6).map((photo, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActivePhoto(i) }}
              className={`shrink-0 w-7 h-7 rounded-md overflow-hidden border transition-all ${
                i === activePhoto ? 'border-purple-500 ring-1 ring-purple-500/30' : 'border-slate-200/30 dark:border-purple-500/10 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-2 space-y-0.5">
        {profile.city && (
          <p className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-purple-300/50 truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0" />{profile.city}
          </p>
        )}
        {profile.occupation && (
          <p className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-purple-300/50 truncate">
            <Briefcase className="h-2.5 w-2.5 shrink-0" />{profile.occupation}
          </p>
        )}

        {/* Action */}
        {onSendInterest && (
          <button
            onClick={(e) => { e.stopPropagation(); onSendInterest(e) }}
            disabled={interestSent}
            className={`w-full mt-1.5 py-1.5 text-[10px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
              interestSent
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'bg-purple-600/80 text-white hover:bg-purple-600'
            }`}
          >
            <HalfHeart className="h-3 w-3" />
            {interestSent ? 'Sent' : 'Interest'}
          </button>
        )}
      </div>
    </div>
  )
}
