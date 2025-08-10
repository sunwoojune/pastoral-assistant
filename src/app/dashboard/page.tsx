export default function Dashboard() {
  const stats = [
    {
      name: '이번 주 설교',
      value: '3',
      icon: '📖',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: '예정된 심방',
      value: '8',
      icon: '🏠',
      change: '+1',
      changeType: 'positive'
    },
    {
      name: '활성 기도제목',
      value: '15',
      icon: '🙏',
      change: '-2',
      changeType: 'negative'
    },
    {
      name: '돌봄 대상',
      value: '24',
      icon: '👥',
      change: '+4',
      changeType: 'positive'
    }
  ]

  const recentActivities = [
    { id: 1, type: '설교', title: '사랑의 실천', date: '2025-01-05', icon: '📖' },
    { id: 2, type: '심방', title: '김영희 집사님 방문', date: '2025-01-04', icon: '🏠' },
    { id: 3, type: '기도제목', title: '청년부 수련회 준비', date: '2025-01-03', icon: '🙏' },
    { id: 4, type: '돌봄', title: '박성민 권사님 상담', date: '2025-01-02', icon: '👥' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          오늘의 사역 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    item.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {item.change}
                </span>
                <span className="text-gray-500"> 지난 주 대비</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              최근 활동
            </h3>
            <div className="mt-5 space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.type} • {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오늘의 일정 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              오늘의 일정
            </h3>
            <div className="mt-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    오전 10시 - 주일 예배
                  </p>
                  <p className="text-sm text-gray-500">설교: 사랑의 실천</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    오후 2시 - 김영희 집사님 심방
                  </p>
                  <p className="text-sm text-gray-500">건강 상담 및 기도</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    오후 5시 - 청년부 모임
                  </p>
                  <p className="text-sm text-gray-500">수련회 준비 회의</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            빠른 작업
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium text-gray-900">설교 추가</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <span className="text-2xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-900">교인 추가</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <span className="text-2xl mb-2">🏠</span>
              <span className="text-sm font-medium text-gray-900">심방 기록</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <span className="text-2xl mb-2">🙏</span>
              <span className="text-sm font-medium text-gray-900">기도제목</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}