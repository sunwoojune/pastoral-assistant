'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MemberFormData, Department, Position } from '@/types/member'
import { memberStorage, groupStorage } from '@/lib/member-storage'

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    email: '',
    birth_date: '',
    department: undefined,
    position: undefined,
    address: '',
    groups: [],
    message_settings: {
      receive_sermon_summary: true,
      receive_meditation: true,
      receive_practice_check: true,
      receive_announcements: true
    }
  })

  const [availableGroups] = useState(() => groupStorage.getAll())

  const departments: Department[] = [
    '유아부', '유치부', '유년부', '초등부', 
    '중등부', '고등부', '청년부', 
    '장년부', '중년부', '시니어부'
  ]

  const positions: Position[] = [
    '목사', '전도사', '강도사', '전도인',
    '장로', '권사', '집사', '안수집사',
    '교사', '성가대', '반주자', '교인'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      
      if (name.startsWith('message_settings.')) {
        const setting = name.split('.')[1] as keyof MemberFormData['message_settings']
        setFormData(prev => ({
          ...prev,
          message_settings: {
            ...prev.message_settings,
            [setting]: checked
          }
        }))
      } else if (name === 'groups') {
        const groupId = value
        setFormData(prev => ({
          ...prev,
          groups: checked 
            ? [...prev.groups, groupId]
            : prev.groups.filter(id => id !== groupId)
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value || undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      alert('이름과 전화번호는 필수 입력 항목입니다.')
      return
    }

    // 전화번호 중복 체크
    const existingMembers = memberStorage.getActive()
    const duplicatePhone = existingMembers.find(member => member.phone === formData.phone)
    if (duplicatePhone) {
      alert('이미 등록된 전화번호입니다.')
      return
    }

    setLoading(true)
    
    try {
      const newMember = memberStorage.create(formData)
      
      alert(`${newMember.name}님이 교인으로 등록되었습니다.`)
      router.push('/members')
    } catch (error) {
      console.error('교인 등록 오류:', error)
      alert('교인 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 교인 등록</h1>
        <p className="mt-1 text-sm text-gray-600">
          새로운 교인의 기본 정보를 입력하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성명 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="홍길동"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="서울시 강남구 테헤란로 123"
            />
          </div>
        </div>

        {/* 교회 정보 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">교회 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소속 부서
              </label>
              <select
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">부서 선택</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직분
              </label>
              <select
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">직분 선택</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 그룹 참여 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">그룹 참여</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableGroups.map(group => (
              <label key={group.id} className="flex items-center">
                <input
                  type="checkbox"
                  name="groups"
                  value={group.id}
                  checked={formData.groups.includes(group.id)}
                  onChange={handleInputChange}
                  className="mr-2 text-primary-600"
                />
                <span className="text-sm text-gray-700">{group.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 메시지 수신 설정 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">메시지 수신 설정</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="message_settings.receive_sermon_summary"
                checked={formData.message_settings.receive_sermon_summary}
                onChange={handleInputChange}
                className="mr-3 text-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">설교 요약 받기</span>
                <p className="text-xs text-gray-500">매주 월요일 오전 9시에 설교 요약과 퀴즈를 받습니다.</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="message_settings.receive_meditation"
                checked={formData.message_settings.receive_meditation}
                onChange={handleInputChange}
                className="mr-3 text-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">묵상 메시지 받기</span>
                <p className="text-xs text-gray-500">매주 수요일 오전 9시에 묵상 질문을 받습니다.</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="message_settings.receive_practice_check"
                checked={formData.message_settings.receive_practice_check}
                onChange={handleInputChange}
                className="mr-3 text-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">실천 점검 받기</span>
                <p className="text-xs text-gray-500">매주 금요일 오전 9시에 실천 점검 메시지를 받습니다.</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="message_settings.receive_announcements"
                checked={formData.message_settings.receive_announcements}
                onChange={handleInputChange}
                className="mr-3 text-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">교회 공지사항 받기</span>
                <p className="text-xs text-gray-500">중요한 교회 공지사항을 받습니다.</p>
              </div>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/members')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? '등록 중...' : '교인 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}