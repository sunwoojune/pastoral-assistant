// 교인 관리 타입 정의

export interface Member {
  id: string
  name: string
  phone: string
  email?: string
  birth_date?: string // YYYY-MM-DD
  
  // 교회 정보
  baptism_date?: string
  membership_date?: string
  department?: Department
  position?: Position
  
  // 가족 정보
  family_role?: FamilyRole
  family_members?: string[] // 다른 교인 ID 참조
  
  // 연락처 및 주소
  address?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  
  // 목회 관련
  groups: string[] // 소속 그룹들 (청년부, 성가대 등)
  care_notes?: string // 돌봄 메모
  prayer_requests?: string[] // 기도 제목들
  
  // 메시지 설정
  message_settings: {
    receive_sermon_summary: boolean // 설교 요약 받기
    receive_meditation: boolean // 묵상 받기
    receive_practice_check: boolean // 실천 점검 받기
    receive_announcements: boolean // 교회 공지 받기
  }
  
  // 메타 정보
  is_active: boolean // 활성 교인 여부
  created_at: string
  updated_at: string
  created_by: string
}

export interface MemberGroup {
  id: string
  name: string
  description?: string
  type: 'department' | 'ministry' | 'small_group' | 'temporary'
  leader_id?: string
  member_ids: string[]
  created_at: string
}

export type Department = 
  | '유아부' | '유치부' | '유년부' | '초등부' 
  | '중등부' | '고등부' | '청년부' 
  | '장년부' | '중년부' | '시니어부'

export type Position = 
  | '목사' | '전도사' | '강도사' | '전도인'
  | '장로' | '권사' | '집사' | '안수집사'
  | '교사' | '성가대' | '반주자' | '교인'

export type FamilyRole = 
  | '가장' | '배우자' | '자녀' | '부모' | '형제자매' | '기타'

export interface MemberFormData {
  name: string
  phone: string
  email?: string
  birth_date?: string
  department?: Department
  position?: Position
  address?: string
  groups: string[]
  message_settings: {
    receive_sermon_summary: boolean
    receive_meditation: boolean
    receive_practice_check: boolean
    receive_announcements: boolean
  }
}