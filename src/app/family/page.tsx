'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Plus, Crown, Shield, User, Edit3, Eye, ArrowRight, Sparkles, Settings, Trash2, CheckCircle, Star } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface FamilyMember {
  id: string
  name: string
  relation: string
  role: 'admin' | 'manager' | 'viewer'
  email: string
  addedDate: string
  avatar: string
}

interface ManagedProfile {
  id: string
  name: string
  age: number
  gender: string
  status: 'active' | 'paused' | 'matched'
  interests: number
  views: number
  lastActive: string
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'You (Account Owner)', relation: 'Self', role: 'admin', email: '', addedDate: '2024-01-15', avatar: '👤' },
  { id: '2', name: 'Mrs. Sharma', relation: 'Mother', role: 'manager', email: 'mother@example.com', addedDate: '2024-02-10', avatar: '👩' },
  { id: '3', name: 'Mr. Sharma', relation: 'Father', role: 'viewer', email: 'father@example.com', addedDate: '2024-02-10', avatar: '👨' },
]

const MANAGED_PROFILES: ManagedProfile[] = [
  { id: 'p1', name: 'Rahul Sharma', age: 29, gender: 'Male', status: 'active', interests: 12, views: 45, lastActive: '2 hrs ago' },
]

export default function FamilyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState(FAMILY_MEMBERS)
  const [profiles, setProfiles] = useState(MANAGED_PROFILES)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', relation: '', role: 'viewer' as const })

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const addMember = () => {
    if (!newMember.name || !newMember.email) return
    setMembers(prev => [...prev, {
      id: Date.now().toString(),
      name: newMember.name,
      relation: newMember.relation,
      role: newMember.role,
      email: newMember.email,
      addedDate: new Date().toISOString().split('T')[0],
      avatar: '👤'
    }])
    setShowAddMember(false)
    setNewMember({ name: '', email: '', relation: '', role: 'viewer' })
  }

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" /> Family Account
            </h1>
            <p className="text-purple-200/50 mt-2">Manage profiles together with your family members</p>
          </div>
          <button onClick={() => setShowAddMember(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Family Member
          </button>
        </div>

        {/* Info Banner */}
        <div className="glass-card p-5 mb-8 border-purple-500/20 animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Family Safety</h3>
              <p className="text-xs text-purple-200/50">Family members can help manage profiles and review matches. Each member has permission-based access. Only admins can chat or accept interests.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Family Members */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" /> Family Members ({members.length})
            </h2>
            <div className="space-y-3">
              {members.map((member, i) => (
                <div key={member.id} className="glass-card !p-4 animate-fade-in-up flex items-center gap-4"
                  style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center text-xl border border-purple-400/20">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{member.name}</h3>
                      {member.role === 'admin' && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-xs text-purple-200/50">{member.relation} • {member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      member.role === 'admin' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                      member.role === 'manager' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                      'bg-white/5 text-purple-300/60 border-purple-500/10'
                    }`}>
                      {member.role === 'admin' ? 'Full Access' : member.role === 'manager' ? 'Can Manage' : 'View Only'}
                    </span>
                    {member.id !== '1' && (
                      <button onClick={() => removeMember(member.id)} className="p-1.5 text-red-300/40 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Managed Profiles */}
            <h2 className="text-lg font-semibold text-white mt-8 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-400" /> Managed Profiles
            </h2>
            {profiles.map((p, i) => (
              <div key={p.id} className="glass-card !p-5 animate-fade-in-up" style={{ animationDelay: `${(i + 3) * 0.05}s`, opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center border border-purple-400/20">
                      <span className="text-lg font-bold text-purple-200/60">{p.name[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-purple-200/50">{p.age} years • {p.gender} • Last active {p.lastActive}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    p.status === 'active' ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                    p.status === 'matched' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' :
                    'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                  }`}>
                    {p.status === 'active' ? '● Active' : p.status === 'matched' ? '💕 Matched' : '⏸ Paused'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-purple-500/5">
                    <p className="text-lg font-bold text-white">{p.interests}</p>
                    <p className="text-[10px] text-purple-300/40">Interests</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-purple-500/5">
                    <p className="text-lg font-bold text-white">{p.views}</p>
                    <p className="text-[10px] text-purple-300/40">Views</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-purple-500/5">
                    <p className="text-lg font-bold text-white">86%</p>
                    <p className="text-[10px] text-purple-300/40">Profile Score</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard" className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 flex-1 justify-center">
                    <Eye className="h-3.5 w-3.5" /> View Dashboard
                  </Link>
                  <Link href="/search" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-1 justify-center">
                    <HalfHeart className="h-3.5 w-3.5" /> Browse Matches
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Permissions Guide */}
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" /> Role Permissions
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">Admin</span>
                  </div>
                  <p className="text-[10px] text-purple-200/40">Full control: chat, accept interests, manage profile, payments</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-300">Manager</span>
                  </div>
                  <p className="text-[10px] text-purple-200/40">Edit profile, shortlist matches, view interests, send interests</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-3.5 w-3.5 text-purple-300/60" />
                    <span className="text-xs font-semibold text-purple-200/70">Viewer</span>
                  </div>
                  <p className="text-[10px] text-purple-200/40">View matches and profiles only, no actions</p>
                </div>
              </div>
            </div>

            {/* Premium Upsell */}
            <div className="glass-card border-amber-500/20 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Family Premium</h3>
              </div>
              <p className="text-xs text-purple-200/50 mb-4">Upgrade to Family Premium for unlimited members, priority matching, and dedicated relationship advisor.</p>
              <Link href="/premium" className="btn-gold text-xs py-2 px-4 w-full text-center block">
                Upgrade Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="glass-card max-w-md w-full p-6 animate-scale-in">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-400" /> Add Family Member
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">Name *</label>
                  <input type="text" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">Email *</label>
                  <input type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">Relation</label>
                  <select value={newMember.relation} onChange={e => setNewMember(p => ({ ...p, relation: e.target.value }))} className="input-field w-full">
                    <option value="">Select relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-purple-200 mb-2 block">Permission Level</label>
                  <select value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value as any }))} className="input-field w-full">
                    <option value="viewer">Viewer - Can only view</option>
                    <option value="manager">Manager - Can manage profile</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddMember(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={addMember} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Add Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
