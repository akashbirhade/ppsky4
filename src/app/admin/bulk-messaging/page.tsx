'use client'

import { useState } from 'react'
import { Mail, Send, Users, Crown, UserX, Phone } from 'lucide-react'

export default function BulkMessagingPage() {
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [audience, setAudience] = useState<'all' | 'premium' | 'inactive' | 'custom'>('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [history] = useState([
    { id: '1', channel: 'email', subject: 'Complete Your Profile!', audience: 'inactive', sentAt: '2026-06-28', recipients: 340, opened: 120, clicked: 45 },
    { id: '2', channel: 'sms', subject: '70% OFF Premium Plans', audience: 'all', sentAt: '2026-06-25', recipients: 1250, opened: 0, clicked: 0 },
    { id: '3', channel: 'email', subject: 'New Matches Available', audience: 'all', sentAt: '2026-06-20', recipients: 1250, opened: 680, clicked: 230 },
    { id: '4', channel: 'email', subject: 'Exclusive Event Invite', audience: 'premium', sentAt: '2026-06-15', recipients: 200, opened: 150, clicked: 95 },
  ])

  function handleSend() {
    if (!message || (channel === 'email' && !subject)) return
    setSending(true)
    setTimeout(() => setSending(false), 2000)
  }

  const audienceOptions = [
    { value: 'all', label: 'All Users', icon: Users, count: '1,250' },
    { value: 'premium', label: 'Premium Users', icon: Crown, count: '200' },
    { value: 'inactive', label: 'Inactive (30d+)', icon: UserX, count: '340' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Mail className="h-6 w-6 text-green-400" /> Bulk Email / SMS
      </h1>

      {/* Compose */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Compose Message</h2>

        {/* Channel */}
        <div className="mb-4">
          <label className="text-sm text-purple-200/60 mb-2 block">Channel</label>
          <div className="flex gap-3">
            <button onClick={() => setChannel('email')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${channel === 'email' ? 'bg-purple-500/30 border-purple-500/50 text-white' : 'bg-white/5 border-purple-500/10 text-purple-200/60'}`}>
              <Mail className="h-4 w-4" /> Email
            </button>
            <button onClick={() => setChannel('sms')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${channel === 'sms' ? 'bg-purple-500/30 border-purple-500/50 text-white' : 'bg-white/5 border-purple-500/10 text-purple-200/60'}`}>
              <Phone className="h-4 w-4" /> SMS
            </button>
          </div>
        </div>

        {/* Audience */}
        <div className="mb-4">
          <label className="text-sm text-purple-200/60 mb-2 block">Target Audience</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {audienceOptions.map(opt => (
              <button key={opt.value} onClick={() => setAudience(opt.value as typeof audience)} className={`flex items-center gap-2 p-3 rounded-xl text-sm border transition-all ${audience === opt.value ? 'bg-purple-500/30 border-purple-500/50 text-white' : 'bg-white/5 border-purple-500/10 text-purple-200/60'}`}>
                <opt.icon className="h-4 w-4" />
                <span>{opt.label}</span>
                <span className="ml-auto text-xs opacity-60">{opt.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject (email only) */}
        {channel === 'email' && (
          <div className="mb-4">
            <label className="text-sm text-purple-200/60 mb-1 block">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
          </div>
        )}

        {/* Message */}
        <div className="mb-4">
          <label className="text-sm text-purple-200/60 mb-1 block">Message {channel === 'sms' && <span className="text-xs">(160 chars max)</span>}</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." rows={channel === 'sms' ? 3 : 6} maxLength={channel === 'sms' ? 160 : undefined} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none resize-none" />
          {channel === 'sms' && <p className="text-[10px] text-purple-200/40 mt-1">{message.length}/160 characters</p>}
        </div>

        <button onClick={handleSend} disabled={sending || !message} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <Send className="h-4 w-4" /> {sending ? 'Sending...' : `Send ${channel === 'email' ? 'Email' : 'SMS'}`}
        </button>
      </div>

      {/* History */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-purple-500/20">
          <h2 className="text-lg font-semibold text-white">Campaign History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-purple-200/60 font-medium">Channel</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Subject</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Audience</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Recipients</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Opened</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Clicked</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b border-purple-500/10 hover:bg-white/5">
                  <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${h.channel === 'email' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{h.channel.toUpperCase()}</span></td>
                  <td className="p-4 text-white">{h.subject}</td>
                  <td className="p-4 text-purple-200/60 capitalize">{h.audience}</td>
                  <td className="p-4 text-purple-200/60">{h.recipients}</td>
                  <td className="p-4 text-purple-200/60">{h.channel === 'email' ? h.opened : '—'}</td>
                  <td className="p-4 text-purple-200/60">{h.channel === 'email' ? h.clicked : '—'}</td>
                  <td className="p-4 text-purple-200/60">{h.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
