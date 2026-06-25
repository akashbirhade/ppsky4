'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Crown, MapPin } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setAnalytics(await res.json())
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-purple-400" /> Analytics
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">Detailed platform metrics and insights</p>
        </div>
      </div>

      {/* Registration Trend */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" /> Registration Trend (Last 7 Days)
        </h3>
        <div className="flex items-end gap-3 h-40">
          {(data?.registrationsWeek || [0,0,0,0,0,0,0]).map((val: number, i: number) => {
            const max = Math.max(...(data?.registrationsWeek || [1]))
            const height = max > 0 ? (val / max) * 100 : 5
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-purple-300/50 font-medium">{val}</span>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-purple-600 to-fuchsia-500 transition-all duration-700 hover:from-purple-500 hover:to-fuchsia-400"
                  style={{ height: `${Math.max(height, 8)}%` }} />
                <span className="text-[10px] text-purple-300/30 mt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* User Demographics */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" /> User Demographics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Male Users</span>
                <span className="text-white">{data?.maleUsers || 0} ({data?.totalUsers ? Math.round((data.maleUsers / data.totalUsers) * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data?.totalUsers ? (data.maleUsers / data.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Female Users</span>
                <span className="text-white">{data?.femaleUsers || 0} ({data?.totalUsers ? Math.round((data.femaleUsers / data.totalUsers) * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${data?.totalUsers ? (data.femaleUsers / data.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Verified</span>
                <span className="text-white">{data?.verifiedUsers || 0}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${data?.totalUsers ? (data.verifiedUsers / data.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-200/60">Premium</span>
                <span className="text-white">{data?.premiumUsers || 0}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data?.totalUsers ? (data.premiumUsers / data.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" /> Engagement Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-500/5 rounded-xl p-4 text-center border border-purple-500/10">
              <MessageCircle className="h-6 w-6 text-teal-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{data?.totalMessages?.toLocaleString() || '0'}</p>
              <p className="text-[10px] text-purple-300/40">Total Messages</p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-4 text-center border border-purple-500/10">
              <MessageCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{data?.recentMessages?.toLocaleString() || '0'}</p>
              <p className="text-[10px] text-purple-300/40">Messages (7 days)</p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-4 text-center border border-purple-500/10">
              <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{data?.recentRegistrations || '0'}</p>
              <p className="text-[10px] text-purple-300/40">New Users (7 days)</p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-4 text-center border border-purple-500/10">
              <Crown className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{data?.activeSubscriptions || '0'}</p>
              <p className="text-[10px] text-purple-300/40">Active Subs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <p className="text-xs text-purple-300/50 mb-1">Avg Messages/User</p>
            <p className="text-lg font-bold text-white">
              {data?.totalUsers ? (data.totalMessages / data.totalUsers).toFixed(1) : '0'}
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <p className="text-xs text-purple-300/50 mb-1">Premium Conversion Rate</p>
            <p className="text-lg font-bold text-white">
              {data?.totalUsers ? ((data.premiumUsers / data.totalUsers) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <p className="text-xs text-purple-300/50 mb-1">Verification Rate</p>
            <p className="text-lg font-bold text-white">
              {data?.totalUsers ? ((data.verifiedUsers / data.totalUsers) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
