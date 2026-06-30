'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BarChart3, Users, Shield, AlertTriangle, CreditCard, Settings, 
  CheckCircle, Home, LogOut, Menu, X 
} from 'lucide-react'

const ADMIN_EMAILS = ['admin@soulmatesync.com', 'priya@example.com']

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/verifications', label: 'Verifications', icon: CheckCircle },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/config', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    else if (user && !ADMIN_EMAILS.includes(user.email || '')) router.push('/dashboard')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
        <div className="glass-card text-center max-w-sm p-8">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-purple-200/60 text-sm">Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh pt-[80px]">
      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-[88px] left-4 z-50 p-2 rounded-xl bg-purple-900/80 border border-purple-500/20 text-white"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-[80px] left-0 h-[calc(100vh-80px)] w-64 bg-slate-900/95 dark:bg-[#0c0118]/95 backdrop-blur-xl border-r border-purple-500/10 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Admin Panel</h2>
              <p className="text-[10px] text-purple-300/50">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-purple-600/20 text-white border border-purple-500/30' 
                      : 'text-purple-300/60 hover:text-white hover:bg-purple-600/10'
                  }`}>
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : ''}`} />
                  {item.label}
                  {item.label === 'Reports' && (
                    <span className="ml-auto w-5 h-5 bg-red-500/80 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-purple-300/50 hover:text-white hover:bg-purple-600/10 transition-all">
            <LogOut className="h-4 w-4" /> Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-[calc(100vh-80px)] p-6">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
