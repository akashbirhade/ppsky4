'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, Heart, Crown, Shield, AlertTriangle, TrendingUp, Activity, Eye, MessageCircle, UserX, CheckCircle, Clock, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  activeToday: number
  premiumUsers: number
  verifiedUsers: number
  totalMatches: number
  messagesWeek: number
  reportsOpen: number
  revenue: number
  registrationsWeek: number[]
  matchesWeek: number[]
  retentionRate: number
  avgSessionTime: string
}

const MOCK_ANALYTICS: AnalyticsData = {
  totalUsers: 125430,
  activeToday: 8920,
  premiumUsers: 12540,
  verifiedUsers: 89200,
  totalMatches: 34560,
  messagesWeek: 287600,
  reportsOpen: 23,
  revenue: 3750000,
  registrationsWeek: [320, 450, 380, 520, 610, 480, 550],
  matchesWeek: [180, 240, 210, 320, 290, 350, 310],
  retentionRate: 72,
  avgSessionTime: '12m 34s',
}

const REPORTED_USERS = [
  { id: '1', name: 'Suspicious User', reason: 'Fake photos', reportedBy: 3, date: '2026-05-27', status: 'pending' },
  { id: '2', name: 'Spam Account', reason: 'Sending spam messages', reportedBy: 7, date: '2026-05-26', status: 'pending' },
  { id: '3', name: 'Harasser', reason: 'Inappropriate messages', reportedBy: 5, date: '2026-05-26', status: 'investigating' },
  { id: '4', name: 'Catfish Profile', reason: 'Identity fraud', reportedBy: 2, date: '2026-05-25', status: 'resolved' },
]

const RECENT_REGISTRATIONS = [
  { id: '1', name: 'Aanya Singh', email: 'aanya@email.com', date: '2 min ago', verified: false },
  { id: '2', name: 'Rohan Kapoor', email: 'rohan@email.com', date: '8 min ago', verified: true },
  { id: '3', name: 'Meghna Rao', email: 'meghna@email.com', date: '15 min ago', verified: false },
  { id: '4', name: 'Arjun Nair', email: 'arjun@email.com', date: '22 min ago', verified: true },
  { id: '5', name: 'Ishita Joshi', email: 'ishita@email.com', date: '30 min ago', verified: true },
]

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'revenue'>('overview')
  const [data] = useState<AnalyticsData>(MOCK_ANALYTICS)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  if (!user) return null

  const stats = [
    { icon: Users, label: 'Total Users', value: data.totalUsers.toLocaleString(), change: '+12.5%', up: true, color: 'from-purple-500 to-fuchsia-500' },
    { icon: Activity, label: 'Active Today', value: data.activeToday.toLocaleString(), change: '+5.2%', up: true, color: 'from-blue-500 to-cyan-500' },
    { icon: Crown, label: 'Premium Users', value: data.premiumUsers.toLocaleString(), change: '+8.1%', up: true, color: 'from-amber-500 to-yellow-500' },
    { icon: Heart, label: 'Total Matches', value: data.totalMatches.toLocaleString(), change: '+15.3%', up: true, color: 'from-pink-500 to-rose-500' },
    { icon: Shield, label: 'Verified Users', value: `${Math.round(data.verifiedUsers / data.totalUsers * 100)}%`, change: '+2.1%', up: true, color: 'from-green-500 to-emerald-500' },
    { icon: DollarSign, label: 'Revenue (Month)', value: `₹${(data.revenue / 100000).toFixed(1)}L`, change: '+18.7%', up: true, color: 'from-indigo-500 to-purple-500' },
    { icon: MessageCircle, label: 'Messages (Week)', value: `${(data.messagesWeek / 1000).toFixed(0)}K`, change: '+3.4%', up: true, color: 'from-teal-500 to-green-500' },
    { icon: AlertTriangle, label: 'Open Reports', value: data.reportsOpen.toString(), change: '-12%', up: false, color: 'from-red-500 to-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-teal-600 dark:text-purple-400" /> Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-purple-200/50 mt-1">Platform analytics & user management</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">Live</span>
            <span className="text-slate-300 dark:text-purple-300/30 ml-2">Last updated: Just now</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] p-1.5 rounded-2xl border border-teal-100 dark:border-purple-500/10 overflow-x-auto">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'users' as const, label: 'Users', icon: Users },
            { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
            { id: 'revenue' as const, label: 'Revenue', icon: DollarSign },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30'
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:text-purple-200 hover:bg-white/5'
              }`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
              {tab.id === 'reports' && data.reportsOpen > 0 && (
                <span className="w-5 h-5 bg-red-500 text-slate-800 dark:text-white text-[9px] font-bold rounded-full flex items-center justify-center">{data.reportsOpen}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card !p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-slate-800 dark:text-white" />
                    </div>
                    <span className={`text-[10px] flex items-center gap-0.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-300 dark:text-purple-300/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Registration Chart */}
              <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600 dark:text-purple-400" /> New Registrations (7 days)
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {data.registrationsWeek.map((val, i) => {
                    const max = Math.max(...data.registrationsWeek)
                    const height = (val / max) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-slate-300 dark:text-purple-300/40">{val}</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-fuchsia-500 transition-all duration-500"
                          style={{ height: `${height}%`, minHeight: '8px' }} />
                        <span className="text-[9px] text-slate-300 dark:text-purple-300/30">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Matches Chart */}
              <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" /> Successful Matches (7 days)
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {data.matchesWeek.map((val, i) => {
                    const max = Math.max(...data.matchesWeek)
                    const height = (val / max) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-slate-300 dark:text-purple-300/40">{val}</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-pink-600 to-rose-400 transition-all duration-500"
                          style={{ height: `${height}%`, minHeight: '8px' }} />
                        <span className="text-[9px] text-slate-300 dark:text-purple-300/30">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card !p-5 text-center animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.retentionRate}%</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">30-Day Retention Rate</p>
                <div className="w-full h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${data.retentionRate}%` }} />
                </div>
              </div>
              <div className="glass-card !p-5 text-center animate-fade-in-up" style={{ animationDelay: '0.45s', opacity: 0 }}>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.avgSessionTime}</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">Avg. Session Duration</p>
                <div className="w-full h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="glass-card !p-5 text-center animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">10%</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">Premium Conversion Rate</p>
                <div className="w-full h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-fade-in-up">
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Recent Registrations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-teal-100 dark:border-purple-500/10">
                      <th className="text-left py-3 px-2 text-slate-300 dark:text-purple-300/40 font-medium">User</th>
                      <th className="text-left py-3 px-2 text-slate-300 dark:text-purple-300/40 font-medium">Email</th>
                      <th className="text-left py-3 px-2 text-slate-300 dark:text-purple-300/40 font-medium">Registered</th>
                      <th className="text-left py-3 px-2 text-slate-300 dark:text-purple-300/40 font-medium">Status</th>
                      <th className="text-left py-3 px-2 text-slate-300 dark:text-purple-300/40 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_REGISTRATIONS.map(u => (
                      <tr key={u.id} className="border-b border-purple-500/5 hover:bg-teal-50/50 dark:bg-purple-500/5 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                                <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                                <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
                              </svg>
                            </div>
                            <span className="text-slate-800 dark:text-white font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-400 dark:text-purple-300/50">{u.email}</td>
                        <td className="py-3 px-2 text-slate-400 dark:text-purple-300/50 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {u.date}
                        </td>
                        <td className="py-3 px-2">
                          {u.verified ? (
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Verified</span>
                          ) : (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <button className="text-[10px] bg-teal-50 dark:bg-purple-500/10 text-slate-600 dark:text-purple-300 px-2 py-1 rounded-lg hover:bg-teal-100/50 dark:bg-purple-500/20 transition-all">View</button>
                            <button className="text-[10px] bg-red-500/10 text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-all">Ban</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in-up space-y-4">
            {REPORTED_USERS.map((report, i) => (
              <div key={report.id} className="glass-card !p-4 flex items-center gap-4" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  report.status === 'pending' ? 'bg-red-500/10' : report.status === 'investigating' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                }`}>
                  {report.status === 'resolved' ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                   report.status === 'investigating' ? <Eye className="h-5 w-5 text-yellow-400" /> :
                   <AlertTriangle className="h-5 w-5 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{report.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      report.status === 'pending' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
                      report.status === 'investigating' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                      'bg-green-500/10 text-green-300 border-green-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-purple-200/50 mt-0.5">{report.reason} • Reported by {report.reportedBy} users • {report.date}</p>
                </div>
                <div className="flex gap-2">
                  {report.status !== 'resolved' && (
                    <>
                      <button className="text-xs bg-red-500/10 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1">
                        <UserX className="h-3 w-3" /> Ban
                      </button>
                      <button className="text-xs bg-green-500/10 text-green-300 px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all">
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="animate-fade-in-up">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="glass-card !p-5 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">₹37.5L</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">Monthly Revenue</p>
              </div>
              <div className="glass-card !p-5 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">₹299</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">ARPU (Avg Revenue/User)</p>
              </div>
              <div className="glass-card !p-5 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">87%</p>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-1">Renewal Rate</p>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Revenue by Plan</h3>
              <div className="space-y-4">
                {[
                  { plan: 'Platinum', revenue: 18.5, users: 3200, pct: 49 },
                  { plan: 'Gold', revenue: 14.2, users: 6800, pct: 38 },
                  { plan: 'Silver', revenue: 4.8, users: 2540, pct: 13 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-800 dark:text-white">{item.plan}</span>
                      <span className="text-xs text-slate-500 dark:text-purple-200/50">₹{item.revenue}L • {item.users.toLocaleString()} users</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-1000"
                        style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
