'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleAuthSuccess = () => {
    router.push('/dashboard')
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로그인 중...</p>
        </div>
      </div>
    )
  }

  return <AuthForm onAuthSuccess={handleAuthSuccess} />
}