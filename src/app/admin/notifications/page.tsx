'use client'

import { useState } from 'react'
import { Bell, Send, Users, User } from 'lucide-react'

export default function PushNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<'all' | 'premium' | 'specific'>('all')
  const [specificEmail, setSpecificEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<Array<{ id: string; title: string; body: string; target: string; sentAt: string; count: number }>>([
    { id: '1', title: 'New Feature: Video Calls', body: 'Try our new video calling feature!', target: 'all', sentAt: '2026-06-28T10:00:00Z', count: 1250 },
    { id: '2', title: '70% OFF Premium', body: 'Limited time offer on Gold & Platinum plans', target: 'all', sentAt: '2026-06-25T14:00:00Z', count: 1250 },
    { id: '3', title: 'Profile Incomplete', body: 'Complete your profile to get better matches', target: 'specific', sentAt: '2026-06-20T09:00:00Z', count: 340 },
  ])

  async function handleSend() {
    if (!title || !body) return
    setSending(true)
    try {
      const token = localStorage.getItem('soulmateSync_token')
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, target, specificEmail })
      })
      setHistory(prev => [{ id: Date.now().toString(), title, body, target, sentAt: new Date().toISOString(), count: target === 'all' ? 1250 : target === 'premium' ? 200 : 1 }, ...prev])
      setTitle('')
      setBody('')
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Bell className="h-6 w-6 text-purple-400" /> Push Notifications
      </h1>

      {/* Send Notification */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Send Notification</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-purple-200/60 mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 focus:border-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="text-sm text-purple-200/60 mb-1 block">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Notification message..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 focus:border-purple-500/50 outline-none resize-none" />
          </div>
          <div>
            <label className="text-sm text-purple-200/60 mb-1 block">Target Audience</label>
            <div className="flex gap-3 flex-wrap">
              {[{ value: 'all', label: 'All Users', icon: Users }, { value: 'premium', label: 'Premium Only', icon: User }, { value: 'specific', label: 'Specific User', icon: User }].map(opt => (
                <button key={opt.value} onClick={() => setTarget(opt.value as typeof target)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${target === opt.value ? 'bg-purple-500/30 border-purple-500/50 text-white' : 'bg-white/5 border-purple-500/10 text-purple-200/60'} border`}>
                  <opt.icon className="h-4 w-4" /> {opt.label}
                </button>
              ))}
            </div>
          </div>
          {target === 'specific' && (
            <input value={specificEmail} onChange={e => setSpecificEmail(e.target.value)} placeholder="User email..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 focus:border-purple-500/50 outline-none" />
          )}
          <button onClick={handleSend} disabled={sending || !title || !body} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notification History</h2>
        <div className="space-y-3">
          {history.map(n => (
            <div key={n.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-purple-500/10">
              <div>
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-purple-200/50">{n.body}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-200/60">{n.count} recipients</p>
                <p className="text-[10px] text-purple-200/40">{new Date(n.sentAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
