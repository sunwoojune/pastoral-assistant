'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processSermonWithAI } from '@/lib/openai'
import { SermonContent } from '@/types/ministry-content'
import { MessageQueueItem } from '@/types/kakao-api'
import { sermonStorage } from '@/lib/sermon-storage'

export default function NewSermonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    scripture: '',
    date: new Date().toISOString().split('T')[0], // 오늘 날짜
    original_content: ''
  })

  const [aiResult, setAiResult] = useState<any>(null)
  const [step, setStep] = useState<'input' | 'processing' | 'review' | 'complete'>('input')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProcessWithAI = async () => {
    if (!formData.title || !formData.scripture || !formData.original_content) {
      alert('제목, 본문, 설교 내용을 모두 입력해주세요.')
      return
    }

    setProcessing(true)
    setStep('processing')

    try {
      const result = await processSermonWithAI(
        formData.title,
        formData.scripture,
        formData.original_content
      )
      
      setAiResult(result)
      setStep('review')
    } catch (error) {
      console.error('AI 처리 실패:', error)
      alert('AI 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      setStep('input')
    } finally {
      setProcessing(false)
    }
  }

  const handleSave = () => {
    // sermonStorage를 사용해서 저장
    const sermonData = {
      title: formData.title,
      scripture: formData.scripture,
      date: formData.date,
      content: formData.original_content,
      keywords: [], // AI 처리 시 키워드도 추가 가능
      occasion: '주일예배', // 기본값
      summary: aiResult?.summary || ''
    }

    // 설교 저장
    const savedSermon = sermonStorage.create(sermonData)
    console.log('✅ 설교 저장 완료:', savedSermon)

    // AI 처리된 설교는 별도 저장소에도 저장 (ministry content용)
    const ministrySermon: SermonContent = {
      id: savedSermon.id,
      ...formData,
      ...aiResult,
      is_processed: true,
      is_sent: false,
      created_at: savedSermon.created_at,
      updated_at: savedSermon.updated_at,
      user_id: savedSermon.user_id
    }

    // Ministry content 저장소에도 저장
    const existingMinistrySermons = JSON.parse(localStorage.getItem('shepherd-care-ministry-sermons') || '[]')
    const updatedMinistrySermons = [ministrySermon, ...existingMinistrySermons]
    localStorage.setItem('shepherd-care-ministry-sermons', JSON.stringify(updatedMinistrySermons))

    // 주간 메시지 자동 생성 및 예약
    try {
      const { generateWeeklyMessages, saveScheduledMessages } = require('@/lib/message-generator')
      const weeklyMessages = generateWeeklyMessages(ministrySermon)
      saveScheduledMessages(weeklyMessages)
      
      console.log(`✅ 주간 메시지 ${weeklyMessages.length}개가 예약되었습니다.`)
      interface ScheduleItem {
        type: string
        date: string
        recipients: number
      }
      
      console.log('📅 발송 예정:', weeklyMessages.map((msg: MessageQueueItem) => ({
        type: msg.template_code,
        date: new Date(msg.scheduled_time).toLocaleDateString('ko-KR'),
        recipients: weeklyMessages.filter((m: MessageQueueItem) => m.template_code === msg.template_code).length
      })).filter((item: ScheduleItem, index: number, arr: ScheduleItem[]) => 
        arr.findIndex((i: ScheduleItem) => i.type === item.type) === index
      ))
    } catch (error) {
      console.error('주간 메시지 생성 오류:', error)
    }

    setStep('complete')
    
    setTimeout(() => {
      router.push('/dashboard/sermons')
    }, 2000)
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI 처리 중...</h2>
          <p className="text-gray-600">설교 내용을 분석하여 요약, 퀴즈, 묵상을 생성하고 있습니다.</p>
          <div className="mt-4 text-sm text-gray-500">
            잠시만 기다려 주세요 (약 30초 소요)
          </div>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">완료되었습니다!</h2>
          <p className="text-gray-600">설교가 성공적으로 저장되었습니다.</p>
          <p className="text-sm text-gray-500 mt-2">곧 설교 목록 페이지로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 설교 업로드</h1>
        <p className="mt-1 text-sm text-gray-600">
          설교 내용을 입력하면 AI가 자동으로 요약, 퀴즈, 묵상을 생성합니다.
        </p>
      </div>

      {step === 'input' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설교 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="예: 하나님의 사랑"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                본문 말씀 *
              </label>
              <input
                type="text"
                name="scripture"
                value={formData.scripture}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="예: 요한복음 3:16"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설교 날짜 *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설교 내용 * 
              <span className="text-gray-500 font-normal">(전체 설교 내용을 입력해주세요)</span>
            </label>
            <textarea
              name="original_content"
              value={formData.original_content}
              onChange={handleInputChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="설교의 전체 내용을 입력해주세요. 서론, 본론, 결론을 포함하여 상세히 작성하시면 AI가 더 정확한 요약과 콘텐츠를 생성합니다.

예시:
오늘 본문 요한복음 3장 16절은...

1. 하나님의 사랑의 크기
- 세상을 사랑하신 하나님
- 조건 없는 사랑

2. 사랑의 표현 방법
- 독생자를 주심
- 믿는 자에게 영생을 주심

결론: 우리도 이웃을 사랑해야...
"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/sermons')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              취소
            </button>
            <button
              onClick={handleProcessWithAI}
              disabled={processing}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200"
            >
              AI 처리 시작
            </button>
          </div>
        </div>
      )}

      {step === 'review' && aiResult && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 AI 처리 완료!</h3>
            <p className="text-green-700">설교 요약, 퀴즈, 묵상이 자동으로 생성되었습니다. 내용을 검토하고 저장하세요.</p>
          </div>

          {/* 요약 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 설교 요약</h3>
            <p className="text-gray-700 leading-relaxed">{aiResult.summary}</p>
          </div>

          {/* 퀴즈 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">❓ 설교 이해 퀴즈</h3>
            {aiResult.quiz.map((q: any, index: number) => (
              <div key={q.id} className="mb-6 last:mb-0">
                <h4 className="font-medium text-gray-900 mb-3">{index + 1}. {q.question}</h4>
                <div className="space-y-2 ml-4">
                  {q.options.map((option: string, optIndex: number) => (
                    <div
                      key={optIndex}
                      className={`flex items-center ${
                        optIndex === q.correct_answer 
                          ? 'text-green-700 font-medium' 
                          : 'text-gray-600'
                      }`}
                    >
                      <span className="mr-2">{optIndex + 1})</span>
                      <span>{option}</span>
                      {optIndex === q.correct_answer && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 ml-4 text-sm text-gray-600">
                  <strong>정답 해설:</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>

          {/* 묵상 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🙏 적용 묵상</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiResult.meditation}
            </div>
          </div>

          {/* 실천과제 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 이번 주 실천과제</h3>
            <ul className="space-y-2">
              {aiResult.practical_tasks.map((task: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span className="text-gray-700">{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setStep('input')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              수정하기
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}