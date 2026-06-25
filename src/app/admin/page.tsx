'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Crown, Shield, AlertTriangle, TrendingUp, Activity, 
  MessageCircle, DollarSign, UserPlus
} from 'lucide-react'

interface Analytics {
  totalUsers: number
  premiumUsers: number
  verifiedUsers: number
  maleUsers: number
  femaleUsers: number
  genderRatio: string
  recentRegistrations: number
  recentMessages: number
  pendingReports: number
  monthlyRevenue: number
  registrationsWeek: number[]
  totalMessages: number
  totalSubscriptions: number
  activeSubscriptions: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setAnalytics(await res.json())
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const data = analytics

  const stats = [
    { icon: Users, label: 'Total Users', value: data?.totalUsers?.toLocaleString() || '0', color: 'from-purple-500 to-fuchsia-500' },
    { icon: Crown, label: 'Premium Users', value: data?.premiumUsers?.toLocaleString() || '0', color: 'from-amber-500 to-yellow-500' },
    { icon: Shield, label: 'Verified Users', value: data?.verifiedUsers?.toLocaleString() || '0', color: 'from-green-500 to-emerald-500' },
    { icon: UserPlus, label: 'New (7 days)', value: data?.recentRegistrations?.toLocaleString() || '0', color: 'from-blue-500 to-cyan-500' },
    { icon: MessageCircle, label: 'Messages (Week)', value: data?.recentMessages?.toLocaleString() || '0', color: 'from-teal-500 to-green-500' },
    { icon: DollarSign, label: 'Revenue (Month)', value: `₹${((data?.monthlyRevenue || 0) / 100).toFixed(0)}`, color: 'from-indigo-500 to-purple-500' },
    { icon: AlertTriangle, label: 'Pending Reports', value: data?.pendingReports?.toString() || '0', color: 'from-red-500 to-orange-500' },
    { icon: Activity, label: 'Gender Ratio (M:F)', value: data?.genderRatio || '0:0', color: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-purple-300/50 text-sm mt-1">Platform overview & key metrics</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-4 hover:border-purple-500/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-purple-300/40 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" /> New Registrations (7 days)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {(data?.registrationsWeek || [0,0,0,0,0,0,0]).map((val, i) => {
              const max = Math.max(...(data?.registrationsWeek || [1]))
              const height = max > 0 ? (val / max) * 100 : 5
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-purple-300/40">{val}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-fuchsia-500 transition-all duration-500"
                    style={{ height: `${Math.max(height, 5)}%` }} />
                  <span className="text-[9px] text-purple-300/30">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" /> Platform Health
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Verified Rate</span>
                <span className="text-white font-medium">{data?.totalUsers ? Math.round((data.verifiedUsers / data.totalUsers) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" 
                  style={{ width: `${data?.totalUsers ? Math.round((data.verifiedUsers / data.totalUsers) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Premium Conversion</span>
                <span className="text-white font-medium">{data?.totalUsers ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" 
                  style={{ width: `${data?.totalUsers ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Active Subscriptions</span>
                <span className="text-white font-medium">{data?.activeSubscriptions || 0} / {data?.totalSubscriptions || 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
                  style={{ width: `${data?.totalSubscriptions ? Math.round(((data.activeSubscriptions || 0) / data.totalSubscriptions) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Gender Ratio (M:F)</span>
                <span className="text-white font-medium">{data?.genderRatio || '-'}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: `${data?.totalUsers ? Math.round((data.maleUsers / data.totalUsers) * 100) : 50}%` }} />
                <div className="h-full bg-pink-500 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{data?.totalMessages?.toLocaleString() || '0'}</p>
          <p className="text-xs text-purple-300/40 mt-1">Total Messages Sent</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{data?.totalSubscriptions?.toLocaleString() || '0'}</p>
          <p className="text-xs text-purple-300/40 mt-1">Total Subscriptions</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{data?.pendingReports || '0'}</p>
          <p className="text-xs text-purple-300/40 mt-1">Pending Reports</p>
        </div>
      </div>
    </div>
  )
}
