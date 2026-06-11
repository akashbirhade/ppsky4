'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Users, UserCheck, Heart, Calendar, TrendingUp, Plus, ArrowLeft, Bell } from 'lucide-react'

interface HostStats {
  totalMembers: number
  pendingInterests: number
  upcomingEvents: number
}

interface HostEvent {
  id: string
  title: string
  date: string
  venue: string
  participantCount: number
}

interface Interest {
  id: string
  fromUserId: string
  toUserId: string
  status: string
  note: string | null
  createdAt: string
}

export default function HostDashboardPage() {
  const { authFetch } = useAuth()
  const { id } = useParams()
  const [stats, setStats] = useState<HostStats | null>(null)
  const [events, setEvents] = useState<HostEvent[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', venue: '', fee: '', maxParticipants: '' })

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes, eventsRes, interestsRes] = await Promise.all([
        authFetch(`/api/hosts/${id}/stats`),
        authFetch(`/api/hosts/${id}/events`),
        authFetch(`/api/hosts/${id}/interests?status=pending`),
      ])
      const statsJson = await statsRes.json()
      const eventsJson = await eventsRes.json()
      const interestsJson = await interestsRes.json()
      if (statsJson.success) setStats(statsJson.data)
      if (eventsJson.success) setEvents(eventsJson.data)
      if (interestsJson.success) setInterests(interestsJson.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [authFetch, id])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await authFetch(`/api/hosts/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description || undefined,
          date: new Date(eventForm.date).toISOString(),
          venue: eventForm.venue,
          fee: eventForm.fee ? Number(eventForm.fee) : undefined,
          maxParticipants: eventForm.maxParticipants ? Number(eventForm.maxParticipants) : undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setEvents(prev => [json.data, ...prev])
        setShowEventForm(false)
        setEventForm({ title: '', description: '', date: '', venue: '', fee: '', maxParticipants: '' })
      }
    } catch (err) { console.error(err) }
  }

  const handleInterestAction = async (interestId: string, status: string) => {
    try {
      const res = await authFetch(`/api/hosts/${id}/interests/${interestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (json.success) {
        setInterests(prev => prev.filter(i => i.id !== interestId))
        if (stats) setStats({ ...stats, pendingInterests: stats.pendingInterests - 1 })
      }
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/hosts" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline text-sm mb-2">
              <ArrowLeft size={14} />
              Back to Hosts
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Host Dashboard
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Users size={22} />} label="Total Members" value={stats?.totalMembers || 0} color="purple" />
          <StatCard icon={<Heart size={22} />} label="Pending Interests" value={stats?.pendingInterests || 0} color="pink" />
          <StatCard icon={<Calendar size={22} />} label="Upcoming Events" value={stats?.upcomingEvents || 0} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Interests */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-pink-500" />
                Pending Interests
              </h2>
              <span className="text-sm text-slate-500 dark:text-purple-300/60">{interests.length} pending</span>
            </div>
            {interests.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-purple-300/60 text-center py-6">No pending interests</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {interests.map((interest) => (
                  <div key={interest.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-white">
                        Interest Request
                      </p>
                      {interest.note && (
                        <p className="text-xs text-slate-500 dark:text-purple-300/50 mt-0.5">{interest.note}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-purple-300/40 mt-1">
                        {new Date(interest.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInterestAction(interest.id, 'verified')}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30 transition"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleInterestAction(interest.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Events
              </h2>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                <Plus size={14} />
                Add Event
              </button>
            </div>

            {/* Event Form */}
            {showEventForm && (
              <form onSubmit={handleCreateEvent} className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(f => ({ ...f, date: e.target.value }))}
                    required
                    className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Venue"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm(f => ({ ...f, venue: e.target.value }))}
                    required
                    className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Fee (₹)"
                    value={eventForm.fee}
                    onChange={(e) => setEventForm(f => ({ ...f, fee: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Participants"
                    value={eventForm.maxParticipants}
                    onChange={(e) => setEventForm(f => ({ ...f, maxParticipants: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
                    Create Event
                  </button>
                  <button type="button" onClick={() => setShowEventForm(false)} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-purple-200 hover:bg-slate-300 dark:hover:bg-white/20 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {events.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-purple-300/60 text-center py-6">No events scheduled</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <p className="font-medium text-sm text-slate-700 dark:text-white">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-purple-300/50">
                      <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span>{event.venue}</span>
                      <span>{event.participantCount} joined</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300',
    pink: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300',
  }
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-purple-300/60">{label}</p>
    </div>
  )
}
