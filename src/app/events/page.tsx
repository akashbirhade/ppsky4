'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Calendar, MapPin, Users, Clock, Star, Crown, Heart, ArrowRight, Filter, Ticket, Video, Coffee, Sparkles, CheckCircle } from 'lucide-react'

interface MatchmakingEvent {
  id: string
  title: string
  type: 'speed-dating' | 'mixer' | 'webinar' | 'meetup' | 'festival'
  date: string
  time: string
  location: string
  isOnline: boolean
  attendees: number
  maxAttendees: number
  price: string
  image: string
  description: string
  tags: string[]
  isRegistered: boolean
  featured: boolean
}

const EVENTS: MatchmakingEvent[] = [
  {
    id: '1', title: 'Speed Dating Night – Mumbai Professionals',
    type: 'speed-dating', date: '2026-06-08', time: '7:00 PM - 10:00 PM',
    location: 'The Westin, Mumbai', isOnline: false,
    attendees: 38, maxAttendees: 50, price: '₹1,999',
    image: '🥂', description: 'Meet 15+ pre-screened professionals in one evening. 5-minute conversations, real connections.',
    tags: ['Ages 25-35', 'Professionals', 'Verified'],
    isRegistered: false, featured: true
  },
  {
    id: '2', title: 'Virtual Meet & Greet – IT Professionals',
    type: 'mixer', date: '2026-06-12', time: '8:00 PM - 9:30 PM',
    location: 'Zoom (Link sent after registration)', isOnline: true,
    attendees: 62, maxAttendees: 100, price: 'Free',
    image: '💻', description: 'Online speed networking for tech professionals. Break-out rooms, icebreakers, and fun activities.',
    tags: ['IT/Tech', 'Online', 'Free'],
    isRegistered: true, featured: false
  },
  {
    id: '3', title: 'Relationship Readiness Workshop',
    type: 'webinar', date: '2026-06-15', time: '11:00 AM - 12:30 PM',
    location: 'Online Webinar', isOnline: true,
    attendees: 120, maxAttendees: 200, price: '₹499',
    image: '📖', description: 'Expert-led session on preparing emotionally for marriage. Q&A with relationship counselors.',
    tags: ['Workshop', 'Expert-led', 'Online'],
    isRegistered: false, featured: false
  },
  {
    id: '4', title: 'Coffee Meetup – Delhi Singles',
    type: 'meetup', date: '2026-06-20', time: '4:00 PM - 6:00 PM',
    location: 'Third Wave Coffee, CP, Delhi', isOnline: false,
    attendees: 22, maxAttendees: 30, price: '₹799',
    image: '☕', description: 'Casual coffee meetup for singles. Small group, relaxed vibe, great conversations.',
    tags: ['Casual', 'Small Group', 'Delhi'],
    isRegistered: false, featured: true
  },
  {
    id: '5', title: 'Navratri Singles Festival',
    type: 'festival', date: '2026-10-02', time: '7:00 PM - 11:00 PM',
    location: 'NSCI Dome, Mumbai', isOnline: false,
    attendees: 450, maxAttendees: 1000, price: '₹2,499',
    image: '🎊', description: 'Garba night exclusively for verified singles. Dance, mingle, and find your match!',
    tags: ['Festival', 'Garba', 'Large Event'],
    isRegistered: false, featured: true
  },
  {
    id: '6', title: 'Parents Meet – Pune Chapter',
    type: 'meetup', date: '2026-06-25', time: '10:00 AM - 1:00 PM',
    location: 'Hotel Marriott, Pune', isOnline: false,
    attendees: 45, maxAttendees: 60, price: '₹999',
    image: '👨‍👩‍👧', description: 'Exclusive event for parents to meet and discuss matches for their children. Bio-data exchange included.',
    tags: ['Parents Only', 'Bio-data', 'Pune'],
    isRegistered: false, featured: false
  },
  {
    id: '7', title: 'Speed Dating – Bangalore Tech Hub',
    type: 'speed-dating', date: '2026-07-05', time: '6:30 PM - 9:30 PM',
    location: 'Taj West End, Bangalore', isOnline: false,
    attendees: 28, maxAttendees: 40, price: '₹2,499',
    image: '💜', description: 'Premium speed dating for Bangalore tech professionals. Curated matches based on AI compatibility.',
    tags: ['Ages 26-34', 'Tech', 'Premium'],
    isRegistered: false, featured: false
  },
]

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState(EVENTS)
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'registered'>('all')

  const filtered = events.filter(e => {
    if (filter === 'online') return e.isOnline
    if (filter === 'offline') return !e.isOnline
    if (filter === 'registered') return e.isRegistered
    return true
  })

  const toggleRegister = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isRegistered: !e.isRegistered, attendees: e.isRegistered ? e.attendees - 1 : e.attendees + 1 } : e))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speed-dating': return 'bg-pink-500/10 text-pink-300 border-pink-500/20'
      case 'mixer': return 'bg-blue-500/10 text-blue-300 border-blue-500/20'
      case 'webinar': return 'bg-green-500/10 text-green-300 border-green-500/20'
      case 'meetup': return 'bg-amber-500/10 text-amber-300 border-amber-500/20'
      case 'festival': return 'bg-purple-500/10 text-purple-300 border-purple-500/20'
      default: return 'bg-purple-500/10 text-purple-300 border-purple-500/20'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-4">
            <Calendar className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-pink-300">Meet In Person</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Matchmaking Events</h1>
          <p className="text-purple-200/50 max-w-lg mx-auto">Speed dating, mixers, festivals & workshops — meet your match face-to-face</p>
        </div>

        {/* Featured Event Banner */}
        {events.filter(e => e.featured)[0] && (() => {
          const feat = events.filter(e => e.featured)[0]
          return (
            <div className="glass-card !p-0 overflow-hidden mb-8 animate-fade-in-up border-pink-500/20" style={{ animationDelay: '0.05s', opacity: 0 }}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-7xl">{feat.image}</span>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/20 font-semibold">⭐ FEATURED</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(feat.type)}`}>{feat.type.replace('-', ' ')}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{feat.title}</h2>
                  <p className="text-sm text-purple-200/50 mb-4">{feat.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200/60 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(feat.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {feat.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {feat.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {feat.attendees}/{feat.maxAttendees}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleRegister(feat.id)} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
                      {feat.isRegistered ? <><CheckCircle className="h-4 w-4" /> Registered</> : <><Ticket className="h-4 w-4" /> Register — {feat.price}</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Filters */}
        <div className="flex gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          {([
            { id: 'all', label: 'All Events', icon: Calendar },
            { id: 'offline', label: 'In-Person', icon: Coffee },
            { id: 'online', label: 'Online', icon: Video },
            { id: 'registered', label: 'My Events', icon: Ticket },
          ] as const).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                filter === f.id
                  ? 'bg-purple-600/30 text-white border-purple-500/40'
                  : 'bg-white/[0.02] text-purple-200/60 border-purple-500/10 hover:bg-white/[0.05]'
              }`}>
              <f.icon className="h-3.5 w-3.5" /> {f.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filtered.map((event, i) => (
            <div key={event.id} className="glass-card !p-0 overflow-hidden flex flex-col sm:flex-row hover:border-purple-400/30 transition-all animate-fade-in-up"
              style={{ animationDelay: `${(i + 2) * 0.04}s`, opacity: 0 }}>
              {/* Date Badge */}
              <div className="sm:w-24 flex-shrink-0 bg-gradient-to-b from-purple-500/10 to-fuchsia-500/5 flex items-center justify-center p-4 sm:flex-col border-b sm:border-b-0 sm:border-r border-purple-500/10">
                <span className="text-3xl mr-3 sm:mr-0 sm:mb-2">{event.image}</span>
                <div className="sm:text-center">
                  <p className="text-xs font-bold text-white">{formatDate(event.date)}</p>
                  <p className="text-[10px] text-purple-300/40">{event.isOnline ? '🌐 Online' : '📍 In-person'}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border capitalize ${getTypeColor(event.type)}`}>{event.type.replace('-', ' ')}</span>
                    {event.featured && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-purple-200/50">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location.length > 25 ? event.location.slice(0, 25) + '...' : event.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="text-[9px] bg-purple-500/10 text-purple-300/60 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-sm font-bold text-white">{event.price}</span>
                  <button onClick={() => toggleRegister(event.id)}
                    className={`text-xs py-2 px-4 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                      event.isRegistered
                        ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                        : 'bg-purple-600/40 text-white border border-purple-500/30 hover:bg-purple-600/60'
                    }`}>
                    {event.isRegistered ? <><CheckCircle className="h-3.5 w-3.5" /> Registered</> : <><Ticket className="h-3.5 w-3.5" /> Register</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Capacity Bar */}
        <div className="mt-10 glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Why attend events?</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-purple-500/5">
              <p className="text-2xl font-bold text-white mb-1">73%</p>
              <p className="text-[11px] text-purple-200/50">of attendees find a match within 3 events</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-purple-500/5">
              <p className="text-2xl font-bold text-white mb-1">4.8★</p>
              <p className="text-[11px] text-purple-200/50">average event rating by attendees</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-purple-500/5">
              <p className="text-2xl font-bold text-white mb-1">100%</p>
              <p className="text-[11px] text-purple-200/50">verified attendees for your safety</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
