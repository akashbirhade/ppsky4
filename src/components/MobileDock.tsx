'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, Menu, Crown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export default function MobileDock() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  // Hide on pages that don't need it (login, register, onboarding)
  const hiddenPaths = ['/login', '/register', '/onboarding', '/call']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Spacer to prevent content being hidden behind dock */}
      <div className="h-16 md:hidden" />

      {/* Bottom Dock */}
      <nav className="fixed bottom-0 inset-x-0 z-[90] md:hidden">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-purple-500/20 px-2 py-2 safe-bottom">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive('/dashboard') 
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive('/settings') 
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-medium">Settings</span>
            </Link>

            {/* Menu / More */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                menuOpen 
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </button>

            {/* Upgrade */}
            <Link
              href="/checkout?plan=gold"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
            >
              <div className="relative">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="absolute -top-1.5 -right-3 text-[8px] font-bold bg-red-500 text-white px-1 rounded-full">70%</span>
              </div>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Upgrade</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Quick menu popover */}
      {menuOpen && (
        <div className="fixed inset-0 z-[89] md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/20 rounded-2xl shadow-2xl p-4 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-3">
              <Link href="/search" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Search</span>
              </Link>
              <Link href="/messages" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Chat</span>
              </Link>
              <Link href="/matches" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Matches</span>
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Profile</span>
              </Link>
              <Link href="/notifications" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Alerts</span>
              </Link>
              <Link href="/kundali" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Kundali</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
