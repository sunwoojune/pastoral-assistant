// 목회 서비스 콘텐츠 타입 정의

export interface SermonContent {
  id: string
  title: string
  scripture: string
  date: string
  original_content: string // 원본 설교 내용
  
  // AI 생성 콘텐츠
  summary: string // 설교 요약
  quiz: QuizQuestion[] // 설교 퀴즈
  meditation: string // 적용 묵상
  practical_tasks: string[] // 실천 과제
  
  // 발송 관련
  is_processed: boolean // AI 처리 완료 여부
  is_sent: boolean // 성도들에게 발송 완료 여부
  sent_at?: string // 발송 시간
  
  created_at: string
  updated_at: string
  user_id: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[] // 4지선다
  correct_answer: number // 정답 인덱스 (0-3)
  explanation: string // 정답 해설
}

export interface SermonUploadData {
  title: string
  scripture: string
  date: string
  original_content: string
}

// AI 처리 상태
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AIProcessingResult {
  summary: string
  quiz: QuizQuestion[]
  meditation: string
  practical_tasks: string[]
}