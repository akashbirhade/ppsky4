'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Lock, Calendar, Users, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    gender: '', dateOfBirth: '', lookingFor: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, register, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  if (authLoading || user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      setError('Please fill all fields'); return
    }
    if (step === 2 && (!formData.gender || !formData.dateOfBirth)) {
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
    const success = await register({
      name: formData.name, email: formData.email,
      password: formData.password, gender: formData.gender, dateOfBirth: formData.dateOfBirth
    })
    if (success) router.push('/onboarding')
    else setError('Registration failed. Email might already be registered.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center py-20 px-4">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] animate-float" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] animate-float-slow" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <HalfHeart className="h-10 w-10 mx-auto mb-3 animate-heartbeat" />
          <h1 className="text-3xl font-bold text-white">Join Soulmate Sync</h1>
          <p className="text-purple-300/50 mt-1">Begin your journey to forever</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up delay-100" style={{opacity:0}}>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                step >= i 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' 
                  : 'bg-white/5 text-purple-300/40 border border-purple-500/20'
              }`}>
                {step > i ? <CheckCircle className="h-4 w-4" /> : i}
              </div>
              {i < 3 && <div className={`w-12 h-0.5 mx-1 transition-all duration-500 ${step > i ? 'bg-purple-500' : 'bg-purple-500/20'}`} />}
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
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" /> Let&apos;s get started
                </h2>
                <div>
                  <label className="block text-sm text-purple-200/60 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-11" placeholder="Enter your full name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-purple-200/60 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-11" placeholder="Enter your email" required />
                  </div>
                </div>
                <button type="button" onClick={nextStep} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" /> Tell us about you
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-purple-200/60 mb-1.5">I am a</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" required>
                      <option value="" className="bg-dark-900">Select</option>
                      <option value="Male" className="bg-dark-900">Male</option>
                      <option value="Female" className="bg-dark-900">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-purple-200/60 mb-1.5">Looking for</label>
                    <select name="lookingFor" value={formData.lookingFor} onChange={handleChange} className="input-field">
                      <option value="" className="bg-dark-900">Select</option>
                      <option value="Bride" className="bg-dark-900">Bride</option>
                      <option value="Groom" className="bg-dark-900">Groom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-purple-200/60 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field pl-11" required />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" /> Secure your account
                </h2>
                <div>
                  <label className="block text-sm text-purple-200/60 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field pl-11" placeholder="Min 6 characters" required minLength={6} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-purple-200/60 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field pl-11" placeholder="Re-enter password" required />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-xs text-purple-300/50">
                  <input type="checkbox" className="mt-0.5 rounded bg-white/5 border-purple-500/30" required />
                  I agree to the Terms of Service and Privacy Policy. I confirm I am 18+ years old.
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Account ✨'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center border-t border-purple-500/10 pt-5">
            <p className="text-sm text-purple-300/50">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-300 hover:text-white transition-colors font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
