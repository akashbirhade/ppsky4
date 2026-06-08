'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Sparkles, Phone, Shield, CheckCircle } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

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
        body: JSON.stringify({ phone: cleanPhone, otp, purpose: 'login' })
      })
      const data = await res.json()
      if (res.ok && data.verified && data.token) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/dashboard'
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
              onClick={() => { setMode('password'); setError('') }}
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
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
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
                    <button type="button" onClick={() => { setOtpSent(false); setOtp('') }} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300">
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

          <div className="mt-6 text-center border-t border-teal-100 dark:border-purple-500/10 pt-5">
            <p className="text-sm text-slate-400 dark:text-purple-300/50">
              New here?{' '}
              <Link href="/register" className="text-slate-600 dark:text-purple-300 hover:text-slate-800 dark:text-white transition-colors font-medium">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
