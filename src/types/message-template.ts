// 카카오톡 메시지 템플릿 정의

export interface MessageTemplate {
  id: string
  name: string
  type: 'monday' | 'wednesday' | 'friday'
  title: string
  content_template: string
  button_template?: ButtonTemplate[]
  schedule: {
    day_of_week: number // 0=Sunday, 1=Monday, ...
    hour: number
    minute: number
  }
}

export interface ButtonTemplate {
  id: string
  text: string
  type: 'web_link' | 'phone' | 'message'
  url?: string
  phone_number?: string
  message_text?: string
}

export interface MessageContent {
  template_id: string
  sermon_id: string
  recipient_phone: string
  content: string
  buttons?: ButtonTemplate[]
  scheduled_time: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
}

// 주간 발송 템플릿들
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'monday_summary',
    name: '월요일 - 설교 요약 & 퀴즈',
    type: 'monday',
    title: '📖 이번 주 설교 요약',
    content_template: `안녕하세요! {{church_name}} 교인 여러분 🙏

이번 주일 "{{sermon_title}}" 설교의 핵심 내용을 전해드립니다.

📖 본문: {{scripture}}

🔥 핵심 메시지:
{{summary}}

💡 오늘 하루를 시작하며, 이 말씀을 마음에 새기시길 바랍니다.`,
    button_template: [
      {
        id: 'quiz_btn',
        text: '📝 퀴즈 풀기',
        type: 'web_link',
        url: '{{domain}}/ministry/{{sermon_id}}?tab=quiz'
      },
      {
        id: 'full_content_btn', 
        text: '📋 전체 내용 보기',
        type: 'web_link',
        url: '{{domain}}/ministry/{{sermon_id}}'
      }
    ],
    schedule: {
      day_of_week: 1, // Monday
      hour: 9,
      minute: 0
    }
  },
  {
    id: 'wednesday_meditation',
    name: '수요일 - 적용 질문 & 묵상',
    type: 'wednesday', 
    title: '🙏 수요일 묵상',
    content_template: `{{church_name}} 교인 여러분, 수요일입니다 ✨

일요일 "{{sermon_title}}" 말씀이 이번 주 어떻게 적용되고 계신가요?

🤔 묵상 질문:
{{meditation_questions}}

🙏 오늘 잠시 시간을 내어 하나님과 깊은 대화를 나누시길 바랍니다.

"네 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라" (잠언 3:5)`,
    button_template: [
      {
        id: 'meditation_btn',
        text: '🙏 묵상 내용 보기',
        type: 'web_link', 
        url: '{{domain}}/ministry/{{sermon_id}}?tab=meditation'
      },
      {
        id: 'prayer_request_btn',
        text: '📞 기도 요청하기',
        type: 'phone',
        phone_number: '{{pastor_phone}}'
      }
    ],
    schedule: {
      day_of_week: 3, // Wednesday
      hour: 9,
      minute: 0
    }
  },
  {
    id: 'friday_practice',
    name: '금요일 - 실천과제 점검 & 격려',
    type: 'friday',
    title: '💪 금요일 실천 점검',
    content_template: `{{church_name}} 교인 여러분, 한 주간 수고 많으셨습니다 👏

"{{sermon_title}}" 말씀으로 시작한 이번 주가 어떠셨나요?

✅ 실천 점검:
{{practical_tasks}}

🌟 작은 실천이라도 괜찮습니다. 하나님께서 여러분의 마음을 아시고 기뻐하실 것입니다.

"그런즉 내 사랑하는 형제들아 견고하며 흔들리지 말고 항상 주의 일에 더욱 힘쓰는 자들이 되라" (고전 15:58)

🙏 주일에 뵙겠습니다!`,
    button_template: [
      {
        id: 'testimony_btn',
        text: '💌 은혜 나누기',
        type: 'message',
        message_text: '이번 주 말씀을 통해 받은 은혜를 나눠주세요!'
      },
      {
        id: 'sunday_preview_btn',
        text: '📅 주일 예배 안내',
        type: 'web_link',
        url: '{{domain}}/sunday-info'
      }
    ],
    schedule: {
      day_of_week: 5, // Friday
      hour: 9,
      minute: 0
    }
  }
]