'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 사용자 상태 확인
    checkUser()
    
    // localStorage 변경 감지 (다른 탭에서의 로그인/로그아웃)
    const handleStorageChange = () => {
      checkUser()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const checkUser = async () => {
    try {
      const { data, error } = await auth.getUser()
      if (data?.user) {
        setUser(data.user as User)
      }
    } catch (error) {
      console.error('사용자 확인 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password)
    if (error) throw error
    if (data?.user) {
      setUser(data.user as User)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await auth.signUp(email, password, { data: metadata })
    if (error) throw error
    if (data?.user) {
      setUser(data.user as User)
    }
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}