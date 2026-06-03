'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, MessageCircle, User, Sparkles, Monitor, Calendar, Clock } from 'lucide-react'

type CallState = 'idle' | 'calling' | 'connected' | 'ended'

function CallPageInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const paramType = (searchParams.get('type') as 'audio' | 'video') || null
  const paramName = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : null

  const [callState, setCallState] = useState<CallState>('idle')
  const [callType, setCallType] = useState<'audio' | 'video'>(paramType || 'video')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [duration, setDuration] = useState(0)
  const [callerName, setCallerName] = useState(paramName || 'Priya Sharma')

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  // Auto-start call if navigated from a profile
  useEffect(() => {
    if (paramType && paramName) {
      setCallType(paramType)
      setCallerName(paramName)
      setCallState('calling')
      setTimeout(() => setCallState('connected'), 3000)
    }
  }, [paramType, paramName])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callState === 'connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callState])

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startCall = (type: 'audio' | 'video', name?: string) => {
    setCallType(type)
    if (name) setCallerName(name)
    setCallState('calling')
    setTimeout(() => setCallState('connected'), 3000)
  }

  const endCall = () => {
    setCallState('ended')
    setDuration(0)
    setTimeout(() => {
      setCallState('idle')
      // If we auto-started (came from profile), go back after call ends
      if (paramName) router.back()
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {callState === 'idle' ? (
          <div className="py-12">
            {/* Header */}
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Connect via Call</h1>
              <p className="text-sm text-purple-200/40">Have a safe, in-app conversation before meeting in person</p>
            </div>

            {/* Recent Contacts */}
            <div className="glass-card mb-6 animate-fade-in-up delay-100" style={{opacity:0}}>
              <h2 className="text-sm font-semibold text-white mb-4">Recent Matches</h2>
              <div className="space-y-3">
                {['Priya Sharma', 'Ananya Desai', 'Meera Patel'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-purple-500/5 hover:border-purple-500/20 transition-all">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-purple-400/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/avatars/female.svg" alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-[10px] text-green-400">Online</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startCall('audio', name)} className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button onClick={() => startCall('video', name)} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                        <Video className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Note */}
            <div className="glass-card border-green-500/10 animate-fade-in-up delay-200" style={{opacity:0}}>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-400" /> Safe Calling Features
              </h3>
              <ul className="space-y-2">
                {[
                  'Your phone number is never shared — calls are masked',
                  'All calls are within the app — fully encrypted',
                  'Report or block at any time during the call',
                  'Premium: Unlimited call duration & HD video'
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-purple-200/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Schedule a Call */}
            <div className="glass-card mt-6 animate-fade-in-up delay-300" style={{opacity:0}}>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" /> Schedule a Call
              </h3>
              <p className="text-xs text-purple-200/40 mb-4">Coordinate a call time with your match. They&apos;ll get a notification.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] text-purple-300/50 mb-1 block">Date</label>
                  <input type="date" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-purple-300/50 mb-1 block">Time</label>
                  <input type="time" className="input-field w-full text-sm" />
                </div>
              </div>
              <div className="flex gap-3">
                <select className="input-field flex-1 text-sm">
                  <option>Select match to call</option>
                  <option>Priya Sharma</option>
                  <option>Ananya Desai</option>
                  <option>Meera Patel</option>
                </select>
                <button className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Schedule
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Call UI */
          <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center relative">
            {/* Background effects for call */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[60px] animate-float" style={{animationDelay: '2s'}} />
            </div>

            {/* Video placeholder / avatar */}
            <div className="relative z-10 flex flex-col items-center">
              {callType === 'video' && callState === 'connected' && !isVideoOff ? (
                <div className="w-72 h-96 sm:w-96 sm:h-[28rem] rounded-3xl bg-gradient-to-br from-purple-900/50 to-dark-900 border border-purple-500/20 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(147,51,234,0.2)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/avatars/female.svg" alt={callerName} className="w-full h-full object-cover" />
                  {/* Self view */}
                  <div className="absolute bottom-4 right-4 w-20 h-28 rounded-xl overflow-hidden border border-purple-400/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user?.gender?.toLowerCase() === 'female' ? '/avatars/female.svg' : '/avatars/male.svg'} alt="You" className="w-full h-full object-cover" />
                  </div>
                  {/* Duration overlay */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs text-white font-mono">{formatDuration(duration)}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-2 border-purple-400/30 mx-auto mb-6 ${
                    callState === 'calling' ? 'animate-pulse shadow-[0_0_40px_rgba(147,51,234,0.4)]' : 'shadow-[0_0_30px_rgba(147,51,234,0.2)]'
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/avatars/female.svg" alt={callerName} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{callerName}</h2>
                  <p className={`text-sm ${callState === 'calling' ? 'text-purple-300/50 animate-pulse' : callState === 'ended' ? 'text-red-400/60' : 'text-green-400'}`}>
                    {callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') :
                     callState === 'connected' ? formatDuration(duration) :
                     'Call ended'}
                  </p>
                </div>
              )}

              {/* Call Controls */}
              {callState !== 'ended' && (
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white border border-purple-500/20 hover:bg-white/10'}`}>
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  
                  {callType === 'video' && (
                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white border border-purple-500/20 hover:bg-white/10'}`}>
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </button>
                  )}

                  <button onClick={endCall} className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                    <PhoneOff className="h-6 w-6" />
                  </button>

                  <button className="p-4 rounded-full bg-white/5 text-white border border-purple-500/20 hover:bg-white/10 transition-all">
                    <Volume2 className="h-5 w-5" />
                  </button>

                  <button className="p-4 rounded-full bg-white/5 text-white border border-purple-500/20 hover:bg-white/10 transition-all">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center pt-20"><div className="text-purple-300/50 animate-pulse">Loading...</div></div>}>
      <CallPageInner />
    </Suspense>
  )
}
