'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { MapPin, Users, Calendar, Mail, Phone, ArrowLeft, User, Heart, GraduationCap, Briefcase, BadgeCheck } from 'lucide-react'

interface HostEvent {
  id: string
  title: string
  description: string | null
  date: string
  venue: string
  fee: number | null
  maxParticipants: number | null
  participantCount: number
}

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
  events: HostEvent[]
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
  hostId: string
}

export default function HostProfilePage() {
  const { user, authFetch } = useAuth()
  const { id } = useParams()
  const [host, setHost] = useState<Host | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'events' | 'members'>('details')

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const res = await authFetch(`/api/hosts/${id}`)
        const json = await res.json()
        if (json.success) setHost(json.data)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    const fetchMembers = async () => {
      try {
        const res = await authFetch(`/api/hosts/${id}/members`)
        const json = await res.json()
        if (json.success) setMembers(json.data.members)
      } catch (err) { console.error(err) }
    }
    fetchHost()
    fetchMembers()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-48 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse mb-6" />
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8 flex items-center justify-center">
        <p className="text-slate-500 dark:text-purple-300/60 text-lg">Host not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[104px] pb-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/hosts" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-6">
          <ArrowLeft size={16} />
          <span>Back to Hosts</span>
        </Link>

        {/* Host Header */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden flex-shrink-0">
              {host.profilePhoto ? (
                <img src={host.profilePhoto} alt={host.name} className="w-full h-full object-cover" />
              ) : (
                host.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{host.name}</h1>
              {host.community && (
                <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">{host.community}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600 dark:text-purple-200/70">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-500" />
                  {host.city}, {host.district}, {host.region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-green-500" />
                  {host.mobile}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-500" />
                  {host.email}
                </span>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{host._count.members}</p>
                  <p className="text-xs text-slate-500 dark:text-purple-300/60">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{host._count.events}</p>
                  <p className="text-xs text-slate-500 dark:text-purple-300/60">Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
          {(['details', 'events', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-slate-500 dark:text-purple-300/50 hover:text-slate-700 dark:hover:text-purple-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Host Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Name" value={host.name} />
              <InfoRow label="Region" value={host.region} />
              <InfoRow label="District" value={host.district} />
              <InfoRow label="City" value={host.city} />
              <InfoRow label="Community" value={host.community || 'All Communities'} />
              <InfoRow label="Contact" value={host.mobile} />
              <InfoRow label="Email" value={host.email} />
              <InfoRow label="Status" value={host.status} />
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {host.events.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                <Calendar size={40} className="mx-auto text-slate-300 dark:text-purple-400/30 mb-3" />
                <p className="text-slate-500 dark:text-purple-300/60">No upcoming events</p>
              </div>
            ) : (
              host.events.map((event) => (
                <div key={event.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-slate-500 dark:text-purple-300/60 mt-1">{event.description}</p>
                      )}
                    </div>
                    {event.fee && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg">
                        ₹{event.fee}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600 dark:text-purple-200/70">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.venue}
                    </span>
                    {event.maxParticipants && (
                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {event.participantCount}/{event.maxParticipants}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {/* Show opposite gender: if user is Female show Males, vice versa */}
            {(() => {
              const userGender = user?.gender?.toLowerCase()
              const filteredMembers = userGender
                ? members.filter(m => m.gender.toLowerCase() !== userGender)
                : members
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {userGender === 'female' ? 'Groom' : userGender === 'male' ? 'Bride' : ''} Profiles ({filteredMembers.length})
                    </h2>
                  </div>
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                      <User size={40} className="mx-auto text-slate-300 dark:text-purple-400/30 mb-3" />
                      <p className="text-slate-500 dark:text-purple-300/60">No profiles to show</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3 p-4">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                              <img
                                src={member.gender === 'Female' ? '/avatars/female.svg' : '/avatars/male.svg'}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                              <span className={`absolute bottom-0 left-0 right-0 text-[8px] text-center font-semibold py-0.5 ${member.gender === 'Female' ? 'bg-pink-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
                                {member.gender === 'Female' ? 'Bride' : 'Groom'}
                              </span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{member.name}</h3>
                                <span className="text-xs text-slate-500 dark:text-purple-300/60 flex-shrink-0 ml-2">{member.age} yrs</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-600 dark:text-purple-200/70">
                                <span className="flex items-center gap-1">
                                  <MapPin size={10} className="text-teal-500" /> {member.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GraduationCap size={10} className="text-purple-500" /> {member.education}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase size={10} className="text-blue-500" /> {member.occupation}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-purple-300/50 mt-0.5 flex items-center gap-1">
                                <Heart size={10} className="text-pink-500" /> {member.religion} • {member.caste}
                              </p>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-2 px-4 pb-3">
                            <Link
                              href={`/profile/${member.id}`}
                              className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition"
                            >
                              View Profile
                            </Link>
                            <button className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition">
                              Send Interest
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-purple-300/50 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-white mt-0.5">{value}</p>
    </div>
  )
}
