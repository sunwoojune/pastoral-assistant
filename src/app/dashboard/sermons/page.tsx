'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sermon } from '@/types/sermon'
import { sermonStorage } from '@/lib/sermon-storage'

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadSermons()
  }, [])

  const loadSermons = () => {
    try {
      const data = sermonStorage.getAll()
      setSermons(data.sort((a, b) => b.date.localeCompare(a.date)))
    } catch (error) {
      console.error('설교 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSermons = sermons.filter(sermon =>
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sermon.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sermon.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('이 설교를 삭제하시겠습니까?')) {
      const success = sermonStorage.delete(id)
      if (success) {
        loadSermons()
      } else {
        alert('삭제에 실패했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설교 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            설교 내용을 기록하고 관리하세요.
          </p>
        </div>
        <Link
          href="/dashboard/sermons/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          새 설교 추가
        </Link>
      </div>

      {/* 검색 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="제목, 본문, 키워드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredSermons.length}개의 설교
          </div>
        </div>
      </div>

      {/* 설교 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredSermons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">설교가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 설교를 추가해보세요.</p>
            <Link
              href="/dashboard/sermons/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              설교 추가하기
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredSermons.map((sermon) => (
              <li key={sermon.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-primary-600">
                            <Link 
                              href={`/dashboard/sermons/${sermon.id}`}
                              className="hover:text-primary-700"
                            >
                              {sermon.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            📖 {sermon.scripture}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sermon.occasion || '기타'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(sermon.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {sermon.content.length > 100 
                            ? `${sermon.content.substring(0, 100)}...` 
                            : sermon.content}
                        </p>
                      </div>

                      {sermon.keywords && sermon.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sermon.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <Link
                        href={`/dashboard/sermons/${sermon.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                        title="수정"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(sermon.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}