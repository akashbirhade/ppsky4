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
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  updateUserData: (data: Partial<User>) => void
  checkPremium: () => Promise<boolean>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('soulmateSync_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

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
        localStorage.setItem('soulmateSync_user', JSON.stringify(data.user))
        localStorage.setItem('soulmateSync_token', data.token)
        return true
      }
      return false
    } catch {
      return false
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
      const res = await fetch(`/api/subscription?userId=${user.id}`)
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUserData, checkPremium }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
