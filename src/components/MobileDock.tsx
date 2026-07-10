'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, MessageCircle, Crown, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function MobileDock() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Spacer to prevent content being hidden behind dock */}
      <div className="h-24 md:hidden" />

      {/* Bottom Dock — floating pill */}
      <nav className="fixed bottom-0 inset-x-0 z-[90] md:hidden pointer-events-none">
        <div className="mx-3 mb-3 rounded-[26px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-purple-500/20 shadow-[0_-6px_40px_-8px_rgba(124,58,237,0.35)] px-2.5 pt-2.5 pb-2 safe-bottom pointer-events-auto">
          <div className="flex items-end justify-between max-w-md mx-auto">
            {/* Home */}
            <Link
              href="/dashboard"
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
                isActive('/dashboard')
                  ? 'text-purple-600 dark:text-purple-300'
                  : 'text-slate-400 dark:text-slate-500 hover:text-purple-500 dark:hover:text-purple-300'
              }`}
            >
              <Home className={`h-[22px] w-[22px] transition-transform ${isActive('/dashboard') ? 'scale-110' : ''}`} strokeWidth={isActive('/dashboard') ? 2.4 : 2} />
              <span className="text-[10px] font-semibold">Home</span>
              {isActive('/dashboard') && <span className="w-1 h-1 rounded-full bg-purple-500" />}
            </Link>

            {/* Matches */}
            <Link
              href="/matches"
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
                isActive('/matches')
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-pink-500 dark:hover:text-pink-400'
              }`}
            >
              <Heart className={`h-[22px] w-[22px] transition-transform ${isActive('/matches') ? 'scale-110 fill-pink-500/20' : ''}`} strokeWidth={isActive('/matches') ? 2.4 : 2} />
              <span className="text-[10px] font-semibold">Matches</span>
              {isActive('/matches') && <span className="w-1 h-1 rounded-full bg-pink-500" />}
            </Link>

            {/* Center: Discover (elevated) */}
            <Link
              href="/search"
              className="flex flex-1 flex-col items-center -mt-6"
              aria-label="Discover"
            >
              <span className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_8px_24px_-4px_rgba(219,39,119,0.6)] ring-4 ring-white/80 dark:ring-slate-900/80 transition-transform active:scale-95">
                <Sparkles className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-300 mt-1">Discover</span>
            </Link>

            {/* Chat */}
            <Link
              href="/messages"
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
                isActive('/messages')
                  ? 'text-purple-600 dark:text-purple-300'
                  : 'text-slate-400 dark:text-slate-500 hover:text-purple-500 dark:hover:text-purple-300'
              }`}
            >
              <MessageCircle className={`h-[22px] w-[22px] transition-transform ${isActive('/messages') ? 'scale-110' : ''}`} strokeWidth={isActive('/messages') ? 2.4 : 2} />
              <span className="text-[10px] font-semibold">Chat</span>
              {isActive('/messages') && <span className="w-1 h-1 rounded-full bg-purple-500" />}
            </Link>

            {/* Upgrade / Premium */}
            {user.premium ? (
              <div className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-amber-500">
                <Crown className="h-[22px] w-[22px]" strokeWidth={2.2} />
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Premium</span>
              </div>
            ) : (
              <Link
                href="/checkout?plan=gold"
                className="flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all text-amber-500 hover:text-amber-600"
              >
                <div className="relative">
                  <Crown className="h-[22px] w-[22px]" strokeWidth={2.2} />
                  <span className="absolute -top-2 -right-3 text-[8px] font-bold bg-red-500 text-white px-1 rounded-full">70%</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Upgrade</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
