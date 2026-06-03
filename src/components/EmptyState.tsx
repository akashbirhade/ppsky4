'use client'

import { ReactNode } from 'react'
import { Search, MessageCircle, Users, Eye, Star, Sparkles } from 'lucide-react'
import HalfHeart from './HalfHeart'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  variant?: 'default' | 'search' | 'matches' | 'messages'
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, variant = 'default' }: EmptyStateProps) {
  const defaultIcons: Record<string, ReactNode> = {
    default: <HalfHeart className="h-16 w-16" />,
    search: <Search className="h-16 w-16" />,
    matches: <Users className="h-16 w-16" />,
    messages: <MessageCircle className="h-16 w-16" />,
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in-up">
      {/* Decorative background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-[60px] scale-150" />
        <div className="relative text-purple-300/15">
          {icon || defaultIcons[variant]}
        </div>
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400/30 rounded-full animate-float" />
        <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-fuchsia-400/30 rounded-full animate-float-slow" />
        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-pulse" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-purple-200/40 max-w-sm leading-relaxed">{description}</p>

      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary text-sm py-2.5 px-6 mt-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> {actionLabel}
        </Link>
      )}
    </div>
  )
}

// Loading skeleton for profile cards
export function ProfileCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="w-full h-44 bg-purple-500/10 rounded-2xl mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-purple-500/10 rounded-lg w-2/3" />
        <div className="h-3 bg-purple-500/10 rounded-lg w-1/2" />
        <div className="h-3 bg-purple-500/10 rounded-lg w-3/4" />
        <div className="flex gap-2 mt-3">
          <div className="h-5 bg-purple-500/10 rounded-full w-16" />
          <div className="h-5 bg-purple-500/10 rounded-full w-14" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-purple-500/5">
        <div className="flex-1 h-10 bg-purple-500/5 rounded-xl" />
        <div className="flex-1 h-10 bg-purple-500/10 rounded-xl" />
      </div>
    </div>
  )
}

// Loading skeleton for lists
export function ListItemSkeleton() {
  return (
    <div className="glass-card !p-4 animate-pulse flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-purple-500/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-purple-500/10 rounded-lg w-1/3" />
        <div className="h-3 bg-purple-500/10 rounded-lg w-2/3" />
      </div>
    </div>
  )
}
