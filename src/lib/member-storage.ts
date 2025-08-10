import { Member, MemberFormData, MemberGroup } from '@/types/member'

// Mock 데이터 저장소
const MEMBERS_STORAGE_KEY = 'shepherd-care-members'
const GROUPS_STORAGE_KEY = 'shepherd-care-member-groups'

// 기본 교인 그룹들
const defaultGroups: MemberGroup[] = [
  {
    id: 'youth',
    name: '청년부',
    description: '20-30대 청년들',
    type: 'department',
    member_ids: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'adult',
    name: '장년부', 
    description: '30-50대 장년들',
    type: 'department',
    member_ids: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'senior',
    name: '시니어부',
    description: '50대 이상 어르신들',
    type: 'department',
    member_ids: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'choir',
    name: '성가대',
    description: '찬양 사역팀',
    type: 'ministry',
    member_ids: [],
    created_at: new Date().toISOString()
  }
]

// 기본 Mock 교인 데이터
const mockMembers: Member[] = [
  {
    id: 'member-1',
    name: '김영희',
    phone: '010-1111-2222',
    email: 'younghee.kim@gmail.com',
    birth_date: '1985-03-15',
    baptism_date: '2010-04-11',
    membership_date: '2010-05-02',
    department: '장년부',
    position: '권사',
    family_role: '배우자',
    groups: ['adult'],
    address: '서울시 강남구 테헤란로 123',
    care_notes: '새신자 돌봄 필요',
    message_settings: {
      receive_sermon_summary: true,
      receive_meditation: true, 
      receive_practice_check: true,
      receive_announcements: true
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'current-user'
  },
  {
    id: 'member-2',
    name: '박성민',
    phone: '010-3333-4444',
    email: 'sungmin.park@naver.com',
    birth_date: '1992-07-22',
    department: '청년부',
    position: '집사',
    family_role: '가장',
    groups: ['youth', 'choir'],
    address: '서울시 서초구 반포대로 456',
    message_settings: {
      receive_sermon_summary: true,
      receive_meditation: false,
      receive_practice_check: true,
      receive_announcements: true
    },
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: 'current-user'
  },
  {
    id: 'member-3',
    name: '이순자',
    phone: '010-5555-6666',
    birth_date: '1960-11-08',
    department: '시니어부',
    position: '권사',
    groups: ['senior'],
    address: '서울시 종로구 종로 789',
    care_notes: '건강 상태 체크 필요',
    emergency_contact: {
      name: '이민수',
      phone: '010-7777-8888',
      relationship: '아들'
    },
    message_settings: {
      receive_sermon_summary: true,
      receive_meditation: true,
      receive_practice_check: false,
      receive_announcements: true
    },
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    created_by: 'current-user'
  }
]

export const memberStorage = {
  // 모든 교인 조회
  getAll: (): Member[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(MEMBERS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      } else {
        // 처음 실행 시 Mock 데이터 저장
        localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(mockMembers))
        return mockMembers
      }
    } catch (error) {
      console.error('교인 데이터 조회 오류:', error)
      return mockMembers
    }
  },

  // ID로 교인 조회
  getById: (id: string): Member | undefined => {
    const members = memberStorage.getAll()
    return members.find(member => member.id === id)
  },

  // 새 교인 추가
  create: (data: MemberFormData): Member => {
    const members = memberStorage.getAll()
    const newMember: Member = {
      id: `member-${Date.now()}`,
      ...data,
      family_members: [],
      prayer_requests: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user'
    }
    
    const updatedMembers = [newMember, ...members]
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(updatedMembers))
    
    return newMember
  },

  // 교인 수정
  update: (id: string, data: Partial<MemberFormData>): Member | null => {
    const members = memberStorage.getAll()
    const index = members.findIndex(member => member.id === id)
    
    if (index === -1) return null
    
    const updatedMember = {
      ...members[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    members[index] = updatedMember
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
    
    return updatedMember
  },

  // 교인 삭제 (비활성화)
  delete: (id: string): boolean => {
    const members = memberStorage.getAll()
    const index = members.findIndex(member => member.id === id)
    
    if (index === -1) return false
    
    // 실제 삭제 대신 비활성화
    members[index].is_active = false
    members[index].updated_at = new Date().toISOString()
    
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
    return true
  },

  // 활성 교인만 조회
  getActive: (): Member[] => {
    return memberStorage.getAll().filter(member => member.is_active)
  },

  // 그룹별 교인 조회
  getByGroup: (groupId: string): Member[] => {
    return memberStorage.getAll().filter(member => 
      member.groups.includes(groupId) && member.is_active
    )
  },

  // 메시지 수신 동의한 교인 조회
  getMessageRecipients: (messageType: keyof Member['message_settings']): Member[] => {
    return memberStorage.getAll().filter(member => 
      member.is_active && member.message_settings[messageType]
    )
  },

  // 검색
  search: (query: string): Member[] => {
    const members = memberStorage.getAll()
    const lowercaseQuery = query.toLowerCase()
    
    return members.filter(member => 
      member.is_active && (
        member.name.toLowerCase().includes(lowercaseQuery) ||
        member.phone.includes(query) ||
        member.email?.toLowerCase().includes(lowercaseQuery) ||
        member.department?.includes(query)
      )
    )
  }
}

export const groupStorage = {
  // 모든 그룹 조회
  getAll: (): MemberGroup[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(GROUPS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      } else {
        // 처음 실행 시 기본 그룹 저장
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(defaultGroups))
        return defaultGroups
      }
    } catch (error) {
      console.error('그룹 데이터 조회 오류:', error)
      return defaultGroups
    }
  },

  // 새 그룹 생성
  create: (name: string, description?: string, type: MemberGroup['type'] = 'small_group'): MemberGroup => {
    const groups = groupStorage.getAll()
    const newGroup: MemberGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      type,
      member_ids: [],
      created_at: new Date().toISOString()
    }
    
    const updatedGroups = [newGroup, ...groups]
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups))
    
    return newGroup
  }
}