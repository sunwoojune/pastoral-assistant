'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageContent } from '@/types/message-template'

export default function MessagesPage() {
  const [scheduledMessages, setScheduledMessages] = useState<MessageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all')

  useEffect(() => {
    loadScheduledMessages()
  }, [])

  const loadScheduledMessages = () => {
    try {
      const stored = localStorage.getItem('shepherd-care-scheduled-messages')
      if (stored) {
        const messages = JSON.parse(stored)
        setScheduledMessages(messages.sort((a: MessageContent, b: MessageContent) => 
          new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
        ))
      }
    } catch (error) {
      console.error('메시지 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = scheduledMessages.filter(msg => {
    if (filter === 'all') return true
    if (filter === 'pending') return msg.status === 'pending'
    if (filter === 'sent') return ['sent', 'delivered', 'read'].includes(msg.status)
    return true
  })

  const getTemplateDisplayName = (templateId: string) => {
    const names: Record<string, string> = {
      'monday_summary': '📖 월요일 - 설교 요약',
      'wednesday_meditation': '🙏 수요일 - 묵상',
      'friday_practice': '💪 금요일 - 실천 점검'
    }
    return names[templateId] || templateId
  }

  const getStatusColor = (status: MessageContent['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'read': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getStatusText = (status: MessageContent['status']) => {
    const texts = {
      'pending': '대기중',
      'sent': '발송됨',
      'delivered': '전달됨', 
      'read': '읽음',
      'failed': '실패'
    }
    return texts[status]
  }

  // 통계 계산
  const stats = {
    total: scheduledMessages.length,
    pending: scheduledMessages.filter(m => m.status === 'pending').length,
    sent: scheduledMessages.filter(m => ['sent', 'delivered', 'read'].includes(m.status)).length,
    thisWeek: scheduledMessages.filter(m => {
      const msgDate = new Date(m.scheduled_time)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      return msgDate >= weekStart && msgDate < weekEnd
    }).length
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
          <h1 className="text-2xl font-bold text-gray-900">메시지 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            예약된 카카오톡 메시지를 확인하고 관리하세요.
          </p>
        </div>
        <Link
          href="/messages/dashboard"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          발송 대시보드
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📧</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 메시지
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    발송 대기
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    발송 완료
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.sent}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    이번 주
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.thisWeek}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">필터:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pending' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              대기중
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'sent' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              발송완료
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">메시지가 없습니다</h3>
            <p className="text-gray-600">설교를 추가하면 자동으로 주간 메시지가 예약됩니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMessages.map((message, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {getTemplateDisplayName(message.template_id)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {getStatusText(message.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.scheduled_time).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        수신자: {message.recipient_phone}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.content.substring(0, 100)}...
                      </p>
                    </div>

                    {message.buttons && message.buttons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.buttons.map((button, bIndex) => (
                          <span
                            key={bIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {button.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 개발용 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 개발 모드 안내</h3>
        <p className="text-blue-700 text-sm mb-2">
          현재는 메시지가 자동 예약만 되고, 실제 발송은 되지 않습니다.
        </p>
        <p className="text-blue-700 text-sm">
          카카오톡 비즈니스 API 연동 후 자동 발송 기능이 활성화됩니다.
        </p>
      </div>
    </div>
  )
}