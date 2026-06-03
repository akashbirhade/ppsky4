'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, ComponentType } from 'react'
import { CheckCircle, AlertCircle, Info, X, Bell } from 'lucide-react'
import HalfHeart from './HalfHeart'

type ToastType = 'success' | 'error' | 'info' | 'match' | 'notification'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  const icons: Record<ToastType, ComponentType<{ className?: string }>> = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    match: HalfHeart,
    notification: Bell,
  }
  const colors: Record<ToastType, string> = {
    success: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    error: 'from-red-500/20 to-rose-500/10 border-red-500/30',
    info: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
    match: 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
    notification: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30',
  }
  const iconColors: Record<ToastType, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    match: 'text-pink-400',
    notification: 'text-purple-400',
  }

  const Icon = icons[toast.type]

  return (
    <div className={`animate-fade-in-up bg-gradient-to-r ${colors[toast.type]} backdrop-blur-xl border rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-start gap-3 min-w-[300px]`}>
      <div className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 dark:text-purple-200/60 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 text-slate-300 dark:text-purple-300/40 hover:text-slate-800 dark:text-white transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
