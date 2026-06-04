'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function HostLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/hosts/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('hostUser', JSON.stringify(data.host))
        router.push('/hosts/portal')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-[104px] pb-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Host Login</h1>
          <p className="text-slate-500 dark:text-purple-300/60 mt-1">Access your regional host dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="host@soulmatesync.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-purple-300/70 mb-1 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-400/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400/50 hover:text-slate-600 dark:hover:text-purple-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold hover:from-teal-600 hover:to-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login as Host'}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 dark:text-purple-300/50">
              Not registered yet?{' '}
              <Link href="/hosts/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                Register as Host
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">Demo Credentials (any host):</p>
          <div className="space-y-1 text-xs text-teal-600 dark:text-teal-300/70">
            <p>Email: <span className="font-mono">ramesh.host@soulmatesync.com</span></p>
            <p>Password: <span className="font-mono">password123</span></p>
          </div>
          <p className="text-[10px] text-teal-500 dark:text-teal-400/50 mt-2">All 10 demo hosts use password: password123</p>
        </div>
      </div>
    </div>
  )
}
