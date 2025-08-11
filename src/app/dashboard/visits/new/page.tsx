'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewVisitPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    member_name: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: '가정심방',
    content: '',
    prayer_request: '',
    follow_up: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 심방 기록 저장 로직 구현
    console.log('심방 기록 저장:', formData)
    router.push('/dashboard/visits')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 심방 기록</h1>
        <p className="mt-1 text-sm text-gray-600">
          심방 내용을 기록해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교인 이름 *
            </label>
            <input
              type="text"
              value={formData.member_name}
              onChange={(e) => setFormData({...formData, member_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              심방 날짜 *
            </label>
            <input
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            심방 유형
          </label>
          <select
            value={formData.visit_type}
            onChange={(e) => setFormData({...formData, visit_type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="가정심방">가정심방</option>
            <option value="병원심방">병원심방</option>
            <option value="전화심방">전화심방</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            심방 내용 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="심방 중 나눈 대화나 상황을 기록해주세요."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기도제목
          </label>
          <textarea
            value={formData.prayer_request}
            onChange={(e) => setFormData({...formData, prayer_request: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="교인이 요청한 기도제목을 기록해주세요."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            후속 조치
          </label>
          <textarea
            value={formData.follow_up}
            onChange={(e) => setFormData({...formData, follow_up: e.target.value})}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="필요한 후속 조치나 계획을 기록해주세요."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/visits')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  )
}