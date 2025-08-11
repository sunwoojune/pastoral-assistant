'use client'

import Navbar from '@/components/Navbar'
import SubNavigation, { getSubNavigation } from '@/components/SubNavigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const subNavItems = getSubNavigation(pathname)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {subNavItems.length > 0 && (
          <SubNavigation items={subNavItems} />
        )}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}