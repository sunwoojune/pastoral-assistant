// 카카오톡 비즈니스 API 타입 정의

export interface KakaoApiConfig {
  api_key: string
  sender_key: string // 발신 프로필 키
  base_url: string
  timeout: number
}

// 알림톡 템플릿 정보
export interface AlimtalkTemplate {
  template_code: string
  template_name: string
  template_content: string
  template_title?: string
  template_subtitle?: string
  template_extra?: string
  template_ad?: string
  template_emphasis_title?: string
  button_name?: string
  button_url?: string
  security_flag: boolean
  category_code: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'BLOCKED'
}

// 알림톡 버튼
export interface AlimtalkButton {
  name: string
  type: 'WL' | 'AL' | 'DS' | 'BK' | 'MD' | 'AC' // Web Link, App Link, Delivery Search, Bot Keyword, Message Delivery, Add Channel
  url_mobile?: string
  url_pc?: string
  scheme_android?: string
  scheme_ios?: string
}

// 알림톡 발송 요청
export interface AlimtalkSendRequest {
  template_code: string
  to: string // 수신자 전화번호
  from?: string // 발신자 전화번호 (선택)
  content: {
    [key: string]: string // 템플릿 변수들
  }
  buttons?: AlimtalkButton[]
  supplement?: {
    // 대체 발송 (SMS/LMS)
    text?: string
    from?: string
  }
  // 예약 발송
  datetime?: string // YYYY-MM-DD HH:MM:SS
  // 개인정보 동의
  personal_custom?: string
}

// 알림톡 발송 응답
export interface AlimtalkSendResponse {
  code: string
  message: string
  data?: {
    mid: number // 메시지 고유 ID
    type: 'ALIMTALK'
    country: 'KR'
    subject: string
    content: string
    to: string
    from: string
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
    dateCreated: string
    dateUpdated: string
    prepaid: boolean
    account: string
  }
  errorMessage?: string
}

// 메시지 상태 조회 응답
export interface MessageStatusResponse {
  code: string
  message: string
  data?: {
    mid: number
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
    resultCode: string
    resultMessage: string
    sentTime?: string
    deliveredTime?: string
    readTime?: string
  }[]
}

// 발송 통계
export interface SendStatistics {
  date: string
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
  total_cost: number // 원 단위
  templates: {
    [template_code: string]: {
      sent: number
      delivered: number
      read: number
      failed: number
      cost: number
    }
  }
}

// 우리 시스템의 메시지 큐 항목
export interface MessageQueueItem {
  id: string
  type: 'ALIMTALK' | 'SMS' | 'LMS'
  template_code?: string
  recipient_phone: string
  content: string
  template_variables?: Record<string, string>
  buttons?: AlimtalkButton[]
  scheduled_time: string
  priority: 'HIGH' | 'NORMAL' | 'LOW'
  retry_count: number
  max_retries: number
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED'
  sermon_id?: string
  member_id?: string
  created_at: string
  sent_at?: string
  delivered_at?: string
  error_message?: string
  cost?: number
}