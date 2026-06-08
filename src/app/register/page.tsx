'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Lock, Calendar, Users, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Phone, Shield } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    gender: '', dateOfBirth: '', lookingFor: '', phone: ''
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, register, loading: authLoading } = useAuth()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const sendOtp = async () => {
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number'); return
    }
    setError('')
    setOtpLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, purpose: 'register' })
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

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP'); return
    }
    setError('')
    setOtpLoading(true)
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '')
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, purpose: 'register' })
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        setPhoneVerified(true)
        setError('')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch {
      setError('Failed to verify OTP. Please try again.')
    }
    setOtpLoading(false)
  }

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      setError('Please fill all fields'); return
    }
    if (step === 2 && !phoneVerified) {
      setError('Please verify your mobile number'); return
    }
    if (step === 3 && (!formData.gender || !formData.dateOfBirth)) {
      setError('Please fill all fields'); return
    }
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return }
    
    setLoading(true)
    const result = await register({
      name: formData.name, email: formData.email,
      password: formData.password, gender: formData.gender, dateOfBirth: formData.dateOfBirth,
      phone: formData.phone.replace(/\D/g, '')
    })
    if (result.success) router.push('/onboarding')
    else setError(result.error || 'Registration failed. Please try again.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center py-20 px-4">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-teal-50 dark:bg-purple-600/10 rounded-full blur-[80px] animate-float" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] animate-float-slow" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <HalfHeart className="h-10 w-10 mx-auto mb-3 animate-heartbeat" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Join Soulmate Sync</h1>
          <p className="text-slate-400 dark:text-purple-300/50 mt-1">Begin your journey to forever</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up delay-100" style={{opacity:0}}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                step >= i 
                  ? 'bg-purple-600 text-slate-800 dark:text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' 
                  : 'bg-white/5 text-slate-300 dark:text-purple-300/40 border border-teal-200/50 dark:border-purple-500/20'
              }`}>
                {step > i ? <CheckCircle className="h-4 w-4" /> : i}
              </div>
              {i < 4 && <div className={`w-8 h-0.5 mx-1 transition-all duration-500 ${step > i ? 'bg-purple-500' : 'bg-teal-100/50 dark:bg-purple-500/20'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card animate-fade-in-up delay-200" style={{opacity:0}}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Let&apos;s get started
                </h2>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-11" placeholder="Enter your full name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-11" placeholder="Enter your email" required />
                  </div>
                </div>
                <button type="button" onClick={nextStep} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2: Phone Verification */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Verify your mobile
                </h2>
                <p className="text-sm text-slate-400 dark:text-purple-300/50">We&apos;ll send a 6-digit OTP to verify your number</p>
                
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-purple-300/60">+91</span>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="input-field pl-20" 
                      placeholder="Enter 10-digit number" 
                      maxLength={10}
                      disabled={phoneVerified}
                    />
                    {phoneVerified && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                  </div>
                </div>

                {!phoneVerified && !otpSent && (
                  <button 
                    type="button" 
                    onClick={sendOtp} 
                    disabled={otpLoading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}

                {otpSent && !phoneVerified && (
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
                    <button 
                      type="button" 
                      onClick={verifyOtp} 
                      disabled={otpLoading || otp.length !== 6}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
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

                {phoneVerified && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Mobile number verified successfully!
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={nextStep} disabled={!phoneVerified} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Details */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Tell us about you
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">I am a</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" required>
                      <option value="" className="bg-white dark:bg-dark-900">Select</option>
                      <option value="Male" className="bg-white dark:bg-dark-900">Male</option>
                      <option value="Female" className="bg-white dark:bg-dark-900">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Looking for</label>
                    <select name="lookingFor" value={formData.lookingFor} onChange={handleChange} className="input-field">
                      <option value="" className="bg-white dark:bg-dark-900">Select</option>
                      <option value="Bride" className="bg-white dark:bg-dark-900">Bride</option>
                      <option value="Groom" className="bg-white dark:bg-dark-900">Groom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field pl-11" required />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Password */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-teal-600 dark:text-purple-400" /> Secure your account
                </h2>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field pl-11" placeholder="Min 6 characters" required minLength={6} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-purple-200/60 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-purple-400/50" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field pl-11" placeholder="Re-enter password" required />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-400 dark:text-purple-300/50">
                  <input type="checkbox" className="mt-0.5 rounded bg-white/5 border-teal-200 dark:border-purple-500/30" required />
                  I agree to the Terms of Service and Privacy Policy. I confirm I am 18+ years old.
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Account ✨'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center border-t border-teal-100 dark:border-purple-500/10 pt-5">
            <p className="text-sm text-slate-400 dark:text-purple-300/50">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-600 dark:text-purple-300 hover:text-slate-800 dark:text-white transition-colors font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
