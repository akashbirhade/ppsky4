'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa_install_dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 30s delay to not interrupt browsing
      setTimeout(() => setShowPrompt(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] z-50 animate-slide-up">
      <div className="glass-card p-4 border border-purple-500/30 shadow-xl shadow-purple-500/10">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Install Soulmate Sync</h3>
            <p className="text-xs text-slate-500 dark:text-purple-200/60 mt-0.5">
              Get instant notifications, offline access & a native app feel
            </p>
            <button
              onClick={handleInstall}
              className="mt-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
