'use client'

import { useState } from 'react'
import { ClipboardList, User, Shield, Settings, Trash2, Edit2, Eye, Filter } from 'lucide-react'

interface AuditEntry {
  id: string
  action: string
  category: 'user' | 'moderation' | 'settings' | 'payment' | 'auth'
  adminEmail: string
  targetUser?: string
  details: string
  timestamp: string
  ip: string
}

export default function AuditLogPage() {
  const [filter, setFilter] = useState<'all' | 'user' | 'moderation' | 'settings' | 'payment' | 'auth'>('all')
  const [logs] = useState<AuditEntry[]>([
    { id: '1', action: 'User Banned', category: 'moderation', adminEmail: 'priya@example.com', targetUser: 'fake_user_123', details: 'Banned for fake profile / catfishing', timestamp: '2026-07-01T08:30:00Z', ip: '192.168.1.10' },
    { id: '2', action: 'Coupon Created', category: 'settings', adminEmail: 'yash@gmail.com', details: 'Created coupon WELCOME50 (50% off all plans)', timestamp: '2026-07-01T07:15:00Z', ip: '192.168.1.15' },
    { id: '3', action: 'Photo Removed', category: 'moderation', adminEmail: 'priya@example.com', targetUser: 'sneha@example.com', details: 'Removed inappropriate photo from profile', timestamp: '2026-06-30T16:00:00Z', ip: '192.168.1.10' },
    { id: '4', action: 'Refund Issued', category: 'payment', adminEmail: 'yash@gmail.com', targetUser: 'vikram@example.com', details: 'Refund ₹999 for Gold plan (duplicate charge)', timestamp: '2026-06-30T14:30:00Z', ip: '192.168.1.15' },
    { id: '5', action: 'User Verified', category: 'user', adminEmail: 'priya@example.com', targetUser: 'arjun@example.com', details: 'ID verification approved (Aadhaar)', timestamp: '2026-06-30T12:00:00Z', ip: '192.168.1.10' },
    { id: '6', action: 'Config Updated', category: 'settings', adminEmail: 'yash@gmail.com', details: 'Maintenance mode toggled OFF', timestamp: '2026-06-30T10:00:00Z', ip: '192.168.1.15' },
    { id: '7', action: 'Admin Login', category: 'auth', adminEmail: 'yash@gmail.com', details: 'Successful login from Chrome/macOS', timestamp: '2026-06-30T09:00:00Z', ip: '192.168.1.15' },
    { id: '8', action: 'Bulk Email Sent', category: 'settings', adminEmail: 'priya@example.com', details: 'Sent "New Feature: Video Calls" to 1250 users', timestamp: '2026-06-29T15:00:00Z', ip: '192.168.1.10' },
    { id: '9', action: 'User Unblocked', category: 'user', adminEmail: 'priya@example.com', targetUser: 'amit@example.com', details: 'Removed 30-day ban after appeal review', timestamp: '2026-06-29T11:00:00Z', ip: '192.168.1.10' },
    { id: '10', action: 'Event Created', category: 'settings', adminEmail: 'yash@gmail.com', details: 'Created event: Mumbai Speed Dating Night (Jul 15)', timestamp: '2026-06-28T14:00:00Z', ip: '192.168.1.15' },
    { id: '11', action: 'Report Dismissed', category: 'moderation', adminEmail: 'priya@example.com', targetUser: 'rohit@example.com', details: 'False report — photo is valid', timestamp: '2026-06-28T10:00:00Z', ip: '192.168.1.10' },
    { id: '12', action: 'Failed Login', category: 'auth', adminEmail: 'unknown@test.com', details: 'Failed admin login attempt (wrong password)', timestamp: '2026-06-27T23:30:00Z', ip: '103.45.67.89' },
  ])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.category === filter)

  const categoryIcons = {
    user: <User className="h-3.5 w-3.5 text-blue-400" />,
    moderation: <Shield className="h-3.5 w-3.5 text-red-400" />,
    settings: <Settings className="h-3.5 w-3.5 text-amber-400" />,
    payment: <ClipboardList className="h-3.5 w-3.5 text-green-400" />,
    auth: <Eye className="h-3.5 w-3.5 text-purple-400" />,
  }

  const categoryColors = {
    user: 'bg-blue-500/20 text-blue-300',
    moderation: 'bg-red-500/20 text-red-300',
    settings: 'bg-amber-500/20 text-amber-300',
    payment: 'bg-green-500/20 text-green-300',
    auth: 'bg-purple-500/20 text-purple-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-slate-400" /> Audit Log
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-purple-200/40" />
          {(['all', 'user', 'moderation', 'settings', 'payment', 'auth'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-purple-500/30 text-white border border-purple-500/50' : 'bg-white/5 text-purple-200/60 border border-purple-500/10'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(['user', 'moderation', 'settings', 'payment', 'auth'] as const).map(cat => (
          <div key={cat} className="bg-white/5 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{logs.filter(l => l.category === cat).length}</p>
            <p className="text-[10px] text-purple-200/60 capitalize">{cat}</p>
          </div>
        ))}
      </div>

      {/* Log Entries */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="divide-y divide-purple-500/10">
          {filtered.map(log => (
            <div key={log.id} className="p-4 hover:bg-white/5 transition-all">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{categoryIcons[log.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{log.action}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[log.category]}`}>{log.category}</span>
                  </div>
                  <p className="text-xs text-purple-200/50 mt-0.5">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-purple-200/40">
                    <span>by {log.adminEmail}</span>
                    {log.targetUser && <span>→ {log.targetUser}</span>}
                    <span>IP: {log.ip}</span>
                    <span className="ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-purple-200/30 text-center">Showing {filtered.length} of {logs.length} entries • Logs retained for 90 days</p>
    </div>
  )
}
