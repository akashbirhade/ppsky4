'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, X, Zap } from 'lucide-react'

export default function UpgradeOfferBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-500/15 to-rose-500/20 border border-amber-500/20 p-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(251,191,36,0.1),transparent_60%)]" />
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-amber-300/40 hover:text-white transition-colors z-10">
        <X className="h-4 w-4" />
      </button>
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white">Upgrade Now!</h3>
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
              70% OFF
            </span>
          </div>
          <p className="text-[11px] text-amber-200/60 mt-0.5">Limited time offer • Unlock all premium features</p>
        </div>
        <Link href="/checkout?plan=gold" className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
          <Zap className="h-3.5 w-3.5" /> Claim Offer
        </Link>
      </div>
    </div>
  )
}
