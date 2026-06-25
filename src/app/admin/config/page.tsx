'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Bell, ToggleLeft, ToggleRight, Plus, X, Megaphone } from 'lucide-react'

interface SystemConfig {
  maxPhotos: number
  maxMessageLength: number
  dailyInterestLimit: number
  premiumDailyInterestLimit: number
  enableAIChatbot: boolean
  enableVideoCalls: boolean
  enableKundali: boolean
  maintenanceMode: boolean
  registrationOpen: boolean
  minAge: number
  maxAge: number
}

interface Announcement {
  id: string
  title: string
  message: string
  createdAt: string
  active: boolean
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch('/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        setAnnouncements(data.announcements || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  async function saveConfig() {
    if (!config) return
    setSaving(true)
    try {
      const token = localStorage.getItem('soulmateSync_token')
      await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally {
      setSaving(false)
    }
  }

  async function createAnnouncement() {
    if (!newTitle || !newMessage) return
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'create_announcement', title: newTitle, message: newMessage }),
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(prev => [data.announcement, ...prev])
        setNewTitle('')
        setNewMessage('')
        setShowNewAnnouncement(false)
      }
    } catch {}
  }

  async function toggleAnnouncement(id: string) {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'toggle_announcement', announcementId: id }),
      })
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!config) return null

  const toggles = [
    { key: 'enableAIChatbot' as const, label: 'AI Chatbot', desc: 'Enable AI-powered relationship assistant' },
    { key: 'enableVideoCalls' as const, label: 'Video Calls', desc: 'Allow users to make video calls' },
    { key: 'enableKundali' as const, label: 'Kundali Matching', desc: 'Enable horoscope-based matching' },
    { key: 'registrationOpen' as const, label: 'Registration Open', desc: 'Allow new user signups' },
    { key: 'maintenanceMode' as const, label: 'Maintenance Mode', desc: 'Show maintenance page to all users' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-400" /> System Configuration
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">Manage platform settings and feature flags</p>
        </div>
        <button onClick={saveConfig} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}>
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Feature Flags</h3>
        <div className="space-y-4">
          {toggles.map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between py-3 border-b border-purple-500/5 last:border-0">
              <div>
                <p className="text-sm text-white font-medium">{toggle.label}</p>
                <p className="text-xs text-purple-300/40">{toggle.desc}</p>
              </div>
              <button onClick={() => setConfig(prev => prev ? { ...prev, [toggle.key]: !prev[toggle.key] } : prev)}
                className="text-purple-400 hover:text-purple-300 transition-colors">
                {config[toggle.key] ? (
                  <ToggleRight className="h-8 w-8 text-green-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-purple-500/40" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Numeric Settings */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Limits & Constraints</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'maxPhotos' as const, label: 'Max Photos per Profile', min: 1, max: 20 },
            { key: 'maxMessageLength' as const, label: 'Max Message Length', min: 100, max: 5000 },
            { key: 'dailyInterestLimit' as const, label: 'Daily Interest Limit (Free)', min: 1, max: 50 },
            { key: 'premiumDailyInterestLimit' as const, label: 'Daily Interest Limit (Premium)', min: 10, max: 200 },
            { key: 'minAge' as const, label: 'Minimum Age', min: 18, max: 25 },
            { key: 'maxAge' as const, label: 'Maximum Age', min: 50, max: 100 },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-purple-200/60 mb-1.5 block">{field.label}</label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={config[field.key]}
                onChange={e => setConfig(prev => prev ? { ...prev, [field.key]: parseInt(e.target.value) || 0 } : prev)}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/30"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-purple-400" /> Announcements
          </h3>
          <button onClick={() => setShowNewAnnouncement(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20 hover:bg-purple-500/20 transition-all">
            <Plus className="h-3 w-3" /> New
          </button>
        </div>

        {showNewAnnouncement && (
          <div className="mb-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <input
              placeholder="Announcement title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-purple-500/10 rounded-lg text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30 mb-2"
            />
            <textarea
              placeholder="Message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-purple-500/10 rounded-lg text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30 mb-3 h-16 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={createAnnouncement}
                className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-all">
                Publish
              </button>
              <button onClick={() => setShowNewAnnouncement(false)}
                className="px-4 py-2 border border-purple-500/20 text-purple-300 text-xs rounded-lg hover:bg-purple-500/10 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-xs text-purple-300/40 text-center py-4">No announcements yet</p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                ann.active ? 'border-green-500/20 bg-green-500/5' : 'border-purple-500/5 bg-white/[0.01] opacity-50'
              }`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{ann.title}</p>
                  <p className="text-xs text-purple-300/50 truncate">{ann.message}</p>
                  <p className="text-[10px] text-purple-300/30 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => toggleAnnouncement(ann.id)}
                  className="shrink-0">
                  {ann.active ? (
                    <ToggleRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-purple-500/40" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
