'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Member } from '@/types/member'
import { memberStorage, groupStorage } from '@/lib/member-storage'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const membersData = memberStorage.getActive()
      const groupsData = groupStorage.getAll()
      
      setMembers(membersData.sort((a, b) => a.name.localeCompare(b.name)))
      setGroups(groupsData)
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.includes(searchTerm)
    
    const matchesGroup = selectedGroup === 'all' || member.groups.includes(selectedGroup)
    
    return matchesSearch && matchesGroup
  })

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`${name}님을 교인 목록에서 제거하시겠습니까?`)) {
      const success = memberStorage.delete(id)
      if (success) {
        loadData()
      } else {
        alert('삭제에 실패했습니다.')
      }
    }
  }

  // 통계 계산
  const stats = {
    total: members.length,
    departments: {
      youth: members.filter(m => m.department === '청년부').length,
      adult: members.filter(m => m.department === '장년부').length,
      senior: members.filter(m => m.department === '시니어부').length
    },
    messageRecipients: members.filter(m => 
      m.message_settings.receive_sermon_summary
    ).length
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
          <h1 className="text-2xl font-bold text-gray-900">교인 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            교인 정보와 연락처를 관리하세요.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/members/import"
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
          >
            📋 엑셀 업로드
          </Link>
          <Link
            href="/dashboard/members/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            새 교인 추가
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 교인
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}명
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
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    청년부
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.departments.youth}명
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
                <span className="text-2xl">👨‍👩‍👧</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    장년부
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.departments.adult}명
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
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    메시지 수신
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.messageRecipients}명
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="이름, 전화번호, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체 그룹</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {filteredMembers.length}명의 교인이 검색되었습니다.
        </div>
      </div>

      {/* 교인 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">교인이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 교인을 추가해보세요.</p>
            <Link
              href="/dashboard/members/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              교인 추가하기
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {member.name}
                            {member.position && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {member.position}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {member.phone}
                            {member.email && ` • ✉️ ${member.email}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {member.department && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {member.department}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {member.birth_date && new Date(member.birth_date).getFullYear()}년생
                          </span>
                        </div>
                      </div>
                      
                      {/* 그룹 및 메시지 설정 */}
                      <div className="mt-2 flex items-center space-x-4">
                        {member.groups.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {member.groups.map((groupId, index) => {
                              const group = groups.find(g => g.id === groupId)
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {group?.name || groupId}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {member.message_settings.receive_sermon_summary && (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                              메시지 수신
                            </span>
                          )}
                        </div>
                      </div>

                      {member.care_notes && (
                        <div className="mt-2">
                          <p className="text-sm text-orange-600 bg-orange-50 rounded p-2">
                            💡 {member.care_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <Link
                        href={`/dashboard/members/${member.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                        title="수정"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
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