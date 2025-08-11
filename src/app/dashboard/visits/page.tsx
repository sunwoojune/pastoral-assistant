'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VisitsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">심방 기록</h1>
          <p className="mt-1 text-sm text-gray-600">
            교인 심방 기록을 관리하세요.
          </p>
        </div>
        <Link
          href="/dashboard/visits/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          새 심방 기록
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">심방 기록이 없습니다</h3>
          <p className="text-gray-600 mb-4">첫 번째 심방 기록을 추가해보세요.</p>
          <Link
            href="/dashboard/visits/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            심방 기록 추가하기
          </Link>
        </div>
      </div>
    </div>
  )
}