import { createKakaoApiClient, messageQueue, getTemplate } from '@/lib/kakao-api'
import { MessageQueueItem, AlimtalkSendRequest, AlimtalkButton } from '@/types/kakao-api'

// 메시지 발송 서비스
export class MessageSenderService {
  private kakaoClient = createKakaoApiClient()
  private isProcessing = false

  // 메시지 큐 처리 (스케줄러에서 호출)
  async processPendingMessages(): Promise<void> {
    if (this.isProcessing) {
      console.log('⚠️ 메시지 처리가 이미 진행 중입니다.')
      return
    }

    this.isProcessing = true

    try {
      const pendingMessages = messageQueue.getPendingMessages()
      console.log(`📤 처리할 메시지 ${pendingMessages.length}개 발견`)

      if (pendingMessages.length === 0) {
        return
      }

      // 병렬 처리 (최대 5개씩)
      const batchSize = 5
      for (let i = 0; i < pendingMessages.length; i += batchSize) {
        const batch = pendingMessages.slice(i, i + batchSize)
        await Promise.allSettled(batch.map(msg => this.sendSingleMessage(msg)))
        
        // 배치 간 잠시 대기 (API 레이트 리밋 방지)
        if (i + batchSize < pendingMessages.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log('✅ 메시지 처리 완료')
    } catch (error) {
      console.error('❌ 메시지 처리 중 오류:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // 단일 메시지 발송
  private async sendSingleMessage(message: MessageQueueItem): Promise<void> {
    console.log(`📤 메시지 발송 시도: ${message.id} → ${message.recipient_phone}`)

    try {
      // 상태를 PROCESSING으로 변경
      messageQueue.updateStatus(message.id, 'PROCESSING')

      if (message.type === 'ALIMTALK') {
        await this.sendAlimtalk(message)
      } else {
        throw new Error(`지원하지 않는 메시지 타입: ${message.type}`)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      console.error(`❌ 메시지 발송 실패 (${message.id}):`, errorMessage)

      // 재시도 횟수 증가
      messageQueue.incrementRetry(message.id)
      
      // 최대 재시도 횟수 초과 시 실패 처리
      if (message.retry_count + 1 >= message.max_retries) {
        messageQueue.updateStatus(message.id, 'FAILED', errorMessage)
        console.error(`💥 최대 재시도 초과, 발송 포기: ${message.id}`)
      } else {
        messageQueue.updateStatus(message.id, 'PENDING')
        console.log(`🔄 재시도 예약 (${message.retry_count + 1}/${message.max_retries}): ${message.id}`)
      }
    }
  }

  // 알림톡 발송
  private async sendAlimtalk(message: MessageQueueItem): Promise<void> {
    if (!message.template_code) {
      throw new Error('알림톡 템플릿 코드가 없습니다.')
    }

    const template = getTemplate(message.template_code)
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${message.template_code}`)
    }

    // 버튼 변환
    const buttons: AlimtalkButton[] = message.buttons?.map(btn => ({
      name: btn.text,
      type: 'WL', // Web Link
      url_mobile: btn.url,
      url_pc: btn.url
    })) || []

    const request: AlimtalkSendRequest = {
      template_code: message.template_code,
      to: message.recipient_phone,
      content: message.template_variables || {},
      buttons: buttons.length > 0 ? buttons : undefined
    }

    const response = await this.kakaoClient.sendAlimtalk(request)

    if (response.code === '2000' && response.data) {
      // 발송 성공
      messageQueue.updateStatus(message.id, 'SENT')
      
      // 비용 계산 (알림톡: 건당 약 8-10원)
      const cost = 9 // 평균 9원으로 가정
      this.updateMessageCost(message.id, cost)
      
      console.log(`✅ 알림톡 발송 성공: ${message.id} (MID: ${response.data.mid})`)
      
      // 발송 통계 업데이트
      this.updateSendingStats(message.template_code!, 'sent', cost)
      
    } else {
      throw new Error(response.errorMessage || `발송 실패: ${response.message}`)
    }
  }

  // 메시지 비용 업데이트
  private updateMessageCost(messageId: string, cost: number): void {
    const stored = localStorage.getItem('shepherd-care-message-queue')
    if (!stored) return

    const queue: MessageQueueItem[] = JSON.parse(stored)
    const index = queue.findIndex(item => item.id === messageId)
    
    if (index !== -1) {
      queue[index].cost = cost
      localStorage.setItem('shepherd-care-message-queue', JSON.stringify(queue))
    }
  }

  // 발송 통계 업데이트
  private updateSendingStats(templateCode: string, action: 'sent' | 'delivered' | 'read' | 'failed', cost: number = 0): void {
    const today = new Date().toISOString().split('T')[0]
    const statsKey = 'shepherd-care-sending-stats'
    
    const stored = localStorage.getItem(statsKey)
    const stats = stored ? JSON.parse(stored) : {}
    
    if (!stats[today]) {
      stats[today] = {
        total_sent: 0,
        total_delivered: 0,
        total_read: 0,
        total_failed: 0,
        total_cost: 0,
        templates: {}
      }
    }

    if (!stats[today].templates[templateCode]) {
      stats[today].templates[templateCode] = {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        cost: 0
      }
    }

    // 통계 증가
    stats[today][`total_${action}`] += 1
    stats[today].total_cost += cost
    stats[today].templates[templateCode][action] += 1
    stats[today].templates[templateCode].cost += cost

    localStorage.setItem(statsKey, JSON.stringify(stats))
  }

  // 수동 메시지 발송 (테스트용)
  async sendTestMessage(phone: string, templateCode: string, variables: Record<string, string>): Promise<void> {
    const testMessage: Omit<MessageQueueItem, 'id' | 'created_at' | 'status' | 'retry_count'> = {
      type: 'ALIMTALK',
      template_code: templateCode,
      recipient_phone: phone,
      content: Object.entries(variables).reduce((content, [key, value]) => {
        return content.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }, getTemplate(templateCode)?.template_content || ''),
      template_variables: variables,
      scheduled_time: new Date().toISOString(),
      priority: 'HIGH',
      max_retries: 1
    }

    const queuedMessage = messageQueue.enqueue(testMessage)
    await this.sendSingleMessage(queuedMessage)
  }

  // 발송 통계 조회
  getSendingStats(days: number = 7): any {
    const statsKey = 'shepherd-care-sending-stats'
    const stored = localStorage.getItem(statsKey)
    
    if (!stored) return {}

    const allStats = JSON.parse(stored)
    const result: any = {}
    
    // 최근 N일간 통계
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      
      if (allStats[dateKey]) {
        result[dateKey] = allStats[dateKey]
      }
    }

    return result
  }
}

// 메시지 스케줄러
export class MessageScheduler {
  private sender = new MessageSenderService()
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  // 스케줄러 시작 (매분마다 체크)
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ 메시지 스케줄러가 이미 실행 중입니다.')
      return
    }

    console.log('🚀 메시지 스케줄러 시작')
    this.isRunning = true

    // 즉시 한 번 실행
    this.checkAndSendMessages()

    // 1분마다 실행
    this.intervalId = setInterval(() => {
      this.checkAndSendMessages()
    }, 60 * 1000)
  }

  // 스케줄러 중지
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.isRunning = false
    console.log('⏹️ 메시지 스케줄러 중지')
  }

  // 대기 중인 메시지 확인 및 발송
  private async checkAndSendMessages(): Promise<void> {
    try {
      await this.sender.processPendingMessages()
    } catch (error) {
      console.error('❌ 스케줄러 오류:', error)
    }
  }

  // 상태 확인
  isSchedulerRunning(): boolean {
    return this.isRunning
  }
}

// 싱글톤 인스턴스
let schedulerInstance: MessageScheduler | null = null

export function getMessageScheduler(): MessageScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new MessageScheduler()
  }
  return schedulerInstance
}

export function getSenderService(): MessageSenderService {
  return new MessageSenderService()
}