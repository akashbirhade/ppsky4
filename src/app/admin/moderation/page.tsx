'use client'

import { useState } from 'react'
import { Eye, Image, MessageCircle, Flag, Check, X, AlertTriangle } from 'lucide-react'

interface FlaggedItem {
  id: string
  type: 'photo' | 'message' | 'profile'
  userId: string
  userName: string
  reason: string
  content: string
  reportedBy: string
  reportedAt: string
  status: 'pending' | 'approved' | 'removed'
}

export default function ModerationPage() {
  const [items, setItems] = useState<FlaggedItem[]>([
    { id: '1', type: 'photo', userId: '5', userName: 'Sneha Reddy', reason: 'Inappropriate content', content: '/uploads/sneha1.jpg', reportedBy: 'Rahul Verma', reportedAt: '2026-06-30T14:00:00Z', status: 'pending' },
    { id: '2', type: 'message', userId: '4', userName: 'Vikram Singh', reason: 'Harassment', content: 'Hey, why are you ignoring me? I know where you work...', reportedBy: 'Ananya Patel', reportedAt: '2026-06-29T10:00:00Z', status: 'pending' },
    { id: '3', type: 'profile', userId: '10', userName: 'Unknown User', reason: 'Fake profile / catfishing', content: 'Bio contains fake job claims and stolen photos', reportedBy: 'Priya Sharma', reportedAt: '2026-06-28T16:00:00Z', status: 'pending' },
    { id: '4', type: 'photo', userId: '8', userName: 'Rohit Patil', reason: 'Group photo as main', content: '/uploads/rohit1.jpg', reportedBy: 'System', reportedAt: '2026-06-27T09:00:00Z', status: 'approved' },
    { id: '5', type: 'message', userId: '12', userName: 'Amit Sharma', reason: 'Spam/Scam', content: 'Invest ₹5000 and earn ₹50000 daily! Click here...', reportedBy: 'Sneha Reddy', reportedAt: '2026-06-26T11:00:00Z', status: 'removed' },
  ])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'removed'>('pending')

  function handleAction(id: string, action: 'approved' | 'removed') {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action } : i))
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)
  const pendingCount = items.filter(i => i.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Eye className="h-6 w-6 text-blue-400" /> Content Moderation
          {pendingCount > 0 && <span className="text-sm bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">{pendingCount} pending</span>}
        </h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'removed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-purple-500/30 text-white border border-purple-500/50' : 'bg-white/5 text-purple-200/60 border border-purple-500/10'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {item.type === 'photo' && <Image className="h-4 w-4 text-blue-400" />}
                  {item.type === 'message' && <MessageCircle className="h-4 w-4 text-green-400" />}
                  {item.type === 'profile' && <Flag className="h-4 w-4 text-red-400" />}
                  <span className="text-sm font-medium text-white capitalize">{item.type}</span>
                  <span className="text-xs text-purple-200/40">•</span>
                  <span className="text-xs text-purple-200/60">{item.userName}</span>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    item.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>{item.status}</span>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-purple-200/40 mb-1"><AlertTriangle className="h-3 w-3 inline mr-1" />Reason: {item.reason}</p>
                  {item.type === 'photo' ? (
                    <div className="w-20 h-20 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Image className="h-8 w-8 text-purple-300/30" />
                    </div>
                  ) : (
                    <p className="text-sm text-purple-200/70 bg-white/5 px-3 py-2 rounded-lg border border-purple-500/10 italic">&quot;{item.content}&quot;</p>
                  )}
                </div>
                <p className="text-[10px] text-purple-200/40">Reported by {item.reportedBy} • {new Date(item.reportedAt).toLocaleDateString()}</p>
              </div>
              {item.status === 'pending' && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleAction(item.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 text-xs transition-all">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => handleAction(item.id, 'removed')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs transition-all">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-purple-200/40">
            <Check className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No items to review</p>
          </div>
        )}
      </div>
    </div>
  )
}
