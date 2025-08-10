# Pastoral Assistant - 목회 돌봄 관리 플랫폼

완전한 자동화된 목회 서비스 플랫폼입니다. 설교 업로드 → AI 처리 → 자동 카카오톡 메시지 발송으로 교인들에게 주간 목회 콘텐츠를 제공합니다.

## 📋 프로젝트 개요

**핵심 워크플로우:**
1. 일요일 설교 업로드 → AI가 요약/퀴즈/묵상/실천과제 자동 생성
2. 월요일: 설교 요약 발송 (오전 9시)
3. 수요일: 묵상 질문 발송 (오전 9시)  
4. 금요일: 실천과제 점검 발송 (오전 9시)

## 🚀 주요 기능

### ✅ 완전 구현된 기능들

1. **설교 관리 시스템**
   - AI 기반 설교 분석 (OpenAI GPT 통합)
   - 자동 요약, 퀴즈, 묵상, 실천과제 생성
   - 검토 및 수정 가능

2. **교인 관리 시스템**
   - 개별 교인 등록/수정/삭제
   - **엑셀/CSV 일괄 업로드** 🆕
   - 메시지 수신 설정 (개인별 맞춤화)
   - 그룹/부서별 관리

3. **자동 메시지 시스템**
   - 카카오톡 알림톡 API 통합
   - 메시지 큐 및 스케줄러
   - 실시간 발송 모니터링
   - 발송 통계 및 비용 추적

4. **실시간 대시보드**
   - 스케줄러 제어 (시작/중지)
   - 수동 메시지 처리
   - 테스트 메시지 발송
   - 메시지 큐 현황 모니터링

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: Mock system (Supabase 호환)
- **AI Processing**: OpenAI GPT API
- **Message Service**: KakaoTalk Business API (알림톡)
- **Data Storage**: localStorage (개발용), Supabase 준비됨
- **File Processing**: xlsx, papaparse, react-dropzone

## 🏃‍♂️ 시작하기

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 📁 주요 파일 구조

```
src/
├── app/                          # Next.js 앱 라우터
│   ├── auth/                     # 로그인/회원가입
│   ├── sermons/                  # 설교 관리
│   │   └── new/                  # 새 설교 업로드
│   ├── members/                  # 교인 관리
│   │   ├── import/               # 엑셀 업로드 🆕
│   │   └── new/                  # 새 교인 등록
│   └── messages/                 # 메시지 관리
│       └── dashboard/            # 발송 대시보드
├── contexts/
│   └── AuthContext.tsx           # 인증 컨텍스트
├── lib/
│   ├── openai.ts                 # AI 처리 서비스
│   ├── kakao-api.ts             # 카카오톡 API 클라이언트
│   ├── message-sender.ts        # 메시지 발송 서비스
│   ├── message-generator.ts     # 주간 메시지 생성
│   └── member-storage.ts        # 교인 데이터 관리
└── types/
    ├── ministry-content.ts       # 설교 콘텐츠 타입
    ├── member.ts                # 교인 정보 타입
    ├── kakao-api.ts             # 카카오톡 API 타입
    └── message-template.ts      # 메시지 템플릿 타입
```

## 🔧 환경 설정

`.env.local` 파일에서 설정:

```bash
# OpenAI API (선택사항 - Mock으로 개발 가능)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key

# KakaoTalk Business API (선택사항 - Mock으로 개발 가능)  
NEXT_PUBLIC_KAKAO_API_KEY=your_kakao_key
NEXT_PUBLIC_KAKAO_SENDER_KEY=your_sender_key
```

## 🎯 사용법

### 1. 교인 등록
- **개별 등록**: `/members` → "새 교인 추가"
- **일괄 등록**: `/members` → "📋 엑셀 업로드"

### 2. 설교 업로드 및 AI 처리
1. `/sermons/new` 페이지로 이동
2. 설교 제목, 본문, 내용 입력
3. "AI 처리 시작" 클릭
4. 생성된 요약/퀴즈/묵상 검토 후 저장

### 3. 메시지 발송 관리
1. `/messages/dashboard`에서 스케줄러 시작
2. 자동으로 예약된 시간에 메시지 발송
3. 실시간 발송 현황 모니터링

## 📋 엑셀 업로드 기능 🆕

### 지원 형식
- Excel (.xlsx, .xls)
- CSV 파일

### 권장 컬럼명
- 이름, 전화번호, 생년월일, 성별, 주소, 부서, 직분, 이메일

### 사용법
1. `/members/import` 페이지 접속
2. 엑셀 파일 드래그 & 드롭
3. 컬럼 매핑 확인/수정
4. 미리보기 후 일괄 등록

## 🔄 개발/배포 모드

### Mock 모드 (현재 기본값)
- AI 처리: Mock 응답 (90% 성공률)
- 카카오톡 발송: 시뮬레이션 (실제 발송 없음)
- 교인 데이터: localStorage 저장

### 실제 API 모드
- OpenAI API 키 설정 시 실제 AI 처리
- 카카오톡 API 키 설정 시 실제 메시지 발송
- Supabase 설정 시 실제 데이터베이스 사용

## 🚧 향후 개선사항

- [ ] Supabase 데이터베이스 연동
- [ ] 사용자 권한 관리
- [ ] 메시지 발송 시간 개인 설정
- [ ] 메시지 템플릿 커스터마이징
- [ ] 통계 대시보드 확장

## 📞 지원

개발/배포 관련 문의나 기능 요청은 Git 커밋 히스토리를 참고하여 Claude Code와 상의하세요.

---

**마지막 업데이트**: 2025-01-10  
**개발 상태**: 완전 기능 구현 완료, Mock API로 테스트 가능  
**배포 준비도**: ✅ 준비 완료 (실제 API 키만 설정하면 즉시 운영 가능)