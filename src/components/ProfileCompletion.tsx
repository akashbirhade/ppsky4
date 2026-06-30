'use client'

import { useMemo } from 'react'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProfileCompletionProps {
  user: {
    name?: string
    photos?: string[]
    religion?: string
    education?: string
    occupation?: string
    city?: string
    about?: string
    height?: string
    partnerPreferences?: Record<string, any>
    verified?: boolean
  }
}

const FIELDS = [
  { key: 'name', label: 'Name', weight: 10 },
  { key: 'photos', label: 'Profile Photo', weight: 15, check: (v: any) => v && v.length > 0 },
  { key: 'religion', label: 'Religion', weight: 8 },
  { key: 'education', label: 'Education', weight: 10 },
  { key: 'occupation', label: 'Occupation', weight: 10 },
  { key: 'city', label: 'City', weight: 8 },
  { key: 'height', label: 'Height', weight: 5 },
  { key: 'about', label: 'About Me', weight: 14 },
  { key: 'partnerPreferences', label: 'Partner Preferences', weight: 10, check: (v: any) => v && Object.keys(v).length > 0 },
  { key: 'verified', label: 'Verified Profile', weight: 10, check: (v: any) => v === true },
]

export default function ProfileCompletion({ user }: ProfileCompletionProps) {
  const { percentage, completed, missing } = useMemo(() => {
    let totalWeight = 0
    let earnedWeight = 0
    const completedFields: string[] = []
    const missingFields: string[] = []

    FIELDS.forEach(field => {
      totalWeight += field.weight
      const value = (user as any)?.[field.key]
      const isComplete = field.check ? field.check(value) : (value && value !== '')

      if (isComplete) {
        earnedWeight += field.weight
        completedFields.push(field.label)
      } else {
        missingFields.push(field.label)
      }
    })

    return {
      percentage: Math.round((earnedWeight / totalWeight) * 100),
      completed: completedFields,
      missing: missingFields,
    }
  }, [user])

  const getColor = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getMessage = () => {
    if (percentage === 100) return 'Your profile is complete! You\'ll get 5x more matches.'
    if (percentage >= 80) return 'Almost there! Complete your profile for maximum visibility.'
    if (percentage >= 50) return 'Good start! Add more details to get better matches.'
    return 'Complete your profile to start getting matches.'
  }

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-white">Profile Strength</h3>
        <span className={`text-sm font-bold ${percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-200 dark:bg-purple-900/30 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-purple-200/60 mb-2">{getMessage()}</p>

      {/* Missing fields with action */}
      {missing.length > 0 && percentage < 100 && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {missing.slice(0, 4).map(field => (
              <Link key={field} href="/profile" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-xs text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                <AlertCircle className="h-3 w-3" /> {field}
              </Link>
            ))}
            {missing.length > 4 && (
              <span className="text-xs text-slate-400">+{missing.length - 4} more</span>
            )}
          </div>
          <Link href="/profile" className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors mt-1">
            Complete your profile <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {percentage === 100 && (
        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
          <CheckCircle className="h-4 w-4" /> All sections complete
        </div>
      )}
    </div>
  )
}
