import { 
  KakaoApiConfig, 
  AlimtalkSendRequest, 
  AlimtalkSendResponse,
  MessageStatusResponse,
  AlimtalkTemplate,
  MessageQueueItem
} from '@/types/kakao-api'

// 카카오톡 비즈니스 API 설정
const KAKAO_CONFIG: KakaoApiConfig = {
  api_key: process.env.NEXT_PUBLIC_KAKAO_API_KEY || '',
  sender_key: process.env.NEXT_PUBLIC_KAKAO_SENDER_KEY || '',
  base_url: 'https://api.solapi.com/messages/v4', // Solapi 예시 (실제 사용하는 서비스에 따라 변경)
  timeout: 30000
}

// Mock 템플릿 데이터 (실제로는 카카오톡 비즈니스에서 승인받은 템플릿)
const MOCK_TEMPLATES: AlimtalkTemplate[] = [
  {
    template_code: 'SERMON_SUMMARY_001',
    template_name: '설교 요약 알림',
    template_content: `안녕하세요! {{church_name}} 교인 여러분 🙏

이번 주일 "{{sermon_title}}" 설교의 핵심 내용을 전해드립니다.

📖 본문: {{scripture}}

🔥 핵심 메시지:
{{summary}}

💡 오늘 하루를 시작하며, 이 말씀을 마음에 새기시길 바랍니다.`,
    template_title: '📖 이번 주 설교 요약',
    security_flag: false,
    category_code: 'RELIGION',
    status: 'APPROVED'
  },
  {
    template_code: 'MEDITATION_002',
    template_name: '수요일 묵상',
    template_content: `{{church_name}} 교인 여러분, 수요일입니다 ✨

일요일 "{{sermon_title}}" 말씀이 이번 주 어떻게 적용되고 계신가요?

🤔 묵상 질문:
{{meditation_questions}}

🙏 오늘 잠시 시간을 내어 하나님과 깊은 대화를 나누시길 바랍니다.`,
    template_title: '🙏 수요일 묵상',
    security_flag: false,
    category_code: 'RELIGION',
    status: 'APPROVED'
  },
  {
    template_code: 'PRACTICE_CHECK_003',
    template_name: '금요일 실천 점검',
    template_content: `{{church_name}} 교인 여러분, 한 주간 수고 많으셨습니다 👏

"{{sermon_title}}" 말씀으로 시작한 이번 주가 어떠셨나요?

✅ 실천 점검:
{{practical_tasks}}

🌟 작은 실천이라도 괜찮습니다. 하나님께서 여러분의 마음을 아시고 기뻐하실 것입니다.

🙏 주일에 뵙겠습니다!`,
    template_title: '💪 금요일 실천 점검',
    security_flag: false,
    category_code: 'RELIGION',
    status: 'APPROVED'
  }
]

// Mock API 클라이언트 (실제 API 연동 전까지 사용)
class MockKakaoApiClient {
  private config: KakaoApiConfig

  constructor(config: KakaoApiConfig) {
    this.config = config
  }

  // 알림톡 발송
  async sendAlimtalk(request: AlimtalkSendRequest): Promise<AlimtalkSendResponse> {
    // 실제 API 호출 시뮬레이션 (2-3초 지연)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

    // Mock 응답
    const success = Math.random() > 0.1 // 90% 성공률

    if (success) {
      return {
        code: '2000',
        message: 'Success',
        data: {
          mid: Math.floor(Math.random() * 1000000),
          type: 'ALIMTALK',
          country: 'KR',
          subject: request.template_code,
          content: Object.entries(request.content).reduce((content, [key, value]) => {
            return content.replace(new RegExp(`{{${key}}}`, 'g'), value)
          }, MOCK_TEMPLATES.find(t => t.template_code === request.template_code)?.template_content || ''),
          to: request.to,
          from: request.from || this.config.sender_key,
          status: 'SENT',
          dateCreated: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
          prepaid: true,
          account: 'shepherd-care'
        }
      }
    } else {
      return {
        code: '4000',
        message: 'Bad Request',
        errorMessage: '발송 실패: 수신자 번호가 유효하지 않습니다.'
      }
    }
  }

  // 메시지 상태 조회
  async getMessageStatus(messageIds: number[]): Promise<MessageStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const data = messageIds.map(mid => {
      const statuses = ['SENT', 'DELIVERED', 'READ', 'FAILED']
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any

      return {
        mid,
        status,
        resultCode: status === 'FAILED' ? '4001' : '2000',
        resultMessage: status === 'FAILED' ? '발송 실패' : '성공',
        sentTime: status !== 'FAILED' ? new Date().toISOString() : undefined,
        deliveredTime: ['DELIVERED', 'READ'].includes(status) ? new Date().toISOString() : undefined,
        readTime: status === 'READ' ? new Date().toISOString() : undefined
      }
    })

    return {
      code: '2000',
      message: 'Success',
      data
    }
  }

  // 잔액 조회 (Mock)
  async getBalance(): Promise<{ balance: number; currency: string }> {
    return {
      balance: 50000, // 5만원
      currency: 'KRW'
    }
  }
}

// 실제 API 클라이언트 (구현 예시)
class RealKakaoApiClient {
  private config: KakaoApiConfig
  private baseUrl: string

  constructor(config: KakaoApiConfig) {
    this.config = config
    this.baseUrl = config.base_url
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `HMAC-SHA256 apiKey=${this.config.api_key}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    })

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async sendAlimtalk(request: AlimtalkSendRequest): Promise<AlimtalkSendResponse> {
    const payload = {
      message: {
        to: request.to,
        from: request.from || this.config.sender_key,
        kakaoOptions: {
          pfId: this.config.sender_key,
          templateId: request.template_code,
          variables: request.content,
          buttons: request.buttons
        }
      }
    }

    return this.makeRequest('/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async getMessageStatus(messageIds: number[]): Promise<MessageStatusResponse> {
    const query = messageIds.map(id => `messageIds=${id}`).join('&')
    return this.makeRequest(`/status?${query}`)
  }
}

// API 클라이언트 팩토리
export function createKakaoApiClient(): MockKakaoApiClient | RealKakaoApiClient {
  const useMock = !KAKAO_CONFIG.api_key || KAKAO_CONFIG.api_key === ''
  
  if (useMock) {
    console.log('🔧 Mock 카카오톡 API 클라이언트 사용')
    return new MockKakaoApiClient(KAKAO_CONFIG)
  } else {
    console.log('🚀 실제 카카오톡 API 클라이언트 사용')
    return new RealKakaoApiClient(KAKAO_CONFIG)
  }
}

// 메시지 큐 관리
export const messageQueue = {
  // 큐에 메시지 추가
  enqueue: (item: Omit<MessageQueueItem, 'id' | 'created_at' | 'status' | 'retry_count'>): MessageQueueItem => {
    const queueItem: MessageQueueItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      status: 'PENDING',
      retry_count: 0,
      max_retries: 3,
      ...item
    }

    // localStorage에 저장
    const existing = localStorage.getItem('shepherd-care-message-queue')
    const queue: MessageQueueItem[] = existing ? JSON.parse(existing) : []
    queue.push(queueItem)
    localStorage.setItem('shepherd-care-message-queue', JSON.stringify(queue))

    return queueItem
  },

  // 대기 중인 메시지 조회
  getPendingMessages: (): MessageQueueItem[] => {
    const stored = localStorage.getItem('shepherd-care-message-queue')
    if (!stored) return []

    const queue: MessageQueueItem[] = JSON.parse(stored)
    const now = new Date()
    
    return queue.filter(item => 
      item.status === 'PENDING' && 
      new Date(item.scheduled_time) <= now &&
      item.retry_count < item.max_retries
    ).sort((a, b) => {
      // 우선순위별 정렬
      const priorityOrder = { HIGH: 0, NORMAL: 1, LOW: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  },

  // 메시지 상태 업데이트
  updateStatus: (messageId: string, status: MessageQueueItem['status'], error?: string) => {
    const stored = localStorage.getItem('shepherd-care-message-queue')
    if (!stored) return

    const queue: MessageQueueItem[] = JSON.parse(stored)
    const index = queue.findIndex(item => item.id === messageId)
    
    if (index !== -1) {
      queue[index].status = status
      if (error) queue[index].error_message = error
      if (status === 'SENT') queue[index].sent_at = new Date().toISOString()
      if (status === 'DELIVERED') queue[index].delivered_at = new Date().toISOString()
      
      localStorage.setItem('shepherd-care-message-queue', JSON.stringify(queue))
    }
  },

  // 재시도 횟수 증가
  incrementRetry: (messageId: string) => {
    const stored = localStorage.getItem('shepherd-care-message-queue')
    if (!stored) return

    const queue: MessageQueueItem[] = JSON.parse(stored)
    const index = queue.findIndex(item => item.id === messageId)
    
    if (index !== -1) {
      queue[index].retry_count += 1
      localStorage.setItem('shepherd-care-message-queue', JSON.stringify(queue))
    }
  }
}

// 템플릿 조회
export function getTemplate(templateCode: string): AlimtalkTemplate | undefined {
  return MOCK_TEMPLATES.find(t => t.template_code === templateCode)
}

// 전체 템플릿 목록
export function getAllTemplates(): AlimtalkTemplate[] {
  return MOCK_TEMPLATES
}