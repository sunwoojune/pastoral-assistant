'use client'

export default function AttendanceReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">출석 현황 리포트</h1>
        <p className="mt-1 text-sm text-gray-600">
          주일예배 출석률 및 트렌드를 분석합니다.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">출석 데이터 준비 중</h3>
          <p className="text-gray-600">출석 체크 시스템 구축 후 제공될 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}