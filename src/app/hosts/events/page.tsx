'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { CalendarDays, MapPin, Users, IndianRupee, ArrowLeft, Clock, Tag } from 'lucide-react'

interface HostEvent {
  id: string
  title: string
  description: string
  date: string
  venue: string
  fee: number
  maxParticipants: number
  participantCount: number
  hostId: string
  hostName: string
  hostCity: string
  hostRegion: string
  hostCommunity: string
}

export default function AllEventsPage() {
  const { authFetch } = useAuth()
  const [events, setEvents] = useState<HostEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    authFetch('/api/hosts/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [authFetch])

  const now = new Date()
  const filtered = events.filter(e => {
    if (filter === 'upcoming') return new Date(e.date) >= now
    if (filter === 'past') return new Date(e.date) < now
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-[#0a0118] dark:to-[#1a0533] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 hover:bg-slate-50 dark:hover:bg-white/10 transition">
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-purple-300" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              All Host Events
            </h1>
            <p className="text-sm text-slate-500 dark:text-purple-300/60">
              Matrimony meets & gatherings across all regions
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-purple-500/20 text-slate-600 dark:text-purple-300 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              {tab === 'all' ? 'All Events' : tab === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400 dark:text-purple-300/40 self-center">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-purple-300/50">Loading events...</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <CalendarDays className="h-16 w-16 mx-auto text-slate-300 dark:text-purple-500/30 mb-4" />
            <p className="text-slate-500 dark:text-purple-300/50 text-lg">No events found</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(event => {
              const eventDate = new Date(event.date)
              const isPast = eventDate < now
              const spotsLeft = event.maxParticipants - event.participantCount

              return (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-white/5 border rounded-2xl p-6 transition hover:shadow-lg ${
                    isPast
                      ? 'border-slate-200 dark:border-purple-500/10 opacity-70'
                      : 'border-teal-200/50 dark:border-teal-500/20 hover:border-teal-300 dark:hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{event.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-purple-300/50 mt-1">{event.description}</p>
                    </div>
                    {isPast ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-purple-300/50">Past</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">Upcoming</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <CalendarDays className="h-4 w-4 text-teal-500" />
                      {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <Clock className="h-4 w-4 text-teal-500" />
                      {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <IndianRupee className="h-4 w-4 text-teal-500" />
                      {event.fee > 0 ? `₹${event.fee}` : 'Free'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <Users className="h-4 w-4 text-teal-500" />
                      {event.participantCount}/{event.maxParticipants} joined
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-purple-200/70">
                      <Tag className="h-4 w-4 text-teal-500" />
                      {event.hostCommunity}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between">
                    <div className="text-xs text-slate-400 dark:text-purple-300/40">
                      Hosted by <span className="font-medium text-slate-600 dark:text-purple-200/70">{event.hostName}</span> • {event.hostCity}, {event.hostRegion}
                    </div>
                    {!isPast && spotsLeft > 0 && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{spotsLeft} spots left</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
