'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, MessageCircle, User, Sparkles, Monitor, Calendar, Clock } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

type CallState = 'idle' | 'calling' | 'connected' | 'ended'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

function CallPageInner() {
  const { user, loading: authLoading } = useAuth()
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
  
  // WebRTC references
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])

  // Initialize WebSocket and WebRTC
  useEffect(() => {
    if (callState !== 'idle' || !user) return

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    socket.on('call:incoming', async (data: any) => {
      console.log('Incoming call from:', data.from)
      // setCallState will be handled by the calling component
    })

    socket.on('call:accepted', async (data: any) => {
      console.log('Call accepted, handling answer')
      if (peerConnectionRef.current && data.sdp) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
        } catch (err) {
          console.error('Error setting remote description:', err)
        }
      }
    })

    socket.on('call:offer', async (data: any) => {
      console.log('Received offer')
      if (data.sdp) {
        try {
          // Ensure peer connection is set up for receiving calls
          let pc = peerConnectionRef.current
          if (!pc) {
            setCallState('calling')
            if (data.callerName) setCallerName(data.callerName)
            if (data.callType) setCallType(data.callType)
            pc = await setupPeerConnection()
            if (!pc) return
          }
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('call:answer', { roomId: data.roomId, sdp: answer })
        } catch (err) {
          console.error('Error handling offer:', err)
        }
      }
    })

    socket.on('call:answer', async (data: any) => {
      console.log('Received answer')
      if (data.sdp && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
        } catch (err) {
          console.error('Error setting remote description:', err)
        }
      }
    })

    socket.on('call:ice', async (data: any) => {
      if (data.candidate && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (err) {
          console.error('Error adding ICE candidate:', err)
        }
      }
    })

    socket.on('call:ended', () => {
      console.log('Call ended by remote peer')
      endCall()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [callState, user])

  // Auto-start call if navigated from a profile
  useEffect(() => {
    if (paramType && paramName && callState === 'idle' && !peerConnectionRef.current) {
      const initCall = async () => {
        setCallType(paramType)
        setCallerName(paramName)
        await startCall(paramType, paramName)
      }
      initCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const setupPeerConnection = async () => {
    try {
      // Create peer connection
      const peerConnection = new RTCPeerConnection(ICE_SERVERS)
      peerConnectionRef.current = peerConnection

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false
      })
      
      localStreamRef.current = stream

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Set local video preview
      if (callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind)
        if (remoteStreamRef.current) {
          remoteStreamRef.current.addTrack(event.track)
        } else {
          const remoteStream = new MediaStream([event.track])
          remoteStreamRef.current = remoteStream
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
        }
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('call:ice', {
            roomId: user?.id,
            candidate: event.candidate
          })
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          setCallState('connected')
        } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          endCall()
        }
      }

      return peerConnection
    } catch (err) {
      console.error('Error setting up peer connection:', err)
      alert('Failed to access microphone/camera. Please check permissions.')
      return null
    }
  }

  const startCall = async (type: 'audio' | 'video', name?: string) => {
    setCallType(type)
    if (name) setCallerName(name)
    setCallState('calling')

    const pc = await setupPeerConnection()
    if (!pc) return

    try {
      // Create and send offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      if (socketRef.current) {
        socketRef.current.emit('call:initiate', {
          roomId: user?.id,
          callType: type,
          sdp: offer
        })
      }
    } catch (err) {
      console.error('Error creating offer:', err)
      endCall()
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const endCall = () => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Notify remote peer
    if (socketRef.current) {
      socketRef.current.emit('call:end')
    }

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
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-teal-600 dark:text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Connect via Call</h1>
              <p className="text-sm text-purple-200/40">Have a safe, in-app conversation before meeting in person</p>
            </div>

            {/* Recent Contacts */}
            <div className="glass-card mb-6 animate-fade-in-up delay-100" style={{opacity:0}}>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Recent Matches</h2>
              <div className="space-y-3">
                {['Priya Sharma', 'Ananya Desai', 'Meera Patel'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-purple-500/5 hover:border-teal-200/50 dark:border-purple-500/20 transition-all">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-teal-200/40 dark:border-purple-400/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/avatars/female.svg" alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{name}</p>
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
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-400" /> Safe Calling Features
              </h3>
              <ul className="space-y-2">
                {[
                  'Your phone number is never shared — calls are masked',
                  'All calls are within the app — fully encrypted',
                  'Report or block at any time during the call',
                  'Premium: Unlimited call duration & HD video'
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-purple-200/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Schedule a Call */}
            <div className="glass-card mt-6 animate-fade-in-up delay-300" style={{opacity:0}}>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" /> Schedule a Call
              </h3>
              <p className="text-xs text-purple-200/40 mb-4">Coordinate a call time with your match. They&apos;ll get a notification.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] text-slate-400 dark:text-purple-300/50 mb-1 block">Date</label>
                  <input type="date" className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 dark:text-purple-300/50 mb-1 block">Time</label>
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
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-50 dark:bg-purple-600/10 rounded-full blur-[80px] animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[60px] animate-float" style={{animationDelay: '2s'}} />
            </div>

            {/* Video placeholder / avatar */}
            <div className="relative z-10 flex flex-col items-center">
              {callType === 'video' && callState === 'connected' && !isVideoOff ? (
                <div className="w-72 h-96 sm:w-96 sm:h-[28rem] rounded-3xl bg-gradient-to-br from-purple-900/50 to-dark-900 border border-teal-200/50 dark:border-purple-500/20 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(147,51,234,0.2)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {/* Self view */}
                  <div className="absolute bottom-4 right-4 w-20 h-28 rounded-xl overflow-hidden border border-teal-200/40 dark:border-purple-400/20 bg-black">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                  {/* Duration overlay */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs text-slate-800 dark:text-white font-mono">{formatDuration(duration)}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-2 border-teal-200/50 dark:border-purple-400/30 mx-auto mb-6 ${
                    callState === 'calling' ? 'animate-pulse shadow-[0_0_40px_rgba(147,51,234,0.4)]' : 'shadow-[0_0_30px_rgba(147,51,234,0.2)]'
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/avatars/female.svg" alt={callerName} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{callerName}</h2>
                  <p className={`text-sm ${callState === 'calling' ? 'text-slate-400 dark:text-purple-300/50 animate-pulse' : callState === 'ended' ? 'text-red-400/60' : 'text-green-400'}`}>
                    {callState === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') :
                     callState === 'connected' ? formatDuration(duration) :
                     'Call ended'}
                  </p>
                </div>
              )}

              {/* Call Controls */}
              {callState !== 'ended' && (
                <div className="flex items-center gap-4">
                  <button onClick={toggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-800 dark:text-white border border-teal-200/50 dark:border-purple-500/20 hover:bg-white/10'}`}>
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  
                  {callType === 'video' && (
                    <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-800 dark:text-white border border-teal-200/50 dark:border-purple-500/20 hover:bg-white/10'}`}>
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </button>
                  )}

                  <button onClick={endCall} className="p-5 rounded-full bg-red-500 text-slate-800 dark:text-white hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                    <PhoneOff className="h-6 w-6" />
                  </button>

                  <button className="p-4 rounded-full bg-white/5 text-slate-800 dark:text-white border border-teal-200/50 dark:border-purple-500/20 hover:bg-white/10 transition-all">
                    <Volume2 className="h-5 w-5" />
                  </button>

                  <button className="p-4 rounded-full bg-white/5 text-slate-800 dark:text-white border border-teal-200/50 dark:border-purple-500/20 hover:bg-white/10 transition-all">
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
    <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center pt-20"><div className="text-slate-400 dark:text-purple-300/50 animate-pulse">Loading...</div></div>}>
      <CallPageInner />
    </Suspense>
  )
}
