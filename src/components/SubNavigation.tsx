'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SubNavItem {
  name: string
  href: string
  icon?: string
}

interface SubNavigationProps {
  items: SubNavItem[]
  title?: string
}

export default function SubNavigation({ items, title }: SubNavigationProps) {
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          {title && (
            <h2 className="text-sm font-medium text-gray-600 mb-2">{title}</h2>
          )}
          <nav className="flex space-x-6">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'text-primary-600 bg-white border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white border-transparent hover:border-gray-200'
                } inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

// 각 섹션별 서브 네비게이션 데이터
export const subNavigationMap: { [key: string]: SubNavItem[] } = {
  '/dashboard/sermons': [
    { name: '목록 보기', href: '/dashboard/sermons' },
    { name: '새 설교 추가', href: '/dashboard/sermons/new' },
  ],
  '/dashboard/members': [
    { name: '교인 목록', href: '/dashboard/members' },
    { name: '새 교인 등록', href: '/dashboard/members/new' },
    { name: '엑셀 업로드', href: '/dashboard/members/import' },
  ],
  '/dashboard/messages': [
    { name: '발송 대시보드', href: '/dashboard/messages/dashboard' },
    { name: '템플릿 관리', href: '/dashboard/messages/templates' },
  ],
  '/dashboard/visits': [
    { name: '심방 기록', href: '/dashboard/visits' },
    { name: '새 심방 등록', href: '/dashboard/visits/new' },
  ],
  '/dashboard/prayers': [
    { name: '기도제목 목록', href: '/dashboard/prayers' },
    { name: '새 기도제목', href: '/dashboard/prayers/new' },
  ],
  '/dashboard/reports': [
    { name: '통계 리포트', href: '/dashboard/reports' },
    { name: '출석 현황', href: '/dashboard/reports/attendance' },
    { name: '메시지 현황', href: '/dashboard/reports/messages' },
  ],
}

// 현재 경로에 맞는 서브 네비게이션을 가져오는 함수
export function getSubNavigation(pathname: string): SubNavItem[] {
  // 정확한 매치를 먼저 찾기
  if (subNavigationMap[pathname]) {
    return subNavigationMap[pathname]
  }
  
  // 부분 매치 찾기 (예: /sermons/new -> /sermons)
  for (const [path, items] of Object.entries(subNavigationMap)) {
    if (pathname.startsWith(path + '/') || pathname === path) {
      return items
    }
  }
  
  return []
}