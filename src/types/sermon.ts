export interface Sermon {
  id: string
  title: string
  scripture: string // 본문 말씀 (예: "요한복음 3:16")
  date: string // 설교 날짜 (YYYY-MM-DD)
  content: string // 설교 내용
  summary?: string // AI 요약 (선택사항)
  keywords?: string[] // 키워드 태그
  occasion?: string // 예배 종류 (주일예배, 수요예배, 특별예배 등)
  created_at: string
  updated_at: string
  user_id: string
}

export interface SermonFormData {
  title: string
  scripture: string
  date: string
  content: string
  keywords?: string[]
  occasion?: string
}

export type SermonOccasion = 
  | '주일예배' 
  | '수요예배' 
  | '금요기도회' 
  | '새벽기도회' 
  | '특별예배' 
  | '기타'