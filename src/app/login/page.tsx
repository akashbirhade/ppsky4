'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Sparkles, Phone, Shield, CheckCircle } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement | null, config: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, loginWithGoogle, setSession, loading: authLoading } = useAuth()
  const router = useRouter()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setError('Google sign-in failed. Please try again.')
            return
          }
          setError('')
          setLoading(true)
          const result = await loginWithGoogle(response.credential)
          if (result.success) {
            router.push(result.isNewUser ? '/onboarding' : '/dashboard')
          } else {
            setError(result.error || 'Google login failed')
          }
          setLoading(false)
        },
      })
      if (googleBtnRef.current) {
        window.google?.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
        })
        setGoogleLoaded(true)
      }
    }
    document.head.appendChild(script)
    return () => { script.remove() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // OTP countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  if (authLoading || user) return null

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(email, password)
    if (success) router.push('/dashboard')
    else setError('Invalid email or password. Please check your credentials and try again.')
    setLoading(false)
  }

  const sendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number'); return
    }
    setError('')
    setOtpLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, purpose: 'login' })
      })
      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        setCountdown(30)
        if (data.otpToken) setOtpToken(data.otpToken)
        if (data.demo_otp) setDemoOtp(data.demo_otp)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Failed to send OTP. Please try again.')
    }
    setOtpLoading(false)
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP'); return
    }
    setError('')
    setLoading(true)
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, purpose: 'login', otpToken })
      })
      const data = await res.json()
      if (res.ok && data.verified && data.token) {
        // Update auth context (no full page reload needed)
        setSession(data.user, data.token)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch {
      setError('Login failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center py-20 px-4">
      <div className="absolute top-20 left-20 w-72 h-72 bg-teal-50 dark:bg-purple-600/10 rounded-full blur-[80px] animate-float" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-fuchsia-600/8 rounded-full blur-[80px] animate-float-slow" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <HalfHeart className="h-10 w-10 mx-auto mb-3 animate-heartbeat" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
          <p className="text-slate-400 dark:text-purple-300/50 mt-1">Continue your search for love</p>
        </div>

        <div className="glass-card animate-fade-in-up delay-200" style={{opacity:0}}>
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); setOtpSent(false); setOtp(''); setDemoOtp(''); setOtpToken(''); setCountdown(0) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'password' 
                  ? 'bg-white dark:bg-purple-600/20 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-600 dark:hover:text-purple-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'otp' 
                  ? 'bg-white dark:bg-purple-600/20 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-400 dark:text-purple-300/50 hover:text-slate-600 dark:hover:text-purple-200'
              }`}
            >
              Login with OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {/* Password Login */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="Enter your email" required />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="Enter password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 dark:text-purple-400/50 hover:text-slate-600 dark:text-purple-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 dark:text-purple-300/50">
                  <input type="checkbox" className="rounded bg-white/5 border-teal-200 dark:border-purple-500/30" />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode('otp')} className="text-purple-400 hover:text-slate-600 dark:text-purple-300 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
                <Sparkles className="h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {mode === 'otp' && (
            <form onSubmit={handleOtpLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-purple-300/60">+91</span>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    className="input-field pl-20" 
                    placeholder="Enter 10-digit number" 
                    maxLength={10}
                    disabled={otpSent}
                  />
                  {otpSent && (
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setDemoOtp(''); setOtpToken('') }} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300">
                      Change
                    </button>
                  )}
                </div>
              </div>

              {!otpSent && (
                <button 
                  type="button" 
                  onClick={sendOtp} 
                  disabled={otpLoading || phone.length !== 10}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              )}

              {otpSent && (
                <>
                  {demoOtp && (
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>Your OTP is: <strong className="font-mono tracking-wider">{demoOtp}</strong></span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Enter OTP</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                      <input 
                        type="text" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        className="input-field pl-11 text-center tracking-[0.5em] font-mono text-lg" 
                        placeholder="------" 
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
                    <Sparkles className="h-4 w-4" />
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <button 
                    type="button" 
                    onClick={sendOtp} 
                    disabled={countdown > 0 || otpLoading}
                    className="w-full text-sm text-center text-purple-400 hover:text-purple-300 disabled:text-slate-500 disabled:dark:text-purple-300/30 transition-colors"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </>
              )}
            </form>
          )}

          <div className="mt-6 border-t border-teal-100 dark:border-purple-500/10 pt-5">
            {/* Google Sign-In */}
            <div ref={googleBtnRef} className="flex justify-center mb-4" />
            {!googleLoaded && (
              <button
                type="button"
                onClick={() => {
                  if (window.google?.accounts?.id) {
                    window.google.accounts.id.prompt()
                  } else {
                    setError('Google Sign-In is loading. Please try again in a moment.')
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm font-medium text-slate-700 dark:text-purple-200 mb-4"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}

            <p className="text-sm text-slate-400 dark:text-purple-300/50 text-center">
              New here?{' '}
              <Link href="/register" className="text-slate-600 dark:text-purple-300 hover:text-slate-800 dark:text-white transition-colors font-medium">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
