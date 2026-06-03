'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
  Menu, X, User, Edit, Download, Share2, Crown, Moon, MessageCircle, Inbox,
  Settings, SlidersHorizontal, Phone, HelpCircle, Shield, Star, FileText, LogOut, Sparkles, Users, Zap
} from 'lucide-react'
import HalfHeart from './HalfHeart'

export default function SideDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  const profileId = `Sh${user.id.replace(/\D/g, '').slice(0, 8).padEnd(8, '0')}`

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-[18px] left-4 z-[60] p-2 rounded-xl bg-white/5 border border-teal-100 dark:border-purple-500/10 text-slate-600 dark:text-purple-300">
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 z-[201] bg-white dark:bg-dark-900/98 border-r border-teal-100 dark:border-purple-500/10 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-teal-100 dark:border-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold gradient-text">Soulmate Sync</span>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-300 dark:text-purple-300/40 hover:text-slate-800 dark:text-white hover:bg-white/5 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400/20">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="50" fill="#2d1b69" />
                <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
                <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40">ID: {profileId}</p>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="p-3 border-b border-teal-100 dark:border-purple-500/10">
          <DrawerLink href="/profile" icon={<User className="h-4 w-4" />} label="View & Edit Profile" onClick={() => setIsOpen(false)} />
          <DrawerButton icon={<Download className="h-4 w-4" />} label="Download Profile" onClick={() => { window.print(); setIsOpen(false) }} />
          <DrawerButton icon={<Share2 className="h-4 w-4" />} label="Share Profile" onClick={() => { navigator.share?.({ title: 'My Soulmate Sync Profile', url: '/profile' }); setIsOpen(false) }} />
          <DrawerLink href="/premium" icon={<Crown className="h-4 w-4 text-amber-400" />} label="VIP Soulmate - Premium" badge="VIP" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/kundali" icon={<Moon className="h-4 w-4 text-amber-300" />} label="AstroChat" onClick={() => setIsOpen(false)} />
        </div>

        {/* Discover Your Match */}
        <div className="p-3 border-b border-teal-100 dark:border-purple-500/10">
          <p className="text-[10px] font-semibold text-purple-300/30 uppercase tracking-wider px-3 mb-2">Discover Your Match</p>
          <DrawerLink href="/matches" icon={<HalfHeart className="h-4 w-4" />} label="Matches" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/notifications" icon={<Inbox className="h-4 w-4 text-blue-400" />} label="Inbox" badge="3" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/messages" icon={<MessageCircle className="h-4 w-4 text-green-400" />} label="Chat" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/meeting" icon={<HalfHeart className="h-4 w-4" />} label="Meeting Planner" onClick={() => setIsOpen(false)} />
        </div>

        {/* Options & Settings */}
        <div className="p-3 border-b border-teal-100 dark:border-purple-500/10">
          <p className="text-[10px] font-semibold text-purple-300/30 uppercase tracking-wider px-3 mb-2">Options & Settings</p>
          <DrawerLink href="/preferences" icon={<SlidersHorizontal className="h-4 w-4" />} label="Partner Preferences" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/settings" icon={<Phone className="h-4 w-4" />} label="Contact Filters" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Account Settings" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/settings" icon={<HelpCircle className="h-4 w-4" />} label="Help & Support" onClick={() => setIsOpen(false)} />
          <DrawerLink href="/settings" icon={<Shield className="h-4 w-4 text-green-400" />} label="Be Safe Online" onClick={() => setIsOpen(false)} />
          <DrawerButton icon={<Star className="h-4 w-4 text-yellow-400" />} label="Rate the App" onClick={() => setIsOpen(false)} />
        </div>

        {/* Footer */}
        <div className="p-3">
          <DrawerButton icon={<FileText className="h-4 w-4" />} label="Terms & Conditions" onClick={() => setIsOpen(false)} />
          <button onClick={() => { logout(); setIsOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="h-4 w-4" /> Logout
          </button>

          {/* Upgrade Banner */}
          <Link href="/checkout?plan=gold" onClick={() => setIsOpen(false)}
            className="mt-3 block p-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-white">Upgrade Now</span>
              <span className="text-[9px] bg-red-500 text-slate-800 dark:text-white px-1.5 py-0.5 rounded-full font-bold">70% OFF</span>
            </div>
            <p className="text-[10px] text-amber-200/50 mt-1 pl-6">Unlock all premium features</p>
          </Link>
        </div>
      </div>
    </>
  )
}

function DrawerLink({ href, icon, label, badge, onClick }: { href: string; icon: React.ReactNode; label: string; badge?: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-purple-200/70 hover:text-slate-800 dark:text-white hover:bg-teal-50 dark:bg-purple-500/10 transition-all text-sm">
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
          badge === 'VIP' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-teal-100/50 dark:bg-purple-500/20 text-slate-600 dark:text-purple-300 border border-purple-500/30'
        }`}>{badge}</span>
      )}
    </Link>
  )
}

function DrawerButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-purple-200/70 hover:text-slate-800 dark:text-white hover:bg-teal-50 dark:bg-purple-500/10 transition-all text-sm text-left">
      {icon}
      <span>{label}</span>
    </button>
  )
}
