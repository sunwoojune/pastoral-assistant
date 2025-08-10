import { SermonContent } from '@/types/ministry-content'
import { MessageTemplate, MESSAGE_TEMPLATES, MessageContent, ButtonTemplate } from '@/types/message-template'
import { messageQueue } from '@/lib/kakao-api'
import { MessageQueueItem } from '@/types/kakao-api'

// 메시지 생성 설정
const MESSAGE_CONFIG = {
  church_name: '은혜교회',
  pastor_phone: '010-1234-5678',
  domain: 'https://your-domain.com' // 실제 배포 시 변경 필요
}

// 템플릿 변수 치환 함수
const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

// 설교 내용을 바탕으로 각 요일별 메시지 생성
export const generateWeeklyMessages = (sermon: SermonContent): MessageContent[] => {
  const messages: MessageContent[] = []
  
  // 기본 변수들
  const baseVariables = {
    church_name: MESSAGE_CONFIG.church_name,
    pastor_phone: MESSAGE_CONFIG.pastor_phone,
    domain: MESSAGE_CONFIG.domain,
    sermon_id: sermon.id,
    sermon_title: sermon.title,
    scripture: sermon.scripture,
    summary: sermon.summary
  }

  // 설교 날짜 기준으로 발송 날짜 계산
  const sermonDate = new Date(sermon.date)
  
  MESSAGE_TEMPLATES.forEach(template => {
    // 발송 날짜 계산
    const sendDate = new Date(sermonDate)
    const daysToAdd = template.schedule.day_of_week - sermonDate.getDay()
    sendDate.setDate(sermonDate.getDate() + (daysToAdd > 0 ? daysToAdd : daysToAdd + 7))
    sendDate.setHours(template.schedule.hour, template.schedule.minute, 0, 0)

    // 각 템플릿별 특화 변수
    let specificVariables: any = { ...baseVariables }
    
    switch (template.type) {
      case 'monday':
        // 월요일: 요약 중심
        break
        
      case 'wednesday':
        // 수요일: 묵상 질문 추출
        const meditationLines = sermon.meditation.split('\n')
        const questions = meditationLines
          .filter(line => line.includes('?') || line.includes('묵상'))
          .slice(0, 2)
          .map((q, i) => `${i + 1}. ${q.trim()}`)
          .join('\n')
        
        specificVariables.meditation_questions = questions || '오늘 받은 은혜를 돌아보며 하나님께 감사드리세요.'
        break
        
      case 'friday':
        // 금요일: 실천과제 체크리스트
        const tasks = sermon.practical_tasks
          .slice(0, 3)
          .map((task, i) => `${i + 1}. ${task}`)
          .join('\n')
        
        specificVariables.practical_tasks = tasks
        break
    }

    // 메시지 내용 생성
    const content = replaceTemplateVariables(template.content_template, specificVariables)
    
    // 버튼 URL 변수 치환
    const buttons: ButtonTemplate[] = template.button_template?.map(btn => ({
      ...btn,
      url: btn.url ? replaceTemplateVariables(btn.url, specificVariables) : btn.url
    })) || []

    // 실제 교인 목록에서 메시지 수신자 조회
    let recipients: string[] = []
    
    try {
      const { memberStorage } = require('@/lib/member-storage')
      
      // 메시지 타입별 수신자 조회
      let messageType: keyof any['message_settings']
      
      switch (template.type) {
        case 'monday':
          messageType = 'receive_sermon_summary'
          break
        case 'wednesday': 
          messageType = 'receive_meditation'
          break
        case 'friday':
          messageType = 'receive_practice_check'
          break
        default:
          messageType = 'receive_sermon_summary'
      }
      
      const activeRecipients = memberStorage.getMessageRecipients(messageType)
      recipients = activeRecipients.map((member: any) => member.phone)
      
      console.log(`📱 ${template.type} 메시지 수신자: ${recipients.length}명`)
    } catch (error) {
      console.warn('교인 목록 조회 실패, 더미 데이터 사용:', error)
      // fallback: 더미 연락처
      recipients = ['010-1111-2222', '010-3333-4444', '010-5555-6666']
    }

    // 각 교인별로 메시지 생성
    recipients.forEach(phone => {
      messages.push({
        template_id: template.id,
        sermon_id: sermon.id,
        recipient_phone: phone,
        content: content,
        buttons: buttons,
        scheduled_time: sendDate.toISOString(),
        status: 'pending'
      })
    })
  })

  return messages
}

// 특정 날짜의 발송 예정 메시지 조회
export const getScheduledMessages = (date: Date): MessageContent[] => {
  // localStorage에서 예약된 메시지 조회
  const storedMessages = localStorage.getItem('shepherd-care-scheduled-messages')
  if (!storedMessages) return []

  const messages: MessageContent[] = JSON.parse(storedMessages)
  const targetDate = date.toDateString()

  return messages.filter(msg => {
    const msgDate = new Date(msg.scheduled_time).toDateString()
    return msgDate === targetDate && msg.status === 'pending'
  })
}

// 메시지 예약 저장
export const saveScheduledMessages = (messages: MessageContent[]): void => {
  const existing = localStorage.getItem('shepherd-care-scheduled-messages')
  const existingMessages: MessageContent[] = existing ? JSON.parse(existing) : []
  
  const allMessages = [...existingMessages, ...messages]
  localStorage.setItem('shepherd-care-scheduled-messages', JSON.stringify(allMessages))

  // 새로운 카카오톡 API 큐에도 추가
  messages.forEach(message => {
    // 템플릿 코드 매핑
    const templateCodeMap: Record<string, string> = {
      'monday_summary': 'SERMON_SUMMARY_001',
      'wednesday_meditation': 'MEDITATION_002', 
      'friday_practice': 'PRACTICE_CHECK_003'
    }

    const templateCode = templateCodeMap[message.template_id]
    if (templateCode) {
      const queueItem: Omit<MessageQueueItem, 'id' | 'created_at' | 'status' | 'retry_count'> = {
        type: 'ALIMTALK',
        template_code: templateCode,
        recipient_phone: message.recipient_phone,
        content: message.content,
        template_variables: extractVariables(message.content, templateCode),
        buttons: message.buttons?.map(btn => ({
          text: btn.text,
          type: btn.type,
          url: btn.url
        })),
        scheduled_time: message.scheduled_time,
        priority: 'NORMAL',
        max_retries: 3,
        sermon_id: message.sermon_id,
        member_id: extractMemberIdFromPhone(message.recipient_phone)
      }

      messageQueue.enqueue(queueItem)
    }
  })
}

// 메시지 상태 업데이트
export const updateMessageStatus = (messageId: string, status: MessageContent['status']): void => {
  const stored = localStorage.getItem('shepherd-care-scheduled-messages')
  if (!stored) return

  const messages: MessageContent[] = JSON.parse(stored)
  const messageIndex = messages.findIndex(msg => 
    `${msg.sermon_id}-${msg.template_id}-${msg.recipient_phone}` === messageId
  )

  if (messageIndex !== -1) {
    messages[messageIndex].status = status
    localStorage.setItem('shepherd-care-scheduled-messages', JSON.stringify(messages))
  }
}

// 템플릿 변수 추출 (메시지 내용에서 변수 추출)
function extractVariables(content: string, templateCode: string): Record<string, string> {
  // 실제로는 더 정교한 파싱이 필요하지만, 간단한 구현
  const variables: Record<string, string> = {}
  
  // 교회명 추출
  if (content.includes('은혜교회')) {
    variables.church_name = '은혜교회'
  }
  
  // 더 많은 변수 추출 로직을 여기에 추가...
  
  return variables
}

// 전화번호로 교인 ID 찾기
function extractMemberIdFromPhone(phone: string): string | undefined {
  try {
    const { memberStorage } = require('@/lib/member-storage')
    const members = memberStorage.getAll()
    const member = members.find((m: any) => m.phone === phone)
    return member?.id
  } catch (error) {
    return undefined
  }
}