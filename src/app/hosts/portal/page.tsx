'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, UserCheck, Calendar, MapPin, LogOut, Heart, Eye, Plus, User } from 'lucide-react'

interface HostUser {
  id: string
  name: string
  email: string
  region: string
  district: string
  city: string
  community: string | null
  members: string[]
  events: any[]
}

interface Member {
  id: string
  name: string
  gender: string
  age: number
  city: string
  education: string
  occupation: string
  religion: string
  caste: string
  photo: string
}

export default function HostPortalPage() {
  const router = useRouter()
  const [host, setHost] = useState<HostUser | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'brides' | 'grooms' | 'events'>('overview')

  useEffect(() => {
    const stored = localStorage.getItem('hostUser')
    if (!stored) {
      router.push('/hosts/login')
      return
    }
    const hostData = JSON.parse(stored)
    setHost(hostData)

    // Fetch members
    fetch(`/api/hosts/${hostData.id}/members`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMembers(data.data.members)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('hostUser')
    router.push('/hosts/login')
  }

  if (!host || loading) {
    return (
      <div className="min-h-screen pt-[104px] pb-8 px-4 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 dark:text-purple-300/60">Loading portal...</div>
      </div>
    )
  }

  const brides = members.filter(m => m.gender === 'Female')
  const grooms = members.filter(m => m.gender === 'Male')

  return (
    <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Host Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
              {host.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{host.name}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-purple-300/60">
                <MapPin size={14} className="text-teal-500" />
                <span>{host.city}, {host.district}, {host.region}</span>
                {host.community && <span className="text-teal-600 dark:text-teal-400">• {host.community}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users size={20} />} label="Total Members" value={members.length} color="teal" />
          <StatCard icon={<Heart size={20} />} label="Brides" value={brides.length} color="pink" />
          <StatCard icon={<UserCheck size={20} />} label="Grooms" value={grooms.length} color="blue" />
          <StatCard icon={<Calendar size={20} />} label="Events" value={(host.events || []).length} color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto">
          {(['overview', 'brides', 'grooms', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-purple-300/50 hover:text-slate-700 dark:hover:text-purple-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Members */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-teal-500" />
                Recent Members
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {members.slice(0, 8).map(member => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                Upcoming Events
              </h3>
              {(host.events || []).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-purple-300/60 text-center py-6">No events scheduled</p>
              ) : (
                <div className="space-y-3">
                  {host.events.map((event: any) => (
                    <div key={event.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <p className="font-medium text-sm text-slate-700 dark:text-white">{event.title}</p>
                      <p className="text-xs text-slate-500 dark:text-purple-300/50 mt-1">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-purple-300/50">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.venue}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-teal-600 dark:text-teal-400">₹{event.fee}</span>
                        <span className="text-slate-500 dark:text-purple-300/50">{event.participantCount}/{event.maxParticipants} joined</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'brides' && (
          <MemberGrid members={brides} title="Bride Members" />
        )}

        {activeTab === 'grooms' && (
          <MemberGrid members={grooms} title="Groom Members" />
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {(host.events || []).length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                <Calendar size={48} className="mx-auto text-slate-300 dark:text-purple-400/30 mb-4" />
                <p className="text-slate-500 dark:text-purple-300/60 text-lg">No events yet</p>
              </div>
            ) : (
              host.events.map((event: any) => (
                <div key={event.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-purple-300/60 mt-1">{event.description}</p>
                    </div>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-3 py-1 rounded-lg">
                      ₹{event.fee}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600 dark:text-purple-200/70">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.venue}</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {event.participantCount}/{event.maxParticipants} participants</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-purple-300/50 mt-1">
                      {Math.round((event.participantCount / event.maxParticipants) * 100)}% filled
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300',
    pink: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300',
  }
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-purple-300/60">{label}</p>
    </div>
  )
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${member.gender === 'Female' ? 'bg-pink-100 dark:bg-pink-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
          <User size={16} className={member.gender === 'Female' ? 'text-pink-600 dark:text-pink-300' : 'text-blue-600 dark:text-blue-300'} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-white">{member.name}</p>
          <p className="text-xs text-slate-500 dark:text-purple-300/50">{member.age}y • {member.occupation} • {member.city}</p>
        </div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${member.gender === 'Female' ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300'}`}>
        {member.gender === 'Female' ? 'Bride' : 'Groom'}
      </span>
    </div>
  )
}

function MemberGrid({ members, title }: { members: Member[]; title: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-purple-300/60 mb-4">{members.length} {title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.gender === 'Female' ? 'bg-pink-100 dark:bg-pink-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                <User size={20} className={member.gender === 'Female' ? 'text-pink-600 dark:text-pink-300' : 'text-blue-600 dark:text-blue-300'} />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-purple-300/50">{member.age} years</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-purple-200/70">
              <p><span className="text-slate-400 dark:text-purple-300/40">Education:</span> {member.education}</p>
              <p><span className="text-slate-400 dark:text-purple-300/40">Occupation:</span> {member.occupation}</p>
              <p><span className="text-slate-400 dark:text-purple-300/40">City:</span> {member.city}</p>
              <p><span className="text-slate-400 dark:text-purple-300/40">Community:</span> {member.caste}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
