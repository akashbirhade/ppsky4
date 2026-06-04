'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Minus } from 'lucide-react'
import HalfHeart from './HalfHeart'
import { useAuth } from '@/context/AuthContext'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  language?: string
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string>('en')
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Namaste! 🙏✨ I'm your AI Matchmaking Assistant. I speak English, हिंदी, and मराठी! Ask me anything about finding your perfect match, profile tips, kundali matching, or safety guidance.",
        language: 'en'
      }])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim()
    if (!text) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages, userId: user?.id, sessionId })
      })
      const data = await res.json()
      if (data.language) setDetectedLang(data.language)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, language: data.language }])
        setIsTyping(false)
      }, 800 + Math.random() * 1000)
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "Let me try again in a moment! 💫" }])
        setIsTyping(false)
      }, 500)
    }
  }

  return (
    <>
      {/* Minimized Pill at Bottom */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.7)] hover:scale-105 transition-all duration-300 border border-purple-400/30"
        >
          <Bot className="h-4 w-4 text-slate-800 dark:text-white" />
          <span className="text-slate-800 dark:text-white text-sm font-medium">AI Chat</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Floating Button */}
      {!isMinimized && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
            isOpen 
              ? 'bg-purple-900/80 backdrop-blur-lg border border-purple-500/30 rotate-90' 
              : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.7)] hover:scale-110 animate-pulse-glow'
          }`}
        >
          {isOpen ? <X className="h-5 w-5 text-slate-800 dark:text-white" /> : (
            <div className="relative">
              <MessageCircle className="h-6 w-6 text-slate-800 dark:text-white" />
              <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-24 right-6 z-[100] w-[360px] sm:w-[400px] h-[520px] rounded-3xl overflow-hidden flex flex-col animate-scale-in shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(147,51,234,0.2)] border border-teal-200/50 dark:border-purple-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-fuchsia-900 p-4 border-b border-teal-200/50 dark:border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center border border-purple-400/30">
                <Bot className="h-5 w-5 text-purple-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">AI Match Assistant</h3>
                <p className="text-xs text-purple-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online • {detectedLang === 'hi' ? 'हिंदी' : detectedLang === 'mr' ? 'मराठी' : 'English'}
                </p>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="ml-auto p-1.5 hover:bg-purple-500/20 rounded-full transition-colors"
                title="Minimize"
              >
                <Minus className="h-4 w-4 text-purple-200" />
              </button>
              <HalfHeart className="h-4 w-4 animate-heartbeat" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-dark-900/95 backdrop-blur-xl">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-purple-500/30' : 'bg-fuchsia-500/20'
                  }`}>
                    {msg.role === 'user' ? <User className="h-3 w-3 text-purple-300" /> : <Bot className="h-3 w-3 text-fuchsia-400" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white border border-purple-500/50 rounded-br-sm'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-purple-100 border border-slate-200 dark:border-purple-400/10 rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-purple-400/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-white dark:bg-dark-900/90 border-t border-teal-100 dark:border-purple-500/10">
              <p className="text-[9px] text-slate-400 dark:text-purple-300/60 uppercase tracking-wider mb-2 px-1">Quick Actions</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {["Find matches", "Profile tips", "AI Bio Writer", "Compatibility check", "Red flag alerts", "Reply suggestions", "Kundali matching", "कुंडली मिलान"].map((a, i) => (
                  <button key={i} onClick={() => sendMessage(a)}
                    className="text-xs bg-slate-100 dark:bg-purple-500/10 text-slate-700 dark:text-purple-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-200 dark:hover:bg-purple-500/20 border border-slate-200 dark:border-purple-500/20 transition-all">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white dark:bg-dark-900/95 border-t border-teal-100 dark:border-purple-500/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={detectedLang === 'hi' ? 'कुछ भी पूछें...' : detectedLang === 'mr' ? 'काहीही विचारा...' : 'Ask in English, Hindi, or Marathi...'}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-slate-200 dark:border-purple-400/10 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-slate-800 dark:text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
