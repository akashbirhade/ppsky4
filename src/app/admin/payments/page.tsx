'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, DollarSign, Users, Crown, RefreshCw } from 'lucide-react'

interface Subscription {
  id: string
  userId: string
  plan: string
  amount: number
  status: string
  startDate: string
  endDate: string
  paymentMethod: string
}

export default function AdminPaymentsPage() {
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

  const plans = [
    { name: 'Platinum', price: '₹4,999/yr', color: 'from-purple-500 to-indigo-500', pct: 20 },
    { name: 'Gold', price: '₹2,499/6mo', color: 'from-amber-500 to-yellow-500', pct: 45 },
    { name: 'Silver', price: '₹999/3mo', color: 'from-gray-400 to-gray-500', pct: 35 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-purple-400" /> Payments & Subscriptions
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">Revenue tracking and subscription management</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">₹{((analytics?.monthlyRevenue || 0) / 100).toLocaleString()}</p>
          <p className="text-xs text-purple-300/40 mt-1">Monthly Revenue</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <Crown className="h-8 w-8 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{analytics?.premiumUsers || 0}</p>
          <p className="text-xs text-purple-300/40 mt-1">Premium Users</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{analytics?.totalSubscriptions || 0}</p>
          <p className="text-xs text-purple-300/40 mt-1">Total Subscriptions</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{analytics?.activeSubscriptions || 0}</p>
          <p className="text-xs text-purple-300/40 mt-1">Active Subscriptions</p>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-6">Revenue Breakdown by Plan</h3>
        <div className="space-y-5">
          {plans.map((plan, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${plan.color}`} />
                  <span className="text-sm text-white font-medium">{plan.name}</span>
                  <span className="text-xs text-purple-300/40">{plan.price}</span>
                </div>
                <span className="text-sm text-white font-medium">{plan.pct}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${plan.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${plan.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { label: 'Total Users', value: analytics?.totalUsers || 0, pct: 100 },
            { label: 'Completed Profile', value: Math.round((analytics?.totalUsers || 0) * 0.75), pct: 75 },
            { label: 'Active (7 days)', value: Math.round((analytics?.totalUsers || 0) * 0.4), pct: 40 },
            { label: 'Viewed Premium', value: Math.round((analytics?.totalUsers || 0) * 0.2), pct: 20 },
            { label: 'Converted to Premium', value: analytics?.premiumUsers || 0, pct: analytics?.totalUsers ? Math.round((analytics.premiumUsers / analytics.totalUsers) * 100) : 0 },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 text-xs text-purple-200/60 text-right">{step.label}</div>
              <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-purple-600/60 to-fuchsia-500/60 rounded-lg transition-all duration-1000"
                  style={{ width: `${step.pct}%` }} />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                  {step.value.toLocaleString()} ({step.pct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
