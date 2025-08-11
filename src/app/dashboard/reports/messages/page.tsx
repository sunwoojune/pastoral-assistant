'use client'

export default function MessagesReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">메시지 발송 현황</h1>
        <p className="mt-1 text-sm text-gray-600">
          카카오톡 메시지 발송 통계 및 응답률을 확인합니다.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">메시지 통계 준비 중</h3>
          <p className="text-gray-600">메시지 발송 데이터 수집 후 제공될 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}