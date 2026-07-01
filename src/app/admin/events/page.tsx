'use client'

import { useState } from 'react'
import { Calendar, Plus, MapPin, Users, Clock, Trash2, Edit2 } from 'lucide-react'

interface Event {
  id: string
  title: string
  type: 'speed-dating' | 'mixer' | 'workshop' | 'webinar'
  date: string
  time: string
  location: string
  capacity: number
  registered: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  description: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Mumbai Speed Dating Night', type: 'speed-dating', date: '2026-07-15', time: '7:00 PM', location: 'The Taj, Mumbai', capacity: 50, registered: 38, status: 'upcoming', description: 'Meet 10 potential matches in one evening!' },
    { id: '2', title: 'Bangalore Professionals Mixer', type: 'mixer', date: '2026-07-20', time: '6:30 PM', location: 'Cubbon Park Cafe, Bangalore', capacity: 80, registered: 65, status: 'upcoming', description: 'Network and meet like-minded professionals.' },
    { id: '3', title: 'Relationship Goals Workshop', type: 'workshop', date: '2026-07-10', time: '4:00 PM', location: 'Online (Zoom)', capacity: 200, registered: 142, status: 'upcoming', description: 'Learn about building healthy relationships.' },
    { id: '4', title: 'Delhi Singles Meet', type: 'mixer', date: '2026-06-25', time: '5:00 PM', location: 'Connaught Place, Delhi', capacity: 60, registered: 60, status: 'completed', description: 'A casual meetup for Delhi singles.' },
    { id: '5', title: 'Astrology & Compatibility Webinar', type: 'webinar', date: '2026-06-20', time: '8:00 PM', location: 'Online', capacity: 500, registered: 320, status: 'completed', description: 'Understanding kundali matching in modern dating.' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', type: 'mixer', date: '', time: '', location: '', capacity: '', description: '' })

  function handleCreate() {
    if (!newEvent.title || !newEvent.date) return
    setEvents(prev => [...prev, {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type as Event['type'],
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      capacity: Number(newEvent.capacity) || 50,
      registered: 0,
      status: 'upcoming',
      description: newEvent.description,
    }])
    setNewEvent({ title: '', type: 'mixer', date: '', time: '', location: '', capacity: '', description: '' })
    setShowForm(false)
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const statusColors = {
    upcoming: 'bg-blue-500/20 text-blue-300',
    ongoing: 'bg-green-500/20 text-green-300',
    completed: 'bg-gray-500/20 text-gray-300',
    cancelled: 'bg-red-500/20 text-red-300',
  }

  const typeColors = {
    'speed-dating': 'bg-pink-500/20 text-pink-300',
    mixer: 'bg-purple-500/20 text-purple-300',
    workshop: 'bg-amber-500/20 text-amber-300',
    webinar: 'bg-teal-500/20 text-teal-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-teal-400" /> Event Management
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all">
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{events.filter(e => e.status === 'upcoming').length}</p>
          <p className="text-xs text-purple-200/60">Upcoming</p>
        </div>
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{events.reduce((a, e) => a + e.registered, 0)}</p>
          <p className="text-xs text-purple-200/60">Total Registrations</p>
        </div>
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{events.filter(e => e.status === 'completed').length}</p>
          <p className="text-xs text-purple-200/60">Completed</p>
        </div>
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{Math.round(events.reduce((a, e) => a + (e.registered / e.capacity), 0) / events.length * 100)}%</p>
          <p className="text-xs text-purple-200/60">Avg Fill Rate</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-purple-200/60 mb-1 block">Event Title</label>
              <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mumbai Speed Dating Night" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Type</label>
              <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white outline-none">
                <option value="speed-dating">Speed Dating</option>
                <option value="mixer">Mixer / Meetup</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Capacity</label>
              <input type="number" value={newEvent.capacity} onChange={e => setNewEvent(p => ({ ...p, capacity: e.target.value }))} placeholder="50" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Date</label>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white outline-none" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Time</label>
              <input value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} placeholder="7:00 PM" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-purple-200/60 mb-1 block">Location</label>
              <input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="Venue or Online" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-purple-200/60 mb-1 block">Description</label>
              <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={2} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none resize-none" />
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all">Create Event</button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[event.type]}`}>{event.type}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[event.status]}`}>{event.status}</span>
                </div>
                <p className="text-xs text-purple-200/50 mb-2">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-purple-200/60">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {event.date} at {event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.registered}/{event.capacity} registered</span>
                </div>
                {/* Fill bar */}
                <div className="mt-3 w-full max-w-xs h-1.5 bg-purple-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg text-purple-200/40 hover:text-white hover:bg-white/10 transition-all"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => deleteEvent(event.id)} className="p-2 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
