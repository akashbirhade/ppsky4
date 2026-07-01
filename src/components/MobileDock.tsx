'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, Menu, Crown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function MobileDock() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  // Hide on pages that don't need it (login, register, onboarding)
  const hiddenPaths = ['/login', '/register', '/onboarding', '/call']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  const isActive = (path: string) => pathname === path

  const openDrawer = () => {
    window.dispatchEvent(new Event('open-side-drawer'))
  }

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

            {/* Menu - opens SideDrawer */}
            <button
              onClick={openDrawer}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-slate-500 dark:text-slate-400"
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
    </>
  )
}
