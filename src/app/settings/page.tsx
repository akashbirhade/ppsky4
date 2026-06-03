'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Lock, UserX, Bell, BadgeCheck, Crown, AlertTriangle, CheckCircle, Globe, Smartphone, Mail, MessageCircle, Phone, Camera, Clock, Fingerprint, Key, Monitor } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface PrivacySettings {
  hideProfile: boolean
  hidePhotos: boolean
  hideIncome: boolean
  hidePhone: boolean
  hideEmail: boolean
  hideLastSeen: boolean
  hideOnlineStatus: boolean
  blurPhotos: boolean
  anonymousBrowsing: boolean
  showOnlyVerified: boolean
  whoCanContact: 'everyone' | 'premium' | 'none'
  photoPrivacy: 'everyone' | 'matches' | 'accepted'
}

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  matchAlerts: boolean
  interestAlerts: boolean
  chatNotifications: boolean
  meetingReminders: boolean
  profileViews: boolean
  weeklyDigest: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, languages } = useLanguage()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'privacy' | 'notifications' | 'security' | 'account'>('privacy')
  const [settings, setSettings] = useState<PrivacySettings>({
    hideProfile: false, hidePhotos: false, hideIncome: false, hidePhone: true,
    hideEmail: true, hideLastSeen: false, hideOnlineStatus: false,
    blurPhotos: false, anonymousBrowsing: false, showOnlyVerified: false,
    whoCanContact: 'everyone', photoPrivacy: 'everyone'
  })
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushEnabled: true, emailEnabled: true, smsEnabled: false, whatsappEnabled: true,
    matchAlerts: true, interestAlerts: true, chatNotifications: true,
    meetingReminders: true, profileViews: true, weeklyDigest: false
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [devices, setDevices] = useState([
    { id: '1', name: 'iPhone 15 Pro', lastActive: '2 mins ago', current: true },
    { id: '2', name: 'MacBook Air', lastActive: '1 hour ago', current: false },
  ])

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchSettings()
    fetchBlocked()
  }, [user, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/privacy?userId=${user!.id}`)
      const data = await res.json()
      if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }))
    } catch {}
  }

  const fetchBlocked = async () => {
    try {
      const res = await fetch(`/api/safety?userId=${user!.id}`)
      const data = await res.json()
      if (data.blockedUsers) setBlockedUsers(data.blockedUsers)
    } catch {}
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch('/api/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, ...settings })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const toggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleNotif = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!user) return null

  const sections = [
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'account' as const, label: 'Account', icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-teal-600 dark:text-purple-400" /> Settings
          </h1>
          <p className="text-slate-500 dark:text-purple-200/50 mt-2">Manage your privacy, notifications, and account security</p>
        </div>

        {saved && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm text-green-300">Settings saved successfully!</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] p-1.5 rounded-2xl border border-teal-100 dark:border-purple-500/10 overflow-x-auto">
          {sections.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border border-teal-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:text-purple-200 hover:bg-white/5'
              }`}>
              <sec.icon className="h-4 w-4" /> {sec.label}
            </button>
          ))}
        </div>

        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Profile Visibility */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Eye className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Profile Visibility
              </h2>
              <div className="space-y-3">
                <ToggleItem icon={EyeOff} label="Hide My Profile" description="Won't appear in search results" enabled={settings.hideProfile} onToggle={() => toggle('hideProfile')} />
                <ToggleItem icon={Camera} label="Hide Photos" description="Show photos only after accepting interest" enabled={settings.hidePhotos} onToggle={() => toggle('hidePhotos')} />
                <ToggleItem icon={Eye} label="Blur Photos" description="Photos appear blurred until you approve" enabled={settings.blurPhotos} onToggle={() => toggle('blurPhotos')} />
                <ToggleItem icon={Lock} label="Hide Income" description="Don't display salary information" enabled={settings.hideIncome} onToggle={() => toggle('hideIncome')} />
                <ToggleItem icon={Phone} label="Hide Phone Number" description="Keep phone number private" enabled={settings.hidePhone} onToggle={() => toggle('hidePhone')} />
                <ToggleItem icon={Mail} label="Hide Email" description="Don't show email address" enabled={settings.hideEmail} onToggle={() => toggle('hideEmail')} />
                <ToggleItem icon={Clock} label="Hide Last Seen" description="Others can't see when you were last active" enabled={settings.hideLastSeen} onToggle={() => toggle('hideLastSeen')} />
                <ToggleItem icon={Eye} label="Hide Online Status" description="Appear offline to other users" enabled={settings.hideOnlineStatus} onToggle={() => toggle('hideOnlineStatus')} />
                <ToggleItem icon={EyeOff} label="Anonymous Browsing" description="Browse profiles without showing up in 'Who Viewed'" enabled={settings.anonymousBrowsing} onToggle={() => toggle('anonymousBrowsing')} />
              </div>
            </div>

            {/* Photo Privacy */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Camera className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Photo Privacy
              </h2>
              <p className="text-sm text-slate-500 dark:text-purple-200/60 mb-3">Who can see your photos?</p>
              {(['everyone', 'matches', 'accepted'] as const).map(opt => (
                <button key={opt} onClick={() => setSettings(prev => ({ ...prev, photoPrivacy: opt }))}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 mb-2 ${
                    settings.photoPrivacy === opt ? 'border-purple-500/50 bg-teal-50 dark:bg-purple-500/10' : 'border-teal-100 dark:border-purple-500/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.photoPrivacy === opt ? 'border-purple-400' : 'border-teal-200 dark:border-purple-500/30'}`}>
                    {settings.photoPrivacy === opt && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                  </div>
                  <div>
                    <span className="text-sm text-slate-800 dark:text-white font-medium capitalize">{opt === 'everyone' ? 'Everyone' : opt === 'matches' ? 'Mutual Matches Only' : 'Accepted Interests Only'}</span>
                    <p className="text-xs text-slate-300 dark:text-purple-300/40">
                      {opt === 'everyone' && 'All members can view your photos'}
                      {opt === 'matches' && 'Only people you both liked can see photos'}
                      {opt === 'accepted' && 'Only people whose interest you accepted'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Communication Controls */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <MessageCircle className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Communication Controls
              </h2>
              <p className="text-sm text-slate-500 dark:text-purple-200/60 mb-3">Who can send you interests and messages?</p>
              {(['everyone', 'premium', 'none'] as const).map(opt => (
                <button key={opt} onClick={() => setSettings(prev => ({ ...prev, whoCanContact: opt }))}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 mb-2 ${
                    settings.whoCanContact === opt ? 'border-purple-500/50 bg-teal-50 dark:bg-purple-500/10' : 'border-teal-100 dark:border-purple-500/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.whoCanContact === opt ? 'border-purple-400' : 'border-teal-200 dark:border-purple-500/30'}`}>
                    {settings.whoCanContact === opt && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                  </div>
                  <div>
                    <span className="text-sm text-slate-800 dark:text-white font-medium flex items-center gap-2">
                      {opt === 'everyone' && 'Everyone'}
                      {opt === 'premium' && <><Crown className="h-3.5 w-3.5 text-amber-400" /> Premium Members Only</>}
                      {opt === 'none' && 'Nobody (Pause Communications)'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Match Preferences */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <BadgeCheck className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Match Preferences
              </h2>
              <ToggleItem icon={BadgeCheck} label="Show Only Verified Profiles" description="Filter out unverified profiles from matches" enabled={settings.showOnlyVerified} onToggle={() => toggle('showOnlyVerified')} />
            </div>

            {/* Blocked Users */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <UserX className="h-5 w-5 text-red-400" /> Blocked Users
              </h2>
              {blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="h-10 w-10 text-purple-300/20 mx-auto mb-3" />
                  <p className="text-sm text-purple-200/40">No blocked users</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map(id => (
                    <div key={id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
                      <span className="text-sm text-slate-700 dark:text-purple-200">User #{id}</span>
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Unblock</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Bell className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Notification Channels
              </h2>
              <div className="space-y-3">
                <ToggleItem icon={Smartphone} label="Push Notifications" description="Receive notifications on your device" enabled={notifications.pushEnabled} onToggle={() => toggleNotif('pushEnabled')} />
                <ToggleItem icon={Mail} label="Email Notifications" description="Get updates via email" enabled={notifications.emailEnabled} onToggle={() => toggleNotif('emailEnabled')} />
                <ToggleItem icon={Phone} label="SMS Notifications" description="Receive SMS alerts for important updates" enabled={notifications.smsEnabled} onToggle={() => toggleNotif('smsEnabled')} />
                <ToggleItem icon={MessageCircle} label="WhatsApp Notifications" description="Get alerts on WhatsApp" enabled={notifications.whatsappEnabled} onToggle={() => toggleNotif('whatsappEnabled')} />
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Bell className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Alert Preferences
              </h2>
              <div className="space-y-3">
                <ToggleItem icon={BadgeCheck} label="Match Alerts" description="When you get a new match" enabled={notifications.matchAlerts} onToggle={() => toggleNotif('matchAlerts')} />
                <ToggleItem icon={HalfHeart} label="Interest Alerts" description="When someone sends you interest" enabled={notifications.interestAlerts} onToggle={() => toggleNotif('interestAlerts')} />
                <ToggleItem icon={MessageCircle} label="Chat Notifications" description="New message notifications" enabled={notifications.chatNotifications} onToggle={() => toggleNotif('chatNotifications')} />
                <ToggleItem icon={Clock} label="Meeting Reminders" description="Reminders for scheduled meetings" enabled={notifications.meetingReminders} onToggle={() => toggleNotif('meetingReminders')} />
                <ToggleItem icon={Eye} label="Profile View Alerts" description="When someone views your profile" enabled={notifications.profileViews} onToggle={() => toggleNotif('profileViews')} />
                <ToggleItem icon={Mail} label="Weekly Digest" description="Weekly summary of your activity" enabled={notifications.weeklyDigest} onToggle={() => toggleNotif('weeklyDigest')} />
              </div>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Fingerprint className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Two-Factor Authentication
              </h2>
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-slate-400 dark:text-purple-300/60" />
                  <div>
                    <span className="text-sm text-slate-800 dark:text-white font-medium">2FA Authentication</span>
                    <p className="text-xs text-slate-300 dark:text-purple-300/40">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="text-xs px-4 py-2 bg-teal-50 dark:bg-purple-500/10 text-slate-600 dark:text-purple-300 rounded-xl border border-teal-200/50 dark:border-purple-500/20 hover:bg-teal-100/50 dark:bg-purple-500/20 transition-all">
                  Enable
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Key className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Password & Login
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10 hover:border-teal-200/50 dark:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-slate-400 dark:text-purple-300/60" />
                    <span className="text-sm text-slate-800 dark:text-white">Change Password</span>
                  </div>
                  <span className="text-xs text-slate-300 dark:text-purple-300/40">Last changed 30 days ago</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10 hover:border-teal-200/50 dark:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-purple-300/60" />
                    <span className="text-sm text-slate-800 dark:text-white">Change Email</span>
                  </div>
                  <span className="text-xs text-slate-300 dark:text-purple-300/40">{user.email}</span>
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Monitor className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Active Devices
              </h2>
              <div className="space-y-3">
                {devices.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-slate-400 dark:text-purple-300/60" />
                      <div>
                        <span className="text-sm text-slate-800 dark:text-white">{device.name}</span>
                        <p className="text-xs text-slate-300 dark:text-purple-300/40">{device.lastActive} {device.current && '• Current device'}</p>
                      </div>
                    </div>
                    {!device.current && (
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Shield className="h-5 w-5 text-green-400" /> Verification Status
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Email Verified', status: true, icon: Mail },
                  { label: 'Phone Verified', status: true, icon: Phone },
                  { label: 'ID Verification', status: false, icon: Shield },
                  { label: 'Selfie Verification', status: false, icon: Camera },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-teal-100 dark:border-purple-500/10">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-slate-400 dark:text-purple-300/60" />
                      <span className="text-sm text-slate-800 dark:text-white">{item.label}</span>
                    </div>
                    {item.status ? (
                      <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Verified</span>
                    ) : (
                      <button className="text-[10px] px-2 py-1 bg-teal-50 dark:bg-purple-500/10 text-slate-600 dark:text-purple-300 rounded-full border border-teal-200/50 dark:border-purple-500/20 hover:bg-teal-100/50 dark:bg-purple-500/20 transition-all">Verify</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Section */}
        {activeSection === 'account' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Language */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Globe className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Language / भाषा
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      language === lang.code ? 'border-purple-500/50 bg-teal-50 dark:bg-purple-500/10 shadow-[0_0_15px_rgba(147,51,234,0.2)]' : 'border-teal-100 dark:border-purple-500/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}>
                    <p className="text-base font-semibold text-slate-800 dark:text-white mb-0.5">{lang.nativeName}</p>
                    <p className="text-[10px] text-slate-300 dark:text-purple-300/40">{lang.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-red-500/20">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5 text-red-400" /> Danger Zone
              </h2>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-left hover:bg-red-500/10 transition-all">
                  <span className="text-sm text-red-300 font-medium">Deactivate Account</span>
                  <p className="text-xs text-red-300/50 mt-0.5">Temporarily hide your profile. Reactivate anytime.</p>
                </button>
                <button className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-left hover:bg-red-500/10 transition-all">
                  <span className="text-sm text-red-300 font-medium">Delete Account</span>
                  <p className="text-xs text-red-300/50 mt-0.5">Permanently delete all data. Cannot be undone.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button onClick={saveSettings} disabled={saving}
            className="btn-primary px-8 py-3 text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'} <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleItem({ icon: Icon, label, description, enabled, onToggle }: {
  icon: any; label: string; description: string; enabled: boolean; onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-teal-100 dark:border-purple-500/10 hover:border-teal-200/50 dark:border-purple-500/20 transition-all">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400 dark:text-purple-300/60" />
        <div>
          <span className="text-sm text-slate-800 dark:text-white font-medium">{label}</span>
          <p className="text-xs text-slate-300 dark:text-purple-300/40">{description}</p>
        </div>
      </div>
      <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-teal-100/50 dark:bg-purple-500/20'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${enabled ? 'translate-x-5.5 bg-white' : 'translate-x-0.5 bg-purple-300/40'}`} style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}