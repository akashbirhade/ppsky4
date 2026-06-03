'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Video, Users, MessageCircle, Sparkles, Heart, Coffee, CheckCircle, Plus, ChevronRight, Star, Phone, Brain } from 'lucide-react'

interface Meeting {
  id: string
  partnerId: string
  partnerName: string
  type: 'coffee' | 'video' | 'restaurant' | 'family' | 'virtual'
  date: string
  time: string
  location?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

const iceBreakers = [
  "What's your idea of a perfect weekend?",
  "If you could travel anywhere tomorrow, where would you go?",
  "What's the most meaningful tradition in your family?",
  "What hobby would you love to pick up if time weren't a constraint?",
  "What's your favorite childhood memory?",
  "How do you like to unwind after a long day?",
  "What's something you're really passionate about?",
  "What does your ideal home look like?",
]

const conversationStarters = [
  { category: 'Family', questions: ['Tell me about your family traditions', 'How close are you to your siblings?', 'What values did your parents instill in you?'] },
  { category: 'Career', questions: ['What excites you about your work?', 'Where do you see yourself in 5 years?', 'Work-life balance — what does it mean to you?'] },
  { category: 'Lifestyle', questions: ['Are you a morning person or night owl?', 'How do you spend your Sundays?', 'Do you enjoy cooking or eating out?'] },
  { category: 'Values', questions: ['What qualities matter most in a partner?', 'How do you handle disagreements?', 'What role does spirituality play in your life?'] },
]

const restaurantSuggestions = [
  { name: 'The Olive Garden', type: 'Fine Dining', rating: 4.5, distance: '2.3 km', cuisine: 'Italian' },
  { name: 'Chai Point', type: 'Casual', rating: 4.2, distance: '1.1 km', cuisine: 'Indian' },
  { name: 'Blue Tokai Coffee', type: 'Cafe', rating: 4.6, distance: '0.8 km', cuisine: 'Cafe' },
  { name: 'Bombay Brasserie', type: 'Fine Dining', rating: 4.7, distance: '3.5 km', cuisine: 'Indian' },
]

const meetingChecklist = [
  { id: 1, text: 'Confirm date & time with partner', done: false },
  { id: 2, text: 'Share meeting location details', done: false },
  { id: 3, text: 'Dress appropriately for the occasion', done: false },
  { id: 4, text: 'Prepare some conversation topics', done: false },
  { id: 5, text: 'Arrive 5-10 minutes early', done: false },
  { id: 6, text: 'Keep phone on silent', done: false },
  { id: 7, text: 'Be authentic and genuine', done: false },
]

export default function MeetingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'schedule' | 'icebreakers' | 'venues' | 'checklist' | 'timeline'>('schedule')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [checklist, setChecklist] = useState(meetingChecklist)
  const [currentIceBreaker, setCurrentIceBreaker] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [newMeeting, setNewMeeting] = useState({ partnerName: '', type: 'coffee' as Meeting['type'], date: '', time: '', location: '', notes: '' })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    // Load meetings from localStorage
    const saved = localStorage.getItem(`meetings_${user.id}`)
    if (saved) setMeetings(JSON.parse(saved))
  }, [user, router])

  const saveMeeting = () => {
    if (!newMeeting.partnerName || !newMeeting.date || !newMeeting.time) return
    const meeting: Meeting = {
      id: Date.now().toString(),
      partnerId: '',
      partnerName: newMeeting.partnerName,
      type: newMeeting.type,
      date: newMeeting.date,
      time: newMeeting.time,
      location: newMeeting.location,
      status: 'scheduled',
      notes: newMeeting.notes
    }
    const updated = [...meetings, meeting]
    setMeetings(updated)
    localStorage.setItem(`meetings_${user!.id}`, JSON.stringify(updated))
    setShowNewMeeting(false)
    setNewMeeting({ partnerName: '', type: 'coffee', date: '', time: '', location: '', notes: '' })
  }

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  const nextIceBreaker = () => {
    setCurrentIceBreaker(prev => (prev + 1) % iceBreakers.length)
  }

  if (!user) return null

  const tabs = [
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { id: 'icebreakers' as const, label: 'Ice Breakers', icon: MessageCircle },
    { id: 'venues' as const, label: 'Venues', icon: MapPin },
    { id: 'checklist' as const, label: 'Checklist', icon: CheckCircle },
    { id: 'timeline' as const, label: 'Timeline', icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs px-4 py-2 rounded-full mb-4">
            <Heart className="h-3.5 w-3.5" /> Meeting Assistant
          </div>
          <h1 className="text-3xl font-bold text-white">Plan Your Perfect Meeting</h1>
          <p className="text-purple-200/50 mt-2">AI-powered tools to help you plan, prepare, and enjoy your meetings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] p-1.5 rounded-2xl border border-purple-500/10 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                  : 'text-purple-300/50 hover:text-purple-200 hover:bg-white/5'
              }`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <button onClick={() => setShowNewMeeting(true)} className="glass-card !p-5 text-left hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <Coffee className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Coffee Date</h3>
                <p className="text-[11px] text-purple-300/40">Casual first meeting</p>
              </button>
              <button onClick={() => { setShowNewMeeting(true); setNewMeeting(p => ({...p, type: 'video'})) }} className="glass-card !p-5 text-left hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <Video className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Video Call</h3>
                <p className="text-[11px] text-purple-300/40">Virtual face-to-face</p>
              </button>
              <button onClick={() => { setShowNewMeeting(true); setNewMeeting(p => ({...p, type: 'family'})) }} className="glass-card !p-5 text-left hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3 group-hover:bg-pink-500/20 transition-colors">
                  <Users className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Family Meet</h3>
                <p className="text-[11px] text-purple-300/40">Introduce families</p>
              </button>
            </div>

            {/* New Meeting Form */}
            {showNewMeeting && (
              <div className="glass-card animate-fade-in-up">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-400" /> Schedule New Meeting
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-purple-200/50 mb-1.5">Partner Name</label>
                    <input type="text" value={newMeeting.partnerName} onChange={e => setNewMeeting(p => ({...p, partnerName: e.target.value}))} className="input-field" placeholder="Enter name..." />
                  </div>
                  <div>
                    <label className="block text-xs text-purple-200/50 mb-1.5">Meeting Type</label>
                    <select value={newMeeting.type} onChange={e => setNewMeeting(p => ({...p, type: e.target.value as Meeting['type']}))} className="input-field">
                      <option value="coffee" className="bg-dark-900">Coffee Date</option>
                      <option value="video" className="bg-dark-900">Video Call</option>
                      <option value="restaurant" className="bg-dark-900">Restaurant</option>
                      <option value="family" className="bg-dark-900">Family Meeting</option>
                      <option value="virtual" className="bg-dark-900">Virtual Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-200/50 mb-1.5">Date</label>
                    <input type="date" value={newMeeting.date} onChange={e => setNewMeeting(p => ({...p, date: e.target.value}))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-purple-200/50 mb-1.5">Time</label>
                    <input type="time" value={newMeeting.time} onChange={e => setNewMeeting(p => ({...p, time: e.target.value}))} className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-purple-200/50 mb-1.5">Location (optional)</label>
                    <input type="text" value={newMeeting.location} onChange={e => setNewMeeting(p => ({...p, location: e.target.value}))} className="input-field" placeholder="Venue or meeting link..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-purple-200/50 mb-1.5">Notes</label>
                    <textarea value={newMeeting.notes} onChange={e => setNewMeeting(p => ({...p, notes: e.target.value}))} className="input-field resize-none" rows={2} placeholder="Any notes for this meeting..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={() => setShowNewMeeting(false)} className="btn-secondary px-5 py-2 text-sm">Cancel</button>
                  <button onClick={saveMeeting} className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Schedule Meeting
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Meetings */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" /> Your Meetings
              </h3>
              {meetings.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 text-purple-400/20 mx-auto mb-3" />
                  <p className="text-sm text-purple-200/40">No meetings scheduled yet</p>
                  <p className="text-xs text-purple-300/30 mt-1">Schedule your first meeting to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map(meeting => (
                    <div key={meeting.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        meeting.type === 'coffee' ? 'bg-amber-500/10' :
                        meeting.type === 'video' ? 'bg-blue-500/10' :
                        meeting.type === 'family' ? 'bg-pink-500/10' : 'bg-purple-500/10'
                      }`}>
                        {meeting.type === 'coffee' && <Coffee className="h-5 w-5 text-amber-400" />}
                        {meeting.type === 'video' && <Video className="h-5 w-5 text-blue-400" />}
                        {meeting.type === 'family' && <Users className="h-5 w-5 text-pink-400" />}
                        {meeting.type === 'restaurant' && <MapPin className="h-5 w-5 text-green-400" />}
                        {meeting.type === 'virtual' && <Phone className="h-5 w-5 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{meeting.partnerName}</h4>
                        <p className="text-xs text-purple-300/50">{meeting.date} at {meeting.time} {meeting.location && `• ${meeting.location}`}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full ${
                        meeting.status === 'scheduled' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                        meeting.status === 'completed' ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                        'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ice Breakers Tab */}
        {activeTab === 'icebreakers' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* AI Ice Breaker Card */}
            <div className="glass-card text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Conversation Starter</h3>
                <p className="text-purple-300/40 text-sm mb-6">Perfect questions to break the ice</p>
                
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 mb-4">
                  <p className="text-lg text-white font-medium leading-relaxed">&ldquo;{iceBreakers[currentIceBreaker]}&rdquo;</p>
                </div>
                
                <button onClick={nextIceBreaker} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 mx-auto">
                  <Sparkles className="h-4 w-4" /> Next Question
                </button>
              </div>
            </div>

            {/* Conversation Topics by Category */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-400" /> Conversation Topics
              </h3>
              
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {conversationStarters.map((cat, i) => (
                  <button key={cat.category} onClick={() => setSelectedCategory(i)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === i
                        ? 'bg-purple-600/30 text-white border border-purple-500/30'
                        : 'bg-white/[0.03] text-purple-300/50 border border-purple-500/10 hover:bg-purple-500/10'
                    }`}>
                    {cat.category}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {conversationStarters[selectedCategory].questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-xl border border-purple-500/10">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] text-purple-300 shrink-0">{i + 1}</span>
                    <p className="text-sm text-purple-200/70">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Tips */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" /> Follow-up Suggestions
              </h3>
              <div className="space-y-3">
                {[
                  'Send a thank-you message within 24 hours',
                  'Reference something specific they mentioned',
                  'Suggest a next meeting if it went well',
                  'Be honest but kind if not interested',
                  'Share your feelings with family for their input'
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
                    <ChevronRight className="h-4 w-4 text-purple-400/60 shrink-0" />
                    <span className="text-sm text-purple-200/60">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" /> Recommended Venues
              </h3>
              <p className="text-xs text-purple-300/40 mb-5">AI-curated venues perfect for a first meeting</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {restaurantSuggestions.map((venue, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">{venue.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" /> {venue.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-purple-300/50">
                      <span className="px-2 py-0.5 bg-purple-500/10 rounded-full">{venue.type}</span>
                      <span>{venue.cuisine}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {venue.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Date Ideas */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-400" /> Virtual Date Ideas
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {['Cook Together Over Video', 'Watch a Movie Simultaneously', 'Play Online Games Together', 'Virtual Temple/Museum Tour', 'Stargazing Video Call', 'Book Discussion Session'].map((idea, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-purple-500/10">
                    <Sparkles className="h-4 w-4 text-purple-400/60 shrink-0" />
                    <span className="text-sm text-purple-200/60">{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" /> Meeting Preparation
              </h3>
              <p className="text-xs text-purple-300/40 mb-5">Complete these before your meeting</p>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-300/50">Progress</span>
                  <span className="text-xs text-purple-200">{checklist.filter(c => c.done).length}/{checklist.length}</span>
                </div>
                <div className="w-full h-2 bg-purple-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                {checklist.map(item => (
                  <button key={item.id} onClick={() => toggleChecklist(item.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      item.done
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-white/[0.02] border-purple-500/10 hover:border-purple-500/20'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.done ? 'border-green-400 bg-green-400' : 'border-purple-500/30'
                    }`}>
                      {item.done && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-green-300/70 line-through' : 'text-purple-200/70'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" /> Relationship Timeline
              </h3>
              <p className="text-xs text-purple-300/40 mb-6">Track your journey together</p>

              {meetings.length === 0 ? (
                <div className="text-center py-10">
                  <Heart className="h-12 w-12 text-purple-400/20 mx-auto mb-3" />
                  <p className="text-sm text-purple-200/40">Your timeline will appear here</p>
                  <p className="text-xs text-purple-300/30 mt-1">Schedule meetings to start building your timeline</p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500/20" />
                  {meetings.map((meeting, i) => (
                    <div key={meeting.id} className="relative mb-6 last:mb-0">
                      <div className="absolute -left-5 w-4 h-4 rounded-full bg-purple-500 border-2 border-dark-900 shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-purple-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white">{meeting.partnerName}</h4>
                          <span className="text-[10px] text-purple-300/40">{meeting.date}</span>
                        </div>
                        <p className="text-xs text-purple-300/50 capitalize">{meeting.type} meeting at {meeting.time}</p>
                        {meeting.notes && <p className="text-xs text-purple-200/40 mt-2 italic">{meeting.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
