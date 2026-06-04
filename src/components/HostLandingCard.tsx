'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Sparkles, ArrowRight, CalendarDays } from 'lucide-react'

export default function HostLandingCard() {
  const [hostUser, setHostUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('hostUser')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setHostUser(parsed)
        router.replace('/hosts/portal')
      } catch {}
    }
  }, [router])

  if (hostUser) return null

  return (
    <div className="relative max-w-4xl mx-auto px-4 text-center mt-12">
      <div className="glass-card p-10 border-emerald-200/40 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-500/5 dark:to-teal-500/5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-5">
          <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-3">
          Be a Community Host
        </h2>
        <p className="text-slate-500 dark:text-purple-200/50 mb-6 max-w-xl mx-auto">
          Lead matchmaking in your community. Manage members, organize meets, and connect families — all from your own host portal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hosts/register" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition text-sm shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4 w-4" /> Register as Host
          </Link>
          <Link href="/hosts/login" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white dark:bg-white/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition text-sm">
            <ArrowRight className="h-4 w-4" /> Host Login
          </Link>
          <Link href="/hosts/events" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white dark:bg-white/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-50 dark:hover:bg-amber-500/20 transition text-sm">
            <CalendarDays className="h-4 w-4" /> All Events
          </Link>
        </div>
      </div>
    </div>
  )
}
