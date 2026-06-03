'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, MessageCircle, Heart, Plus, Search, Globe, MapPin, BookOpen, Star, Crown, ArrowRight, CheckCircle } from 'lucide-react'

interface CommunityGroup {
  id: string
  name: string
  description: string
  members: number
  category: string
  icon: string
  isJoined: boolean
  recentPosts: number
  verified: boolean
}

const GROUPS: CommunityGroup[] = [
  { id: '1', name: 'Maharashtra Matrimony Connect', description: 'For Maharashtrian families looking for matches within the community', members: 12500, category: 'region', icon: '🏔️', isJoined: true, recentPosts: 24, verified: true },
  { id: '2', name: 'Gujarati Patel Community', description: 'Connecting Patel families across India and abroad for matrimonial matches', members: 8900, category: 'community', icon: '🪷', isJoined: false, recentPosts: 18, verified: true },
  { id: '3', name: 'NRI Soulmate Network', description: 'For Indians abroad and those looking for NRI matches', members: 15200, category: 'nri', icon: '✈️', isJoined: true, recentPosts: 32, verified: true },
  { id: '4', name: 'IT Professionals Match', description: 'Software engineers, data scientists & tech professionals finding life partners', members: 22000, category: 'profession', icon: '💻', isJoined: false, recentPosts: 45, verified: true },
  { id: '5', name: 'Brahmin Vivah Mandal', description: 'Exclusive for Brahmin community families seeking suitable matches', members: 6700, category: 'community', icon: '🙏', isJoined: false, recentPosts: 12, verified: true },
  { id: '6', name: 'Doctors & Medical Professionals', description: 'MBBS, MD, dental and medical professionals seeking partners', members: 9800, category: 'profession', icon: '⚕️', isJoined: false, recentPosts: 21, verified: false },
  { id: '7', name: 'Delhi NCR Singles', description: 'Local community for singles in Delhi, Noida, and Gurgaon area', members: 18500, category: 'region', icon: '🏙️', isJoined: false, recentPosts: 56, verified: true },
  { id: '8', name: 'Second Marriage Support', description: 'A supportive space for divorcees and widows/widowers seeking partners', members: 4200, category: 'support', icon: '🤝', isJoined: false, recentPosts: 8, verified: true },
  { id: '9', name: 'Interfaith & Progressive', description: 'For those open to inter-caste and inter-faith marriages', members: 7300, category: 'lifestyle', icon: '🌈', isJoined: false, recentPosts: 15, verified: false },
  { id: '10', name: 'Parents Connect Forum', description: 'A community for parents helping their children find the right match', members: 11000, category: 'parents', icon: '👨‍👩‍👧', isJoined: true, recentPosts: 28, verified: true },
  { id: '11', name: 'Sikh Matrimony Circle', description: 'For Sikh families looking for compatible matches within the community', members: 5600, category: 'community', icon: '🪯', isJoined: false, recentPosts: 10, verified: true },
  { id: '12', name: 'MBA & Business Professionals', description: 'Business leaders, entrepreneurs & MBA graduates seeking partners', members: 13400, category: 'profession', icon: '📊', isJoined: false, recentPosts: 33, verified: false },
]

const CATEGORIES = [
  { id: 'all', label: 'All Groups' },
  { id: 'community', label: 'Community' },
  { id: 'region', label: 'Regional' },
  { id: 'profession', label: 'Professional' },
  { id: 'nri', label: 'NRI' },
  { id: 'parents', label: 'Parents' },
  { id: 'support', label: 'Support' },
  { id: 'lifestyle', label: 'Lifestyle' },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [groups, setGroups] = useState(GROUPS)

  const filtered = groups.filter(g => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const joinedGroups = groups.filter(g => g.isJoined)

  const toggleJoin = (id: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 } : g))
  }

  const formatMembers = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-blue-300">Connect with Like-minded People</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Community Groups</h1>
          <p className="text-slate-500 dark:text-purple-200/50 max-w-lg mx-auto">Join communities based on religion, region, profession, or interests to find matches faster</p>
        </div>

        {/* My Groups Summary */}
        {joinedGroups.length > 0 && (
          <div className="glass-card p-5 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" /> Your Groups ({joinedGroups.length})
              </h3>
              <span className="text-xs text-slate-300 dark:text-purple-300/40">Active discussions</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {joinedGroups.map(g => (
                <div key={g.id} className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2 border border-teal-100 dark:border-purple-500/10 whitespace-nowrap flex-shrink-0">
                  <span className="text-lg">{g.icon}</span>
                  <div>
                    <p className="text-xs text-slate-800 dark:text-white font-medium">{g.name.length > 20 ? g.name.slice(0, 20) + '...' : g.name}</p>
                    <p className="text-[10px] text-slate-300 dark:text-purple-300/40">{g.recentPosts} new posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="flex-1 glass-card !p-3 flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-300 dark:text-purple-300/40" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search communities..." className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm placeholder-purple-300/30 focus:outline-none" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border-purple-500/40'
                  : 'bg-white/[0.02] text-slate-500 dark:text-purple-200/60 border-teal-100 dark:border-purple-500/10 hover:bg-white/[0.05]'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group, i) => (
            <div key={group.id} className="glass-card group hover:border-teal-200/50 dark:border-purple-400/30 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 flex items-center justify-center text-xl border border-purple-400/10 flex-shrink-0">
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{group.name}</h3>
                    {group.verified && <CheckCircle className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-200/40 mt-0.5">
                    <Users className="h-3 w-3" /> {formatMembers(group.members)} members
                    <span className="w-1 h-1 rounded-full bg-purple-400/20" />
                    <MessageCircle className="h-3 w-3" /> {group.recentPosts} posts
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-purple-200/50 mb-4 line-clamp-2">{group.description}</p>

              <button
                onClick={() => toggleJoin(group.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  group.isJoined
                    ? 'bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20'
                    : 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30 hover:bg-purple-600/50'
                }`}
              >
                {group.isJoined ? <><CheckCircle className="h-3.5 w-3.5" /> Joined</> : <><Plus className="h-3.5 w-3.5" /> Join Group</>}
              </button>
            </div>
          ))}
        </div>

        {/* Create Group CTA */}
        <div className="mt-10 glass-card p-8 text-center border-blue-500/20 animate-fade-in-up">
          <Users className="h-10 w-10 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Can&apos;t find your community?</h3>
          <p className="text-sm text-slate-500 dark:text-purple-200/50 mb-5">Create a group for your community, profession, or region and invite members</p>
          <button className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" /> Create Community Group
          </button>
        </div>
      </div>
    </div>
  )
}
