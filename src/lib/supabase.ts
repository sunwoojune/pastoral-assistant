import { createBrowserClient } from '@supabase/ssr'

// Mock 인증 시뮬레이터 (실제 Supabase 연동 전까지 사용)
const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'

export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    church?: string
  }
}

export interface AuthError {
  message: string
}

// Mock 사용자 데이터
const mockUser: User = {
  id: 'mock-user-id',
  email: 'pastor@example.com',
  user_metadata: {
    full_name: '김목사',
    church: '은혜교회'
  }
}

// Mock 인증 함수들
const mockAuth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    // 실제로는 validation 로직이 들어감
    if (email && password.length >= 6) {
      // localStorage에 사용자 정보 저장 (Mock용)
      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem('mock-registered-users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        // 이미 등록된 이메일인지 확인
        const existingUser = users.find((u: any) => u.email === email)
        if (existingUser) {
          return { data: null, error: { message: '이미 등록된 이메일입니다.' } }
        }
        
        // 새 사용자 등록
        const newUser = {
          id: 'user-' + Date.now(),
          email,
          password, // 실제 서비스에서는 해시화 필요
          user_metadata: metadata || {}
        }
        users.push(newUser)
        localStorage.setItem('mock-registered-users', JSON.stringify(users))
        
        return { data: { user: { ...newUser, password: undefined } }, error: null }
      }
      
      return { data: { user: { ...mockUser, email } }, error: null }
    }
    return { data: null, error: { message: '이메일과 비밀번호를 확인해주세요.' } }
  },

  signIn: async (email: string, password: string) => {
    // Mock에서는 localStorage에 저장된 사용자 확인
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('mock-registered-users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      // 등록된 사용자인지 확인
      const user = users.find((u: any) => u.email === email && u.password === password)
      if (user) {
        return { data: { user: { ...user, password: undefined } }, error: null }
      }
    }
    
    // 기본 Mock 로그인 (개발용)
    if (email && password.length >= 6) {
      return { data: { user: { ...mockUser, email } }, error: null }
    }
    
    return { data: null, error: { message: '로그인 정보가 올바르지 않습니다.' } }
  },

  signOut: async () => {
    return { error: null }
  },

  getUser: async () => {
    // localStorage에서 로그인 상태 확인
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('mock-logged-in') === 'true'
      return { data: { user: isLoggedIn ? mockUser : null }, error: null }
    }
    return { data: { user: null }, error: null }
  }
}

// 실제 Supabase 클라이언트
let supabase: any = null
if (!useMockAuth) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      supabase = createBrowserClient(supabaseUrl, supabaseKey)
    } else {
      console.warn('Supabase 환경변수가 설정되지 않음, Mock 모드로 전환됩니다.')
    }
  } catch (error) {
    console.warn('Supabase 클라이언트 생성 실패, Mock 모드로 전환됩니다.')
  }
}

// 통합 Auth 인터페이스
export const auth = {
  signUp: async (email: string, password: string, options?: { data?: any }) => {
    if (useMockAuth || !supabase) {
      const result = await mockAuth.signUp(email, password, options?.data)
      if (result.data?.user && typeof window !== 'undefined') {
        localStorage.setItem('mock-logged-in', 'true')
        localStorage.setItem('mock-user', JSON.stringify(result.data.user))
      }
      return result
    }
    return supabase.auth.signUp({ email, password, options })
  },

  signIn: async (email: string, password: string) => {
    if (useMockAuth || !supabase) {
      const result = await mockAuth.signIn(email, password)
      if (result.data?.user && typeof window !== 'undefined') {
        localStorage.setItem('mock-logged-in', 'true')
        localStorage.setItem('mock-user', JSON.stringify(result.data.user))
      }
      return result
    }
    return supabase.auth.signInWithPassword({ email, password })
  },

  signOut: async () => {
    if (useMockAuth || !supabase) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock-logged-in')
        localStorage.removeItem('mock-user')
      }
      return mockAuth.signOut()
    }
    return supabase.auth.signOut()
  },

  getUser: async () => {
    if (useMockAuth || !supabase) {
      if (typeof window !== 'undefined') {
        const isLoggedIn = localStorage.getItem('mock-logged-in') === 'true'
        const userData = localStorage.getItem('mock-user')
        const user = userData ? JSON.parse(userData) : null
        return { data: { user: isLoggedIn ? user : null }, error: null }
      }
      return { data: { user: null }, error: null }
    }
    return supabase.auth.getUser()
  }
}

export default supabase