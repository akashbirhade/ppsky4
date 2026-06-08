'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function VoiceAssistant() {
  const { user, authFetch } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [sessionId] = useState(() => `voice-${Math.random().toString(36).slice(2)}`)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speak = useCallback((text: string) => {
    if (isMuted || !synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    utterance.rate = 0.95
    utterance.pitch = 1.0
    // Try to get a female Indian English voice
    const voices = synthRef.current.getVoices()
    const indianVoice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en'))
    if (indianVoice) utterance.voice = indianVoice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }, [isMuted])

  const processVoiceInput = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: ConversationMessage = { role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsProcessing(true)

    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
          sessionId,
        })
      })
      const data = await res.json()
      const response = data.response || "I didn't catch that. Could you try again?"
      const assistantMsg: ConversationMessage = { role: 'assistant', content: response, timestamp: Date.now() }
      setMessages(prev => [...prev, assistantMsg])
      speak(response)
    } catch {
      const errorMsg: ConversationMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again.", timestamp: Date.now() }
      setMessages(prev => [...prev, errorMsg])
    }
    setIsProcessing(false)
  }, [authFetch, messages, user?.id, sessionId, speak])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please use Chrome.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      setTranscript(finalTranscript || interimTranscript)
      if (finalTranscript) {
        processVoiceInput(finalTranscript)
        setTranscript('')
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setTranscript('')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [processVoiceInput])

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setTranscript('')
  }

  const toggleMute = () => {
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
    setIsMuted(!isMuted)
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      const greeting = user
        ? `Namaste ${user.name?.split(' ')[0]}! 🙏 I'm your voice assistant. How can I help you today? You can ask me about profile setup, finding matches, registration help, or any questions about the platform.`
        : "Namaste! 🙏 I'm your voice assistant. I can help you register, find matches, or answer any questions. Tap the mic and speak naturally!"
      setMessages([{ role: 'assistant', content: greeting, timestamp: Date.now() }])
      speak(greeting)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-24 left-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:scale-110 transition-all animate-pulse-slow"
        title="Voice Assistant"
      >
        <Mic className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-white dark:bg-[#1a0533] border border-slate-200 dark:border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Voice Assistant</span>
          {isSpeaking && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full animate-pulse">Speaking...</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-white/20 transition">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={() => { setIsOpen(false); stopListening(); synthRef.current?.cancel() }} className="p-1.5 rounded-full hover:bg-white/20 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[50vh]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-500 text-white rounded-br-sm'
                : 'bg-slate-100 dark:bg-purple-500/10 text-slate-700 dark:text-purple-200 rounded-bl-sm border border-slate-200 dark:border-purple-500/20'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-purple-500/10 px-3 py-2 rounded-xl rounded-bl-sm border border-slate-200 dark:border-purple-500/20 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
              <span className="text-xs text-slate-500 dark:text-purple-300/60">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border-t border-slate-200 dark:border-purple-500/20">
          <p className="text-xs text-indigo-600 dark:text-indigo-300 italic">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-purple-500/20 flex items-center justify-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/40'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
        >
          {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 dark:text-purple-300/40 pb-3 -mt-1">
        {isListening ? 'Listening... Speak now' : 'Tap mic to speak'}
      </p>
    </div>
  )
}
