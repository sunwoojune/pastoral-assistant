// OpenAI GPT API 연동
import { AIProcessingResult, QuizQuestion } from '@/types/ministry-content'

// 환경변수에서 API 키 확인
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

// Mock AI 처리 결과 (실제 GPT API 연동 전까지 사용)
const mockAIResult = (title: string, content: string): AIProcessingResult => {
  return {
    summary: `"${title}" 설교의 핵심은 하나님의 사랑과 우리의 실천입니다. 설교를 통해 성도들이 일상에서 믿음을 실천할 수 있는 구체적인 방법들을 제시하며, 하나님과의 관계를 더욱 깊이 있게 만들어갈 수 있도록 격려합니다.`,
    
    quiz: [
      {
        id: 'q1',
        question: `오늘 설교 "${title}"의 핵심 메시지는 무엇인가요?`,
        options: [
          '하나님의 무조건적인 사랑',
          '성도의 의무와 책임',
          '교회의 성장과 발전',
          '개인의 성공과 축복'
        ],
        correct_answer: 0,
        explanation: '오늘 설교의 핵심은 하나님의 무조건적인 사랑을 깨닫고 그 사랑을 실천하는 것입니다.'
      },
      {
        id: 'q2',
        question: '설교에서 강조한 실천 방법은?',
        options: [
          '더 많은 기도하기',
          '이웃 사랑 실천하기',
          '교회 봉사 참여하기',
          '성경 공부하기'
        ],
        correct_answer: 1,
        explanation: '하나님의 사랑을 받은 우리는 이웃을 사랑하는 것으로 그 사랑을 표현해야 합니다.'
      }
    ],
    
    meditation: `오늘 설교를 통해 하나님의 크신 사랑을 다시 한 번 깨닫게 됩니다.

🙏 **묵상 질문:**
- 내가 받은 하나님의 사랑을 구체적으로 어떻게 느끼고 있나요?
- 오늘 하루, 누구에게 하나님의 사랑을 전할 수 있을까요?

💡 **적용 기도:**
하나님, 오늘 말씀을 통해 주신 깨달음을 일상에서 실천할 수 있도록 도와주세요. 주님의 사랑을 받은 자로서 이웃을 사랑하며 살아가게 하소서.`,

    practical_tasks: [
      '오늘 가족이나 친구에게 감사 인사 전하기',
      '어려운 이웃 한 분께 작은 도움 제공하기',
      '하루 10분 이상 기도와 묵상 시간 갖기',
      '이번 주 교회 봉사활동에 참여하기'
    ]
  }
}

// 실제 GPT API 호출 함수
const callOpenAI = async (prompt: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 한국 기독교 목회 전문가입니다. 설교 내용을 분석하여 성도들을 위한 유익한 콘텐츠를 생성해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API 호출 실패:', error)
    throw error
  }
}

// 메인 AI 처리 함수
export const processSermonWithAI = async (
  title: string, 
  scripture: string, 
  content: string
): Promise<AIProcessingResult> => {
  // Mock 모드 확인
  const useMock = !OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here'
  
  if (useMock) {
    // Mock 데이터 반환 (개발용)
    console.log('Mock AI 처리 모드')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAIResult(title, content))
      }, 2000) // 2초 지연으로 실제 API 호출 시뮬레이션
    })
  }

  try {
    // 실제 GPT API 호출
    const prompt = `
설교 정보:
제목: ${title}
본문: ${scripture}
설교 내용:
${content}

위 설교를 바탕으로 다음을 생성해주세요:

1. **요약** (100-150자): 설교의 핵심 메시지
2. **퀴즈 2문제** (4지선다): 설교 이해도 확인용
3. **묵상** (200-300자): 개인적 적용을 위한 묵상 내용
4. **실천과제 4개**: 구체적이고 실행 가능한 과제들

JSON 형식으로 응답해주세요:
{
  "summary": "요약 내용",
  "quiz": [
    {
      "id": "q1",
      "question": "질문1",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correct_answer": 0,
      "explanation": "해설"
    }
  ],
  "meditation": "묵상 내용",
  "practical_tasks": ["과제1", "과제2", "과제3", "과제4"]
}
`

    const result = await callOpenAI(prompt)
    return JSON.parse(result)
  } catch (error) {
    console.error('AI 처리 실패, Mock 데이터로 대체:', error)
    return mockAIResult(title, content)
  }
}