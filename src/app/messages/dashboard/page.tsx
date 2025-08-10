'use client'

import { useState, useEffect } from 'react'
import { MessageQueueItem } from '@/types/kakao-api'
import { getMessageScheduler, getSenderService } from '@/lib/message-sender'
import { getAllTemplates } from '@/lib/kakao-api'

export default function MessageDashboardPage() {
  const [queueMessages, setQueueMessages] = useState<MessageQueueItem[]>([])
  const [schedulerRunning, setSchedulerRunning] = useState(false)
  const [sendingStats, setSendingStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const [testPhone, setTestPhone] = useState('')

  const scheduler = getMessageScheduler()
  const sender = getSenderService()
  const templates = getAllTemplates()

  useEffect(() => {
    loadDashboardData()
    
    // 5초마다 데이터 갱신
    const interval = setInterval(loadDashboardData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = () => {
    try {
      // 메시지 큐 조회
      const stored = localStorage.getItem('shepherd-care-message-queue')
      if (stored) {
        const queue: MessageQueueItem[] = JSON.parse(stored)
        setQueueMessages(queue.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      }

      // 스케줄러 상태
      setSchedulerRunning(scheduler.isSchedulerRunning())

      // 발송 통계
      const stats = sender.getSendingStats(7)
      setSendingStats(stats)

    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleScheduler = () => {
    if (schedulerRunning) {
      scheduler.stop()
      setSchedulerRunning(false)
    } else {
      scheduler.start()
      setSchedulerRunning(true)
    }
  }

  const handleProcessNow = async () => {
    setLoading(true)
    try {
      await sender.processPendingMessages()
      loadDashboardData()
    } catch (error) {
      alert('메시지 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestMessage = async () => {
    if (!testPhone || testPhone.length < 10) {
      alert('올바른 전화번호를 입력해주세요.')
      return
    }

    try {
      await sender.sendTestMessage(testPhone, 'SERMON_SUMMARY_001', {
        church_name: '은혜교회',
        sermon_title: '테스트 설교',
        scripture: '요한복음 3:16',
        summary: '하나님의 사랑에 대한 테스트 메시지입니다.'
      })
      
      alert('테스트 메시지가 발송되었습니다!')
      setTestPhone('')
      loadDashboardData()
    } catch (error) {
      alert('테스트 메시지 발송에 실패했습니다.')
    }
  }

  // 통계 계산
  const totalStats = Object.values(sendingStats).reduce((total: any, dayStats: any) => ({
    sent: (total.sent || 0) + (dayStats.total_sent || 0),
    delivered: (total.delivered || 0) + (dayStats.total_delivered || 0),
    read: (total.read || 0) + (dayStats.total_read || 0),
    failed: (total.failed || 0) + (dayStats.total_failed || 0),
    cost: (total.cost || 0) + (dayStats.total_cost || 0)
  }), {})

  const getStatusColor = (status: MessageQueueItem['status']) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800', 
      'SENT': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'READ': 'bg-purple-100 text-purple-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    }
    return colors[status]
  }

  const getStatusText = (status: MessageQueueItem['status']) => {
    const texts = {
      'PENDING': '대기중',
      'PROCESSING': '처리중',
      'SENT': '발송됨',
      'DELIVERED': '전달됨',
      'READ': '읽음',
      'FAILED': '실패',
      'CANCELLED': '취소됨'
    }
    return texts[status]
  }

  if (loading && queueMessages.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">메시지 발송 대시보드</h1>
          <p className="mt-1 text-sm text-gray-600">
            카카오톡 메시지 발송 현황을 실시간으로 모니터링하세요.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            schedulerRunning 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${schedulerRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>스케줄러 {schedulerRunning ? '실행중' : '중지됨'}</span>
          </div>
          
          <button
            onClick={handleToggleScheduler}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              schedulerRunning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {schedulerRunning ? '스케줄러 중지' : '스케줄러 시작'}
          </button>
        </div>
      </div>

      {/* 제어 패널 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">제어 패널</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">수동 처리</h3>
            <button
              onClick={handleProcessNow}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? '처리중...' : '대기 메시지 즉시 처리'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              예약 시간이 된 모든 대기 메시지를 즉시 처리합니다.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">테스트 발송</h3>
            <div className="flex space-x-2">
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendTestMessage}
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors duration-200"
              >
                테스트 발송
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              설교 요약 샘플 메시지를 테스트로 발송합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 발송 통계 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">발송</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.sent || 0}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">전달</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.delivered || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">읽음</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.read || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">실패</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.failed || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">비용</dt>
                  <dd className="text-lg font-medium text-gray-900">₩{totalStats.cost?.toLocaleString() || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 큐 현황 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            메시지 큐 현황 ({queueMessages.length}개)
          </h2>
          
          {queueMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              처리할 메시지가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메시지 ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수신자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      템플릿
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      재시도
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queueMessages.slice(0, 20).map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {message.id.split('-').pop()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.recipient_phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {templates.find(t => t.template_code === message.template_code)?.template_name || message.template_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.scheduled_time).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {getStatusText(message.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {message.retry_count}/{message.max_retries}
                        {message.error_message && (
                          <div className="text-red-500 text-xs mt-1" title={message.error_message}>
                            오류: {message.error_message.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mock 모드 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 개발 모드 (Mock API)</h3>
        <p className="text-blue-700 text-sm mb-2">
          현재는 실제 카카오톡 발송 없이 시뮬레이션만 됩니다.
        </p>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• 90% 확률로 발송 성공 시뮬레이션</li>
          <li>• 실제 비용 발생하지 않음</li>
          <li>• 실제 API 키 설정 시 실제 발송 가능</li>
        </ul>
      </div>
    </div>
  )
}