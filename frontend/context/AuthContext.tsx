'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  authProvider: 'local' | 'google'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await api.me()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    setUser(data.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const data = await api.signup(name, email, password)
    setUser(data.user)
  }

  const loginWithGoogle = async (credential: string) => {
    const data = await api.googleAuth(credential)
    setUser(data.user)
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const updateUser = (updated: User) => {
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}