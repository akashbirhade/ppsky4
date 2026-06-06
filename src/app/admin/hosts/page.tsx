'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Users, MapPin, Search, UserPlus, ArrowRightLeft, BarChart3, X } from 'lucide-react'

interface Host {
  id: string
  name: string
  profilePhoto: string | null
  mobile: string
  email: string
  region: string
  district: string
  city: string
  community: string | null
  status: string
  _count: { members: number; events: number }
}

export default function AdminHostsPage() {
  const { user, authFetch } = useAuth()
  const router = useRouter()
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingHost, setEditingHost] = useState<Host | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferData, setTransferData] = useState({ fromHostId: '', toHostId: '', userId: '' })
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', region: '', district: '', city: '', community: '',
  })

  useEffect(() => {
    fetchHosts()
  }, [])

  const fetchHosts = async () => {
    try {
      const res = await authFetch('/api/hosts?limit=100')
      const json = await res.json()
      if (json.success) setHosts(json.data.hosts)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await authFetch('/api/hosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setHosts(prev => [{ ...json.data, _count: { members: 0, events: 0 } }, ...prev])
        setShowCreateForm(false)
        resetForm()
      }
    } catch (err) { console.error(err) }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHost) return
    try {
      const res = await authFetch(`/api/hosts/${editingHost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setHosts(prev => prev.map(h => h.id === editingHost.id ? { ...h, ...json.data } : h))
        setEditingHost(null)
        resetForm()
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (hostId: string) => {
    if (!confirm('Are you sure you want to delete this host?')) return
    try {
      const res = await authFetch(`/api/hosts/${hostId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) setHosts(prev => prev.filter(h => h.id !== hostId))
    } catch (err) { console.error(err) }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await authFetch(`/api/hosts/${transferData.fromHostId}/members/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toHostId: transferData.toHostId, userId: transferData.userId }),
      })
      const json = await res.json()
      if (json.success) {
        setShowTransferModal(false)
        setTransferData({ fromHostId: '', toHostId: '', userId: '' })
        fetchHosts()
      }
    } catch (err) { console.error(err) }
  }

  const startEdit = (host: Host) => {
    setEditingHost(host)
    setForm({
      name: host.name,
      mobile: host.mobile,
      email: host.email,
      region: host.region,
      district: host.district,
      city: host.city,
      community: host.community || '',
    })
  }

  const resetForm = () => {
    setForm({ name: '', mobile: '', email: '', region: '', district: '', city: '', community: '' })
  }

  const filteredHosts = hosts.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Host Management
            </h1>
            <p className="text-slate-500 dark:text-purple-300/70 mt-1">
              Manage regional hosts, assign members, and track performance
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition text-sm font-medium"
            >
              <ArrowRightLeft size={16} />
              Transfer Member
            </button>
            <button
              onClick={() => { setShowCreateForm(true); setEditingHost(null); resetForm() }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition text-sm font-medium"
            >
              <Plus size={16} />
              Add Host
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hosts by name, region, or city..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingHost) && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingHost ? 'Edit Host' : 'Create New Host'}
              </h2>
              <button
                onClick={() => { setShowCreateForm(false); setEditingHost(null); resetForm() }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingHost ? handleUpdate : handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput label="Name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} required />
              <FormInput label="Mobile" value={form.mobile} onChange={(v) => setForm(f => ({ ...f, mobile: v }))} required />
              <FormInput label="Email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} type="email" required />
              <FormInput label="Region" value={form.region} onChange={(v) => setForm(f => ({ ...f, region: v }))} required />
              <FormInput label="District" value={form.district} onChange={(v) => setForm(f => ({ ...f, district: v }))} required />
              <FormInput label="City" value={form.city} onChange={(v) => setForm(f => ({ ...f, city: v }))} required />
              <FormInput label="Community (optional)" value={form.community} onChange={(v) => setForm(f => ({ ...f, community: v }))} />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2 mt-2">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
                  {editingHost ? 'Update Host' : 'Create Host'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setEditingHost(null); resetForm() }}
                  className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-purple-200 font-medium hover:bg-slate-300 dark:hover:bg-white/20 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Transfer Member</h2>
                <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleTransfer} className="space-y-4">
                <FormInput label="From Host ID" value={transferData.fromHostId} onChange={(v) => setTransferData(d => ({ ...d, fromHostId: v }))} required />
                <FormInput label="To Host ID" value={transferData.toHostId} onChange={(v) => setTransferData(d => ({ ...d, toHostId: v }))} required />
                <FormInput label="User ID" value={transferData.userId} onChange={(v) => setTransferData(d => ({ ...d, userId: v }))} required />
                <button type="submit" className="w-full px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
                  Transfer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{hosts.length}</p>
            <p className="text-xs text-slate-500 dark:text-purple-300/60">Total Hosts</p>
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{hosts.filter(h => h.status === 'ACTIVE').length}</p>
            <p className="text-xs text-slate-500 dark:text-purple-300/60">Active</p>
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{hosts.reduce((sum, h) => sum + h._count.members, 0)}</p>
            <p className="text-xs text-slate-500 dark:text-purple-300/60">Total Members</p>
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{hosts.reduce((sum, h) => sum + h._count.events, 0)}</p>
            <p className="text-xs text-slate-500 dark:text-purple-300/60">Total Events</p>
          </div>
        </div>

        {/* Host Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredHosts.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-slate-300 dark:text-purple-400/30 mb-4" />
            <p className="text-slate-500 dark:text-purple-300/60 text-lg">No hosts found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Host</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Region</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Members</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Events</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-purple-300/60 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHosts.map((host) => (
                    <tr key={host.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {host.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{host.name}</p>
                            <p className="text-xs text-slate-500 dark:text-purple-300/50">{host.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700 dark:text-purple-200/80">{host.city}, {host.district}</p>
                        <p className="text-xs text-slate-500 dark:text-purple-300/50">{host.region}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{host._count.members}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{host._count.events}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          host.status === 'ACTIVE'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                            : host.status === 'SUSPENDED'
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}>
                          {host.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(host)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-purple-300/60 hover:text-purple-600 dark:hover:text-purple-300 transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(host.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 dark:text-purple-300/60 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-slate-600 dark:text-purple-300/70 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  )
}
