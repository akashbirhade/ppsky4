'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  if (authLoading || user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(email, password)
    if (success) router.push('/dashboard')
    else setError('Invalid email or password. Please check your credentials and try again.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center py-20 px-4">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] animate-float" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-fuchsia-600/8 rounded-full blur-[80px] animate-float-slow" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <HalfHeart className="h-10 w-10 mx-auto mb-3 animate-heartbeat" />
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-purple-300/50 mt-1">Continue your search for love</p>
        </div>

        <div className="glass-card animate-fade-in-up delay-200" style={{opacity:0}}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-purple-200/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="Enter your email" required />
              </div>
            </div>

            <div>
              <label className="block text-sm text-purple-200/60 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="Enter password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-purple-300/50">
                <input type="checkbox" className="rounded bg-white/5 border-purple-500/30" />
                Remember me
              </label>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
              <Sparkles className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-purple-500/10 pt-5">
            <p className="text-sm text-purple-300/50">
              New here?{' '}
              <Link href="/register" className="text-purple-300 hover:text-white transition-colors font-medium">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
