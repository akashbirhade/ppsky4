'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Search, MapPin, Users, Calendar, ChevronDown, Filter, LogIn, UserPlus } from 'lucide-react'

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
  events: any[]
  _count: { members: number; events: number }
}

export default function HostsPage() {
  const { authFetch, user } = useAuth()
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ region: '', district: '', city: '', community: '' })
  const [showFilters, setShowFilters] = useState(false)

  const fetchHosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.region) params.set('region', filters.region)
      if (filters.district) params.set('district', filters.district)
      if (filters.city) params.set('city', filters.city)
      if (filters.community) params.set('community', filters.community)
      const res = await authFetch(`/api/hosts?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setHosts(json.data.hosts)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [filters, authFetch])

  useEffect(() => { fetchHosts() }, [fetchHosts])

  const [myCommunity, setMyCommunity] = useState('')
  const [myRegion, setMyRegion] = useState('')

  // Load the logged-in user's community (caste) & region (state) to power the quick filters
  useEffect(() => {
    if (!user) return
    // Instant: use cached profile / login fields
    try {
      const cached = localStorage.getItem(`profile_data_${user.id}`)
      const p = cached ? JSON.parse(cached)?.profile : null
      const c = (p?.caste || user.caste || '').trim()
      const r = (p?.state || user.state || '').trim()
      if (c) setMyCommunity(c)
      if (r) setMyRegion(r)
    } catch {}
    // Fresh: fetch the latest profile for accurate values
    ;(async () => {
      try {
        const res = await authFetch(`/api/profiles/${user.id}`)
        if (!res.ok) return
        const data = await res.json()
        const p = data.profile
        if (p?.caste?.trim()) setMyCommunity(p.caste.trim())
        if (p?.state?.trim()) setMyRegion(p.state.trim())
      } catch {}
    })()
  }, [user, authFetch])

  const hasActiveFilters = !!(filters.region || filters.district || filters.city || filters.community)

  return (
    <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Regional Hosts
            </h1>
            <p className="text-slate-500 dark:text-purple-300/70 mt-1">
              Find your regional coordinator for personalized matchmaking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hosts/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-500/30 transition text-sm font-medium"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Host Login</span>
            </Link>
            <Link
              href="/hosts/register"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 transition text-sm font-medium"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Register as Host</span>
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Quick match filters */}
        {(myCommunity || myRegion) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-slate-500 dark:text-purple-300/60 mr-1">Quick match:</span>
            {myCommunity && (
              <button
                onClick={() =>
                  setFilters(f => ({ ...f, community: f.community === myCommunity ? '' : myCommunity }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filters.community === myCommunity
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-500/25'
                }`}
              >
                <Users size={14} />
                My community ({myCommunity})
              </button>
            )}
            {myRegion && (
              <button
                onClick={() =>
                  setFilters(f => ({ ...f, region: f.region === myRegion ? '' : myRegion }))
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filters.region === myRegion
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/25'
                }`}
              >
                <MapPin size={14} />
                My region ({myRegion})
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ region: '', district: '', city: '', community: '' })}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 dark:text-purple-300/60 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
            <div>
              <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">Community</label>
              <input
                type="text"
                value={filters.community}
                onChange={(e) => setFilters(f => ({ ...f, community: e.target.value }))}
                placeholder="e.g. Maratha, Brahmin..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">Region</label>
              <input
                type="text"
                value={filters.region}
                onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))}
                placeholder="Enter region..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">District</label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => setFilters(f => ({ ...f, district: e.target.value }))}
                placeholder="Enter district..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                placeholder="Enter city..."
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : hosts.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-slate-300 dark:text-purple-400/30 mb-4" />
            <p className="text-slate-500 dark:text-purple-300/60 text-lg">No hosts found for the selected filters</p>
          </div>
        ) : (
          <>
            {/* Host Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hosts.map((host) => (
                <Link key={host.id} href={`/hosts/${host.id}`}>
                  <div className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-500/30 transition-all duration-300">
                    {/* Host Photo & Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {host.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={host.profilePhoto} alt={host.name} className="w-full h-full object-cover" />
                        ) : (
                          host.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition">
                          {host.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-purple-300/60">
                          {host.community || 'All Communities'}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-purple-200/70 mb-3">
                      <MapPin size={14} className="text-teal-500" />
                      <span>{host.city}, {host.district}, {host.region}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-purple-200/70">
                        <Users size={14} className="text-blue-500" />
                        <span>{host._count.members} Members</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-purple-200/70">
                        <Calendar size={14} className="text-green-500" />
                        <span>{host._count.events} Events</span>
                      </div>
                    </div>

                    {/* Events Preview */}
                    {host.events && host.events.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 dark:text-purple-300/40 uppercase tracking-wider mb-2">Upcoming Event</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-purple-200/80">{host.events[0].title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-purple-300/50 mt-0.5">
                          {new Date(host.events[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {host.events[0].venue.split(',')[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
