'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  gender: string
  age: number
  premium: boolean
  premiumPlan: string | null
  premiumExpiry: string | null
  profileComplete: boolean
  photos: string[]
  verified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>
  setSession: (user: User, token: string) => void
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  updateUserData: (data: Partial<User>) => void
  checkPremium: () => Promise<boolean>
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}

interface RegisterData {
  name: string
  email: string
  password: string
  gender: string
  dateOfBirth: string
  phone?: string
  religion?: string
  caste?: string
  motherTongue?: string
  height?: string
  education?: string
  occupation?: string
  income?: string
  city?: string
  state?: string
  about?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('soulmateSync_user')
    const storedToken = localStorage.getItem('soulmateSync_token')
    if (stored && storedToken) {
      setUser(JSON.parse(stored))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  /**
   * Authenticated fetch - automatically attaches JWT token to requests
   */
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = token || localStorage.getItem('soulmateSync_token')
    const headers = new Headers(options.headers || {})
    
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`)
    }
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, { ...options, headers })

    // If token is expired/invalid, logout user
    if (response.status === 401) {
      const data = await response.clone().json().catch(() => ({}))
      if (data.error?.includes('expired') || data.error?.includes('Invalid')) {
        logout()
      }
    }

    return response
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('soulmateSync_user', JSON.stringify(data.user))
        localStorage.setItem('soulmateSync_token', data.token)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const setSession = (userData: User, newToken: string) => {
    setUser(userData)
    setToken(newToken)
    localStorage.setItem('soulmateSync_user', JSON.stringify(userData))
    localStorage.setItem('soulmateSync_token', newToken)
  }

  const loginWithGoogle = async (credential: string): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('soulmateSync_user', JSON.stringify(data.user))
        localStorage.setItem('soulmateSync_token', data.token)
        return { success: true, isNewUser: data.isNewUser }
      }
      return { success: false, error: data.error || 'Google login failed' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const result = await res.json()
        setUser(result.user)
        setToken(result.token)
        localStorage.setItem('soulmateSync_user', JSON.stringify(result.user))
        localStorage.setItem('soulmateSync_token', result.token)
        return { success: true }
      }
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.error || 'Registration failed' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('soulmateSync_user')
    localStorage.removeItem('soulmateSync_token')
  }

  const updateUserData = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem('soulmateSync_user', JSON.stringify(updated))
    }
  }

  const checkPremium = async (): Promise<boolean> => {
    if (!user) return false
    try {
      const res = await authFetch(`/api/subscription?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.isPremium !== user.premium) {
          updateUserData({ premium: data.isPremium, premiumPlan: data.plan, premiumExpiry: data.expiry })
        }
        return data.isPremium
      }
    } catch {}
    return user.premium
  }

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, setSession, register, logout, loading, updateUserData, checkPremium, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
