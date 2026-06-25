'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Ban, CheckCircle, Crown, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface UserRow {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  verified: boolean
  premium: boolean
  banned: boolean
  createdAt: string
  photos: string[]
  lastActive: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [actionModal, setActionModal] = useState<{ user: UserRow; action: string } | null>(null)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, filter, search])

  async function fetchUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const params = new URLSearchParams({ page: page.toString(), limit: '15', filter, search })
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  async function performAction(userId: string, action: string, reason?: string) {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, action, reason, permanent: true }),
      })
      if (res.ok) {
        fetchUsers()
        setActionModal(null)
        setBanReason('')
      }
    } catch {}
  }

  const filters = [
    { id: 'all', label: 'All Users' },
    { id: 'premium', label: 'Premium' },
    { id: 'verified', label: 'Verified' },
    { id: 'unverified', label: 'Unverified' },
    { id: 'banned', label: 'Banned' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-400" /> User Management
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">{total} total users</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/40" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30"
          />
        </div>
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-purple-500/10 overflow-x-auto">
          {filters.map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.id ? 'bg-purple-600/30 text-white border border-purple-500/30' : 'text-purple-300/50 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/10">
                  <th className="text-left py-3 px-4 text-purple-300/40 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-purple-300/40 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-purple-300/40 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left py-3 px-4 text-purple-300/40 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-purple-300/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-purple-500/5 hover:bg-purple-500/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.name}</p>
                          <p className="text-purple-300/40 text-[10px]">{u.age} • {u.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-purple-300/50 hidden sm:table-cell">{u.email}</td>
                    <td className="py-3 px-4 text-purple-300/50 hidden md:table-cell">{u.city || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.verified && <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20">Verified</span>}
                        {u.premium && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Premium</span>}
                        {u.banned && <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">Banned</span>}
                        {!u.verified && !u.premium && !u.banned && <span className="text-[9px] text-purple-300/30">Free</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {!u.banned ? (
                          <button onClick={() => setActionModal({ user: u, action: 'ban' })}
                            className="text-[10px] bg-red-500/10 text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-all">
                            Ban
                          </button>
                        ) : (
                          <button onClick={() => performAction(u.id, 'unban')}
                            className="text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-all">
                            Unban
                          </button>
                        )}
                        {!u.verified && (
                          <button onClick={() => performAction(u.id, 'verify')}
                            className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-500/20 transition-all">
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-purple-500/10">
          <p className="text-xs text-purple-300/40">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg bg-purple-500/10 text-purple-300 disabled:opacity-30 hover:bg-purple-500/20 transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg bg-purple-500/10 text-purple-300 disabled:opacity-30 hover:bg-purple-500/20 transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-[#1a0a2e] border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Ban User</h3>
              <button onClick={() => setActionModal(null)} className="text-purple-300/50 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-purple-200/60 mb-4">
              Are you sure you want to ban <span className="text-white font-medium">{actionModal.user.name}</span>?
            </p>
            <textarea
              placeholder="Reason for ban..."
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className="w-full p-3 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30 mb-4 h-20 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
                Cancel
              </button>
              <button onClick={() => performAction(actionModal.user.id, 'ban', banReason)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
