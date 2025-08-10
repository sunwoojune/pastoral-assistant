import { Sermon, SermonFormData } from '@/types/sermon'

// Mock 데이터 저장소 (localStorage 기반)
const STORAGE_KEY = 'shepherd-care-sermons'

// 기본 Mock 설교 데이터
const mockSermons: Sermon[] = [
  {
    id: 'sermon-1',
    title: '사랑의 실천',
    scripture: '요한복음 3:16',
    date: '2025-01-05',
    content: '하나님이 세상을 이처럼 사랑하사...\n\n1. 하나님의 사랑의 크기\n2. 사랑의 표현 방법\n3. 우리가 해야 할 실천',
    summary: '하나님의 무조건적인 사랑을 받은 우리도 이웃을 사랑해야 한다는 메시지',
    keywords: ['사랑', '실천', '섬김'],
    occasion: '주일예배',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    user_id: 'current-user'
  },
  {
    id: 'sermon-2', 
    title: '믿음의 여정',
    scripture: '히브리서 11:1',
    date: '2025-01-03',
    content: '믿음은 바라는 것들의 실상이요...\n\n1. 믿음의 정의\n2. 믿음의 역사\n3. 믿음의 미래',
    keywords: ['믿음', '소망', '확신'],
    occasion: '수요예배',
    created_at: '2025-01-03T19:30:00Z',
    updated_at: '2025-01-03T19:30:00Z',
    user_id: 'current-user'
  },
  {
    id: 'sermon-3',
    title: '새해의 결심',
    scripture: '이사야 43:19',
    date: '2025-01-01',
    content: '보라 내가 새 일을 행하리니...\n\n1. 새로운 시작의 의미\n2. 하나님의 새로운 계획\n3. 우리의 새로운 각오',
    keywords: ['새해', '결심', '새로움'],
    occasion: '신년예배',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    user_id: 'current-user'
  }
]

export const sermonStorage = {
  // 모든 설교 조회
  getAll: (): Sermon[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      } else {
        // 처음 실행 시 Mock 데이터 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSermons))
        return mockSermons
      }
    } catch (error) {
      console.error('설교 데이터 조회 오류:', error)
      return mockSermons
    }
  },

  // ID로 설교 조회
  getById: (id: string): Sermon | undefined => {
    const sermons = sermonStorage.getAll()
    return sermons.find(sermon => sermon.id === id)
  },

  // 새 설교 추가
  create: (data: SermonFormData): Sermon => {
    const sermons = sermonStorage.getAll()
    const newSermon: Sermon = {
      id: `sermon-${Date.now()}`,
      ...data,
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'current-user'
    }
    
    const updatedSermons = [newSermon, ...sermons]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSermons))
    
    return newSermon
  },

  // 설교 수정
  update: (id: string, data: Partial<SermonFormData>): Sermon | null => {
    const sermons = sermonStorage.getAll()
    const index = sermons.findIndex(sermon => sermon.id === id)
    
    if (index === -1) return null
    
    const updatedSermon = {
      ...sermons[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    sermons[index] = updatedSermon
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sermons))
    
    return updatedSermon
  },

  // 설교 삭제
  delete: (id: string): boolean => {
    const sermons = sermonStorage.getAll()
    const filteredSermons = sermons.filter(sermon => sermon.id !== id)
    
    if (filteredSermons.length === sermons.length) {
      return false // 삭제할 항목이 없음
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSermons))
    return true
  },

  // 날짜별 설교 조회
  getByDateRange: (startDate: string, endDate: string): Sermon[] => {
    const sermons = sermonStorage.getAll()
    return sermons.filter(sermon => 
      sermon.date >= startDate && sermon.date <= endDate
    ).sort((a, b) => b.date.localeCompare(a.date))
  }
}