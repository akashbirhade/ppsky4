'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Send, Search, Phone, Video, ArrowLeft,
  MessageCircle, User, CheckCheck, Plus, ExternalLink, Loader2
} from 'lucide-react'

interface ConvUser {
  id: string; name: string; age?: number; city?: string; photos?: string[]
  online: boolean; gender?: string
}

interface Conversation {
  user: ConvUser
  lastMessage: { id: string; senderId: string; receiverId: string; content: string; timestamp: string; read: boolean }
  unreadCount: number
}

interface Message {
  id: string; senderId: string; receiverId: string; content: string
  timestamp: string; read: boolean; type?: string
}

function Avatar({ user, size = 12 }: { user?: { name?: string; photos?: string[]; gender?: string }, size?: number }) {
  const [imgErr, setImgErr] = useState(false)
  const photo = user?.photos?.[0]
  const cls = `w-${size} h-${size} rounded-full overflow-hidden border border-purple-400/20 shrink-0`
  if (photo && !imgErr) {
    return (
      <div className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={user?.name || ''} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
      </div>
    )
  }
  return (
    <div className={`${cls} flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20`}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="#2d1b69" />
        <circle cx="50" cy="38" r="16" fill="rgba(124,58,237,0.6)" />
        <ellipse cx="50" cy="80" rx="26" ry="22" fill="rgba(124,58,237,0.6)" />
      </svg>
    </div>
  )
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts: string) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MessagesInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatParam = searchParams.get('chat')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<ConvUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const convPollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchConversations = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/messages?userId=${user.id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } finally {
      setLoadingConvs(false)
    }
  }, [user])

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/messages?userId=${user.id}&partnerId=${partnerId}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch { /* ignore */ }
  }, [user])

  const markRead = useCallback(async (partnerId: string) => {
    if (!user) return
    await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, senderId: partnerId })
    }).catch(() => { /* ignore */ })
  }, [user])

  // Poll conversations every 5s
  useEffect(() => {
    fetchConversations()
    convPollRef.current = setInterval(fetchConversations, 5000)
    return () => { if (convPollRef.current) clearInterval(convPollRef.current) }
  }, [fetchConversations])

  // Handle ?chat= URL param — auto-open that profile's chat
  useEffect(() => {
    if (!chatParam || !user) return
    setSelectedId(chatParam)
    setLoadingMsgs(true)
    fetchMessages(chatParam).then(() => setLoadingMsgs(false))
    markRead(chatParam)
    // Fetch the profile info for the header
    fetch(`/api/profiles/${chatParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile) setSelectedUser({ ...data.profile, online: data.profile.online ?? false })
      })
      .catch(() => { /* ignore */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatParam, user])

  const openChat = useCallback((conv: Conversation) => {
    setSelectedId(conv.user.id)
    setSelectedUser(conv.user)
    setLoadingMsgs(true)
    fetchMessages(conv.user.id).then(() => setLoadingMsgs(false))
    markRead(conv.user.id)
    window.history.replaceState(null, '', `/messages?chat=${conv.user.id}`)
  }, [fetchMessages, markRead])

  // Poll messages in active chat every 2.5s
  useEffect(() => {
    if (!selectedId) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(selectedId), 2500)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user || !selectedId || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    // Optimistic
    const optimistic: Message = {
      id: `temp-${Date.now()}`, senderId: user.id, receiverId: selectedId,
      content: text, timestamp: new Date().toISOString(), read: false, type: 'text'
    }
    setMessages(prev => [...prev, optimistic])
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, receiverId: selectedId, content: text })
      })
      if (res.ok) {
        await fetchMessages(selectedId)
        await fetchConversations()
      }
    } finally {
      setSending(false)
    }
  }

  const filtered = conversations.filter(c =>
    c.user.name.toLowerCase().includes(searchQ.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-[104px]">
      <div className="max-w-6xl mx-auto h-[calc(100vh-6.5rem)]">
        <div className="glass-card h-full !p-0 !rounded-none sm:!rounded-3xl overflow-hidden flex">

          {/* ── Sidebar ── */}
          <div className={`w-full sm:w-80 lg:w-96 border-r border-slate-200 dark:border-purple-500/10 flex flex-col bg-white dark:bg-transparent ${selectedId ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-purple-500/10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-purple-400" /> Messages
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/40" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search conversations..." className="input-field !pl-10 text-sm" />
              </div>
            </div>

            <div className="px-4 py-2 border-b border-slate-200 dark:border-purple-500/10">
              <Link href="/search" className="flex items-center gap-2 text-xs text-teal-600 dark:text-purple-400/60 hover:text-teal-700 dark:hover:text-purple-300 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Start new conversation from Search
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-purple-400/40 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                  <MessageCircle className="h-10 w-10 text-purple-400/20" />
                  <p className="text-sm text-purple-300/40">No conversations yet</p>
                  <Link href="/search" className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2">
                    Browse profiles to start chatting
                  </Link>
                </div>
              ) : (
                filtered.map(conv => (
                  <button key={conv.user.id} onClick={() => openChat(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-purple-500/5 transition-colors border-b border-purple-500/5 ${selectedId === conv.user.id ? 'bg-purple-500/10' : ''}`}>
                    <div className="relative">
                      <Avatar user={conv.user} size={12} />
                      {conv.user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white truncate">{conv.user.name}</span>
                        <span className="text-[10px] text-purple-300/40 whitespace-nowrap">
                          {timeAgo(conv.lastMessage.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-purple-300/40 truncate mt-0.5">
                        {conv.lastMessage.senderId === user.id && <span className="text-purple-400/40">You: </span>}
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden sm:flex' : 'flex'}`}>
            {selectedId && selectedUser ? (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-purple-500/10 flex items-center gap-3 bg-white dark:bg-white/[0.02]">
                  <button onClick={() => { setSelectedId(null); setSelectedUser(null); window.history.replaceState(null, '', '/messages') }}
                    className="sm:hidden text-slate-500 dark:text-purple-300/50">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <Avatar user={selectedUser} size={10} />
                    {selectedUser.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{selectedUser.name}</h3>
                    <div className="flex items-center gap-3">
                      <p className={`text-[10px] ${selectedUser.online ? 'text-green-500' : 'text-slate-400 dark:text-purple-300/40'}`}>
                        {selectedUser.online ? 'Online now' : 'Last seen recently'}
                      </p>
                      {selectedUser.age && (
                        <span className="text-[10px] text-slate-400 dark:text-purple-300/40">{selectedUser.age}y · {selectedUser.city}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/profile/${selectedId}`}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-500/10 text-slate-500 dark:text-purple-300/50 transition-colors" title="View profile">
                      <User className="h-4 w-4" />
                    </Link>
                    <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-500/10 text-slate-500 dark:text-purple-300/50 transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-500/10 text-slate-500 dark:text-purple-300/50 transition-colors">
                      <Video className="h-4 w-4" />
                    </button>
                    <Link href={`/profile/${selectedId}`}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-500/10 text-slate-500 dark:text-purple-300/50 transition-colors" title="Full profile">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-slate-50 dark:bg-[linear-gradient(180deg,rgba(15,10,30,0.98)_0%,rgba(20,12,40,0.98)_100%)]">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 text-purple-400/40 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-purple-400/30" />
                      </div>
                      <p className="text-sm text-purple-300/40">No messages yet</p>
                      <p className="text-xs text-purple-300/30">Say hello to {selectedUser.name} 👋</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user.id
                      const prev = idx > 0 ? messages[idx - 1] : null
                      const showDate = !prev || formatDate(prev.timestamp) !== formatDate(msg.timestamp)
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="text-[10px] text-slate-500 dark:text-purple-300/40 bg-slate-100 dark:bg-purple-500/5 px-4 py-1 rounded-full border border-slate-200 dark:border-purple-500/10">
                                {formatDate(msg.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex items-end gap-2 my-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && <Avatar user={selectedUser} size={7} />}
                            <div className={`max-w-[70%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                              isMe
                                ? 'bg-purple-600 text-white rounded-br-md shadow-[0_2px_8px_rgba(147,51,234,0.25)]'
                                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-purple-100 border border-slate-200 dark:border-purple-500/10 rounded-bl-md'
                            }`}>
                              <p>{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                <span className={`text-[9px] ${isMe ? 'text-purple-200/70' : 'text-slate-400 dark:text-purple-400/40'}`}>
                                  {formatTime(msg.timestamp)}
                                </span>
                                {isMe && (
                                  <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-400' : 'text-purple-300/30'}`} />
                                )}
                              </div>
                            </div>
                            {isMe && (
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-purple-400/10 flex items-center justify-center bg-indigo-900/60">
                                <User className="h-3.5 w-3.5 text-indigo-300/60" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMsg} className="px-3 py-3 border-t border-slate-200 dark:border-purple-500/10 bg-white dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input value={input} onChange={e => setInput(e.target.value)}
                        placeholder={`Message ${selectedUser.name}…`}
                        autoFocus
                        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/[0.04] rounded-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-purple-300/30 focus:outline-none focus:ring-1 focus:ring-purple-500/30 border border-slate-200 dark:border-purple-500/10 transition-all" />
                    </div>
                    <button type="submit" disabled={!input.trim() || sending}
                      className="w-9 h-9 bg-gradient-to-r from-purple-600 to-fuchsia-600 disabled:from-purple-900 disabled:to-purple-900 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all disabled:opacity-40 shrink-0">
                      {sending ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-10 w-10 text-purple-400/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Your Messages</h3>
                  <p className="text-sm text-purple-300/40 mb-4">Select a conversation to start chatting</p>
                  <Link href="/search"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-sm text-purple-300 hover:bg-purple-600/30 transition-all">
                    <Search className="h-4 w-4" /> Find people to chat with
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  )
}
