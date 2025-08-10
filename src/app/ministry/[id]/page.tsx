'use client'

import { useState, useEffect } from 'react'
import { SermonContent } from '@/types/ministry-content'

interface Props {
  params: { id: string }
}

export default function MinistryContentPage({ params }: Props) {
  const [content, setContent] = useState<SermonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'meditation'>('summary')
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadContent()
  }, [params.id])

  const loadContent = () => {
    try {
      // localStorage에서 설교 내용 조회
      const stored = localStorage.getItem('shepherd-care-ministry-sermons')
      if (stored) {
        const sermons = JSON.parse(stored)
        const sermon = sermons.find((s: SermonContent) => s.id === params.id)
        
        if (sermon) {
          setContent(sermon)
        } else {
          // 목록이 없으면 기본 설교 목록에서 찾기
          const basicStored = localStorage.getItem('shepherd-care-sermons')
          if (basicStored) {
            const basicSermons = JSON.parse(basicStored)
            const basicSermon = basicSermons.find((s: any) => s.id === params.id)
            
            if (basicSermon) {
              // 기본 설교를 ministry content 형식으로 변환
              setContent({
                ...basicSermon,
                original_content: basicSermon.content,
                summary: basicSermon.summary || '이 설교의 요약이 준비 중입니다.',
                quiz: [],
                meditation: '이 설교를 통한 묵상 내용이 준비 중입니다.',
                practical_tasks: ['이번 주 실천과제가 준비 중입니다.'],
                is_processed: false,
                is_sent: false
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('콘텐츠 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const submitQuiz = () => {
    setShowResults(true)
  }

  const resetQuiz = () => {
    setQuizAnswers({})
    setShowResults(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">콘텐츠를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 설교 콘텐츠가 존재하지 않거나 삭제되었습니다.</p>
        </div>
      </div>
    )
  }

  const getCorrectAnswers = () => {
    if (!content?.quiz) return 0
    return content.quiz.reduce((count, question) => {
      return count + (quizAnswers[question.id] === question.correct_answer ? 1 : 0)
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              {content.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              📖 {content.scripture} • {new Date(content.date).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 요약
            </button>
            {content.quiz && content.quiz.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quiz'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ❓ 퀴즈
              </button>
            )}
            <button
              onClick={() => setActiveTab('meditation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meditation'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🙏 묵상
            </button>
          </nav>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">설교 요약</h2>
              <p className="text-gray-700 leading-relaxed">{content.summary}</p>
            </div>

            {content.practical_tasks && content.practical_tasks.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">이번 주 실천과제</h2>
                <ul className="space-y-3">
                  {content.practical_tasks.map((task, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && content.quiz && content.quiz.length > 0 && (
          <div className="space-y-6">
            {!showResults ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h2 className="font-semibold text-blue-900 mb-1">설교 이해도 퀴즈</h2>
                  <p className="text-blue-700 text-sm">오늘 설교를 얼마나 이해했는지 확인해보세요!</p>
                </div>

                {content.quiz.map((question, qIndex) => (
                  <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={oIndex}
                            checked={quizAnswers[question.id] === oIndex}
                            onChange={() => handleQuizAnswer(question.id, oIndex)}
                            className="mr-3 text-primary-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== content.quiz.length}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                  >
                    결과 확인하기
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <div className="text-4xl mb-3">
                    {getCorrectAnswers() === content.quiz.length ? '🎉' : '👍'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {content.quiz.length}문제 중 {getCorrectAnswers()}문제 정답!
                  </h2>
                  <p className="text-gray-600">
                    {getCorrectAnswers() === content.quiz.length 
                      ? '완벽합니다! 설교를 잘 이해하셨네요.' 
                      : '좋습니다! 설교 내용을 다시 한 번 살펴보세요.'}
                  </p>
                </div>

                {content.quiz.map((question, qIndex) => (
                  <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, oIndex) => {
                        const isCorrect = oIndex === question.correct_answer
                        const wasSelected = quizAnswers[question.id] === oIndex
                        
                        return (
                          <div
                            key={oIndex}
                            className={`flex items-center p-3 border rounded-lg ${
                              isCorrect 
                                ? 'border-green-200 bg-green-50' 
                                : wasSelected 
                                  ? 'border-red-200 bg-red-50' 
                                  : 'border-gray-200'
                            }`}
                          >
                            <div className="mr-3">
                              {isCorrect ? '✅' : wasSelected ? '❌' : '⚪'}
                            </div>
                            <span className={`${isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                              {option}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <strong>해설:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button
                    onClick={resetQuiz}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    다시 풀어보기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'meditation' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 묵상</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {content.meditation}
            </div>
          </div>
        )}
      </div>

      {/* 하단 교회 정보 */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            은혜교회 • 담임목사 김목사
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Shepherd's Care로 제작됨
          </p>
        </div>
      </div>
    </div>
  )
}