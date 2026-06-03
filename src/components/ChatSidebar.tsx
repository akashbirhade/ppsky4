'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Volume2, VolumeX, MessageCircle, Minus, Search, ChevronDown, CheckCircle2, Circle } from 'lucide-react'

interface ChatUser {
  id: string
  name: string
  photo?: string
  gender?: 'male' | 'female'
  message: string
  time: string
  unread: number
  online?: boolean
  verified?: boolean
}

/** Gender-based illustrated avatar placeholder */
function DefaultAvatar({ gender }: { gender?: 'male' | 'female' }) {
  const src = gender === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="avatar" className="w-full h-full object-cover" />
}

type OnlineStatus = 'online' | 'busy' | 'invisible'

const STATUS_CONFIG: Record<OnlineStatus, { label: string; color: string; dotClass: string }> = {
  online:    { label: 'I am Online',   color: 'bg-green-500',  dotClass: 'bg-green-500' },
  busy:      { label: 'I am Busy',     color: 'bg-yellow-500', dotClass: 'bg-yellow-500' },
  invisible: { label: 'Invisible',     color: 'bg-gray-500',   dotClass: 'bg-gray-500' },
}

function ChatAvatar({ name, photo, gender, online, verified }: { name: string; photo?: string; gender?: 'male' | 'female'; online?: boolean; verified?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !photo || imgFailed

  return (
    <div className="relative shrink-0">
      <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border border-teal-200/50 dark:border-purple-500/20">
        {!showPlaceholder ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <DefaultAvatar gender={gender} />
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-900" />
      )}
      {verified && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-dark-900">
          <CheckCircle2 className="w-3 h-3 text-slate-800 dark:text-white" />
        </span>
      )}
    </div>
  )
}

export default function ChatSidebar() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'alerts' | 'chats' | 'active'>('alerts')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('online')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    setChatUsers([
      { id: '1', name: 'Priya Sharma',    photo: '/uploads/priya1.jpg',      gender: 'female', message: 'Hello, I liked your profile...', time: '28/05/2026', unread: 1, online: true,  verified: true  },
      { id: '2', name: 'Jyoti B',         photo: '/uploads/jyoti1.jpg',       gender: 'female', message: 'Has messaged you',               time: '28/05/2026', unread: 1, online: false, verified: false },
      { id: '3', name: 'Archita Bankar',  photo: '/uploads/archita1.jpg',     gender: 'female', message: 'Hello, I liked your profile...', time: '28/05/2026', unread: 1, online: true,  verified: true  },
      { id: '4', name: 'Dipali Nikam',    photo: '/uploads/dipali1.jpg',      gender: 'female', message: 'Can we talk on whtsapp',         time: '27/05/2026', unread: 2, online: false, verified: false },
      { id: '5', name: 'Tilotama Kamble', photo: '/uploads/tilotama1.jpg',    gender: 'female', message: 'Tumhi kuthe rahta ??',           time: '27/05/2026', unread: 2, online: true,  verified: false },
      { id: '6', name: 'Aishwarya Phul',  photo: '/uploads/aishwarya1.jpg',   gender: 'female', message: 'Hello, I went through your...', time: '26/05/2026', unread: 1, online: false, verified: true  },
      { id: '7', name: 'Vidhya J',        photo: '/uploads/vidhya1.jpg',      gender: 'female', message: 'Has messaged you',               time: '23/05/2026', unread: 1, online: false, verified: false },
      { id: '8', name: 'Tanuja T',        photo: '/uploads/tanuja1.jpg',      gender: 'female', message: 'Has messaged you',               time: '20/05/2026', unread: 1, online: false, verified: true  },
    ])
  }, [user])

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredUsers = chatUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUsers = chatUsers.filter(u => u.online)

  const displayedUsers = activeTab === 'active' ? activeUsers : filteredUsers

  if (!user) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="hidden xl:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-900/95 backdrop-blur-xl border border-teal-200/50 dark:border-purple-500/20 rounded-full shadow-[0_4px_24px_rgba(147,51,234,0.2)] hover:border-purple-500/40 hover:scale-105 transition-all duration-300"
      >
        <MessageCircle className="h-4 w-4 text-teal-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Chats</span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </button>
    )
  }

  const status = STATUS_CONFIG[onlineStatus]

  return (
    <div className="hidden xl:flex fixed right-0 top-[104px] w-72 h-[calc(100vh-104px)] bg-white dark:bg-dark-900/95 backdrop-blur-xl border-l border-teal-100 dark:border-purple-500/10 z-40 flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-teal-100 dark:border-purple-500/10 bg-white/[0.02]">

        {/* Online Status Dropdown */}
        <div className="relative flex-1" ref={statusMenuRef}>
          <button
            onClick={() => setShowStatusMenu(v => !v)}
            className="flex items-center gap-1.5 hover:bg-teal-50 dark:bg-purple-500/10 rounded-md px-1 py-0.5 transition-colors w-full"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dotClass}`} />
            <span className="text-xs font-medium text-slate-700 dark:text-purple-200 flex-1 text-left">{status.label}</span>
            <ChevronDown className={`h-3 w-3 text-teal-600 dark:text-purple-400/60 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-dark-900 border border-teal-200/50 dark:border-purple-500/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              {(Object.entries(STATUS_CONFIG) as [OnlineStatus, typeof STATUS_CONFIG[OnlineStatus]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setOnlineStatus(key); setShowStatusMenu(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-teal-50 dark:bg-purple-500/10 transition-colors ${onlineStatus === key ? 'text-purple-200' : 'text-slate-400 dark:text-purple-300/50'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                  {cfg.label}
                  {onlineStatus === key && <Circle className="w-1.5 h-1.5 fill-purple-400 text-teal-600 dark:text-purple-400 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(v => !v)}
          className={`p-1 rounded-full transition-colors ${isMuted ? 'text-red-400 hover:bg-red-500/10' : 'text-purple-400/40 hover:bg-teal-50 dark:bg-purple-500/10'}`}
          title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Minimize */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-teal-100/50 dark:bg-purple-500/20 rounded-full transition-colors"
          title="Minimize"
        >
          <Minus className="h-3.5 w-3.5 text-teal-600 dark:text-purple-400/60" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-purple-500/5">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-teal-100 dark:border-purple-500/10 focus-within:border-purple-500/30 transition-colors">
          <Search className="h-3.5 w-3.5 text-teal-600 dark:text-purple-400/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-xs text-purple-100 placeholder-purple-300/30 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-purple-400/40 hover:text-slate-600 dark:text-purple-300 text-xs leading-none">✕</button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {displayedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-purple-300/30 text-xs gap-1">
            <MessageCircle className="h-5 w-5" />
            <span>No results found</span>
          </div>
        ) : (
          displayedUsers.map((chatUser) => (
            <Link
              key={chatUser.id}
              href="/messages"
              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 border-b border-purple-500/5 transition-colors group"
            >
              <ChatAvatar name={chatUser.name} photo={chatUser.photo} gender={chatUser.gender} online={chatUser.online} verified={chatUser.verified} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold text-purple-100 truncate group-hover:text-slate-800 dark:text-white transition-colors">
                    {chatUser.name}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-purple-300/40 whitespace-nowrap shrink-0">{chatUser.time}</span>
                </div>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 truncate mt-0.5">{chatUser.message}</p>
              </div>
              {chatUser.unread > 0 && (
                <span className="shrink-0 min-w-[18px] h-[18px] bg-green-500 text-slate-800 dark:text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chatUser.unread}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="flex border-t border-teal-100 dark:border-purple-500/10 bg-white/[0.02]">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2 text-[10px] font-medium text-center transition-colors ${activeTab === 'alerts' ? 'text-slate-600 dark:text-purple-300 border-t-2 border-purple-400' : 'text-purple-300/30 hover:text-purple-300/60'}`}
        >
          Alerts (31)
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 text-[10px] font-medium text-center transition-colors ${activeTab === 'chats' ? 'text-slate-600 dark:text-purple-300 border-t-2 border-purple-400' : 'text-purple-300/30 hover:text-purple-300/60'}`}
        >
          Chats (46)
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-[10px] font-medium text-center transition-colors ${activeTab === 'active' ? 'text-slate-600 dark:text-purple-300 border-t-2 border-purple-400' : 'text-purple-300/30 hover:text-purple-300/60'}`}
        >
          Active ({activeUsers.length})
        </button>
      </div>
    </div>
  )
}
