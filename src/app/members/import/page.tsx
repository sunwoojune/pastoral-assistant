'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import Link from 'next/link'
import { Member } from '@/types/member'
import { memberStorage } from '@/lib/member-storage'

interface ImportData {
  [key: string]: string
}

interface ColumnMapping {
  [excelColumn: string]: keyof Member | 'skip'
}

const DEFAULT_MAPPINGS: ColumnMapping = {
  '이름': 'name',
  '성명': 'name',
  '전화번호': 'phone',
  '휴대폰': 'phone',
  '핸드폰': 'phone',
  '생년월일': 'date_of_birth',
  '생일': 'date_of_birth',
  '성별': 'gender',
  '주소': 'address',
  '직분': 'roles',
  '부서': 'groups',
  '그룹': 'groups',
  '소속': 'groups',
  '이메일': 'email',
  '메모': 'care_notes'
}

export default function MemberImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload')
  const [rawData, setRawData] = useState<ImportData[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [previewData, setPreviewData] = useState<Partial<Member>[]>([])
  const [importResult, setImportResult] = useState<{
    success: number
    skipped: number
    errors: string[]
  }>({ success: 0, skipped: 0, errors: [] })
  const [loading, setLoading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    
    try {
      if (file.name.endsWith('.csv')) {
        // CSV 파싱
        Papa.parse(file, {
          header: true,
          encoding: 'UTF-8',
          complete: (results) => {
            const data = results.data as ImportData[]
            const cols = Object.keys(data[0] || {})
            processUploadedData(data, cols)
          },
          error: (error) => {
            alert('CSV 파일 읽기 오류: ' + error.message)
            setLoading(false)
          }
        })
      } else {
        // Excel 파싱
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
        
        if (data.length < 2) {
          alert('데이터가 없거나 형식이 올바르지 않습니다.')
          setLoading(false)
          return
        }

        const headers = data[0]
        const rows = data.slice(1).map(row => {
          const obj: ImportData = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ''
          })
          return obj
        })

        processUploadedData(rows, headers)
      }
    } catch (error) {
      alert('파일 처리 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const processUploadedData = (data: ImportData[], cols: string[]) => {
    setRawData(data.filter(row => Object.values(row).some(val => val?.trim())))
    setColumns(cols)
    
    // 자동 매핑 적용
    const autoMapping: ColumnMapping = {}
    cols.forEach(col => {
      const mappedField = DEFAULT_MAPPINGS[col] || DEFAULT_MAPPINGS[col.trim()]
      autoMapping[col] = mappedField || 'skip'
    })
    setMapping(autoMapping)
    
    setStep('mapping')
    setLoading(false)
  }

  const handleMappingChange = (column: string, field: string) => {
    setMapping(prev => ({
      ...prev,
      [column]: field as keyof Member | 'skip'
    }))
  }

  const generatePreview = () => {
    const preview = rawData.slice(0, 5).map((row, index) => {
      const member: Partial<Member> = {
        id: `temp-${index}`,
        is_active: true,
        message_settings: {
          receive_sermon_summary: true,
          receive_meditation: true,
          receive_practice_check: true,
          receive_announcements: true
        },
        groups: [],
        roles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      Object.entries(mapping).forEach(([column, field]) => {
        if (field === 'skip') return
        
        const value = row[column]?.trim()
        if (!value) return

        if (field === 'groups' || field === 'roles') {
          member[field] = value.split(',').map(v => v.trim()).filter(Boolean)
        } else if (field === 'gender') {
          member[field] = value === '남' || value === 'M' ? 'male' : 'female'
        } else if (field === 'date_of_birth') {
          // 날짜 형식 정규화
          const dateValue = value.replace(/[.\-/]/g, '-')
          if (dateValue.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            member[field] = dateValue
          }
        } else {
          (member as any)[field] = value
        }
      })

      return member
    })

    setPreviewData(preview)
    setStep('preview')
  }

  const executeImport = async () => {
    setLoading(true)
    
    const result = {
      success: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i]
        const member: Partial<Member> = {
          id: `import-${Date.now()}-${i}`,
          is_active: true,
          message_settings: {
            receive_sermon_summary: true,
            receive_meditation: true,
            receive_practice_check: true,
            receive_announcements: true
          },
          groups: [],
          roles: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        let hasRequiredFields = false
        
        Object.entries(mapping).forEach(([column, field]) => {
          if (field === 'skip') return
          
          const value = row[column]?.trim()
          if (!value) return

          if (field === 'name' || field === 'phone') {
            hasRequiredFields = true
          }

          if (field === 'groups' || field === 'roles') {
            member[field] = value.split(',').map(v => v.trim()).filter(Boolean)
          } else if (field === 'gender') {
            member[field] = value === '남' || value === 'M' ? 'male' : 'female'
          } else if (field === 'date_of_birth') {
            const dateValue = value.replace(/[.\-/]/g, '-')
            if (dateValue.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
              member[field] = dateValue
            }
          } else {
            (member as any)[field] = value
          }
        })

        if (!hasRequiredFields) {
          result.skipped++
          continue
        }

        // 중복 전화번호 체크
        if (member.phone) {
          const existing = memberStorage.getAll().find(m => m.phone === member.phone)
          if (existing) {
            result.errors.push(`${i + 2}행: 중복된 전화번호 (${member.phone})`)
            continue
          }
        }

        memberStorage.create(member as Member)
        result.success++
        
      } catch (error) {
        result.errors.push(`${i + 2}행: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      }
    }

    setImportResult(result)
    setStep('result')
    setLoading(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  if (step === 'upload') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">교인 명단 업로드</h1>
            <p className="mt-1 text-sm text-gray-600">
              엑셀 파일로 교인 정보를 일괄 등록하세요.
            </p>
          </div>
          <Link
            href="/members"
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
          >
            목록으로
          </Link>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="bg-white shadow rounded-lg p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📋</div>
            {loading ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">파일을 처리하고 있습니다...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-lg text-primary-600">파일을 여기에 놓으세요...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  엑셀 파일을 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-gray-500">
                  지원 형식: .xlsx, .xls, .csv (최대 파일 크기: 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 엑셀 템플릿 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-4">📋 엑셀 파일 형식 안내</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p><strong>권장 컬럼명:</strong></p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">이름</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">전화번호</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">생년월일</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">성별</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">주소</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">부서</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">직분</span>
              <span className="bg-blue-100 px-2 py-1 rounded text-xs">이메일</span>
            </div>
            <p className="mt-3"><strong>참고사항:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>첫 번째 행이 컬럼명이어야 합니다</li>
              <li>이름과 전화번호는 필수 항목입니다</li>
              <li>부서나 직분이 여러개인 경우 쉼표로 구분하세요</li>
              <li>생년월일 형식: YYYY-MM-DD 또는 YYYY.MM.DD</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'mapping') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">컬럼 매핑</h1>
          <p className="mt-1 text-sm text-gray-600">
            엑셀 컬럼을 시스템 필드에 매핑하세요. ({rawData.length}개 행 발견)
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((column) => (
              <div key={column} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column}
                  </label>
                  <div className="text-xs text-gray-500">
                    예시: {rawData[0]?.[column]?.substring(0, 20)}...
                  </div>
                </div>
                <div className="flex-1">
                  <select
                    value={mapping[column] || 'skip'}
                    onChange={(e) => handleMappingChange(column, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="skip">건너뛰기</option>
                    <option value="name">이름</option>
                    <option value="phone">전화번호</option>
                    <option value="date_of_birth">생년월일</option>
                    <option value="gender">성별</option>
                    <option value="address">주소</option>
                    <option value="email">이메일</option>
                    <option value="groups">부서/그룹</option>
                    <option value="roles">직분</option>
                    <option value="care_notes">메모</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              다시 업로드
            </button>
            <button
              onClick={generatePreview}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
            >
              미리보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">등록 미리보기</h1>
          <p className="mt-1 text-sm text-gray-600">
            처음 5개 행의 결과를 확인하세요. 문제없으면 등록을 진행하세요.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">생년월일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직분</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((member, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.date_of_birth || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.groups?.join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.roles?.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">⚠️ 등록 안내</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• 총 {rawData.length}개 행이 처리됩니다</li>
            <li>• 중복된 전화번호가 있으면 건너뜁니다</li>
            <li>• 이름 또는 전화번호가 없으면 건너뜁니다</li>
            <li>• 모든 교인은 기본적으로 메시지 수신 활성화됩니다</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setStep('mapping')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            매핑 수정
          </button>
          <button
            onClick={executeImport}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? '등록중...' : '등록 시작'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">등록 완료</h1>
          <p className="mt-1 text-sm text-gray-600">
            교인 등록 작업이 완료되었습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl text-green-500 mb-2">✅</div>
            <div className="text-2xl font-bold text-gray-900">{importResult.success}</div>
            <div className="text-sm text-gray-600">성공</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl text-yellow-500 mb-2">⏭️</div>
            <div className="text-2xl font-bold text-gray-900">{importResult.skipped}</div>
            <div className="text-sm text-gray-600">건너뜀</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl text-red-500 mb-2">❌</div>
            <div className="text-2xl font-bold text-gray-900">{importResult.errors.length}</div>
            <div className="text-sm text-gray-600">오류</div>
          </div>
        </div>

        {importResult.errors.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">오류 목록</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {importResult.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setStep('upload')
              setRawData([])
              setColumns([])
              setMapping({})
              setPreviewData([])
              setImportResult({ success: 0, skipped: 0, errors: [] })
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            다시 업로드
          </button>
          <Link
            href="/members"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            교인 목록 보기
          </Link>
        </div>
      </div>
    )
  }

  return null
}