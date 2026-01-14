# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development:**
```bash
npm run dev
```

**Build & Testing:**
```bash
npm run build          # Production build
npm run preview        # Preview production build
npm run test:unit      # Run Vitest unit tests
npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting
```

## Project Architecture

This is a Vue 3 e-learning platform built with:
- **Frontend**: Vue 3 + Composition API, Vite, Vue Router 4, Pinia
- **HTTP Client**: Axios with configured interceptors for auth/refresh tokens
- **Video Player**: Plyr library for course video playback
- **Backend API**: REST API at `http://localhost:8080/api`

### Key Architectural Patterns

**Authentication Flow:**
- JWT-based auth with refresh tokens stored in HTTP-only cookies
- `axiosInstance.js` handles automatic token refresh on 401 errors
- `userStore.js` manages authentication state and user profile data

**State Management:**
- `userStore.js`: Authentication, user profile, login/logout
- `cartStore.js`: Shopping cart with backend integration
- `paymentStore.js`: Payment processing and order management
- All stores use Pinia with Composition API pattern

**Component Structure:**
- `views/`: Main page components (SettingsView, AdminView, PaymentView 등)
- `components/common/`: AppHeader, UserBar, AppFooter - shared UI components
- `components/settings/`: User settings forms (nickname, password, account deletion)
- `components/admin/`: Admin dashboard components
- `components/payment/`: Payment form and result components
- `components/home/`: Homepage content components

### Critical Implementation Details

**API Integration:**
- All HTTP requests go through `src/utils/axiosInstance.js`
- Automatic credential inclusion (`withCredentials: true`)
- 401 errors trigger automatic token refresh attempt
- Failed refresh redirects to login and clears user state

**Video Player Integration:**
- Plyr library integrated in VideoPlayerView
- Course access control: purchased courses only
- Real-time watch time tracking with multiple transmission triggers

**Settings & Admin Pages:**
- Tabbed interface with URL query parameter state management
- Tab state persists through page refresh
- Responsive design matching admin page layout

### Path Aliases
- `@/` → `src/` directory
- Use `@/` imports throughout the codebase for consistency

### Video Time Tracking System

**Core Features:**
- **Automatic tracking**: Plyr player integration with 1-second intervals
- **Multiple triggers**: Tab visibility, page unload, route navigation, 30-second backup
- **API endpoint**: `PUT /v1/last-view` with watchTimeMillis and lastTimeMillis
- **Duplicate prevention**: Flag-based protection for concurrent requests

**Backend API:**
```
PUT /v1/last-view
- Request: { watchTimeMillis, lastTimeMillis, memberId, videoId }
- Response: Standard API response with success confirmation
```

### Payment System Integration

**PortOne V2 결제 시스템:**
- SDK loaded via CDN in `index.html`
- Environment variables: `VITE_PORTONE_STORE_ID`, `VITE_PORTONE_CHANNEL_KEY`
- Flow: Cart → Payment Page → PortOne → Verification → Completion

**Key Components:**
- `src/utils/payment.js`: PortOne SDK wrapper
- `src/stores/paymentStore.js`: Payment state management
- `src/views/PaymentView.vue`: Main payment interface
- `src/components/payment/`: Payment forms and result displays

**API Endpoints:**
- `POST /v1/orders`: Order creation
- `POST /v1/payments/verify`: Payment verification
- `GET /v1/orders/history/{memberId}`: Order history
- `POST /v1/orders/cancel`: Order cancellation

### Component Naming
- Views: `*View.vue` (e.g., SettingsView, AdminView, PaymentView)
- Reusable components: descriptive names (LectureItem, UserBar)
- Modals: `*Modal.vue` suffix

## Current Issues & TODO

### High Priority

**Security & Authentication:**
- [ ] **토큰 검증 로깅**: 인증 성공/실패 로깅 추가 (보안 모니터링)
- [ ] **에러 응답 표준화**: HTTP 418 대신 표준 상태 코드 사용 (401/403)
- [ ] **access 토큰 만료 시 로그아웃 처리 개선**

**UI/UX Improvements:**
- [ ] **반응형 디자인**: 모바일/태블릿에서 버튼 배치 및 간격 최적화
- [ ] **에러 처리**: API 실패 시 사용자 친화적 메시지 개선

### Medium Priority

**Feature Enhancements:**
- [ ] **LastView 시스템**: 시청 위치 조회 API 구현 및 "이어보기" 기능
- [ ] **성능 최적화**: 대용량 비디오 파일 로딩 시간 단축
- [ ] **강의 관리**: 관리자 페이지에 강의 목록 조회 및 관리 기능

**Security & Performance:**
- [ ] **Rate Limiting**: 토큰 검증 실패 시 브루트포스 공격 방지
- [ ] **Redis 연결 관리**: Circuit Breaker 패턴으로 Redis 장애 시 fallback
- [ ] **데이터베이스 인덱스**: Member, LastView, Lecture 테이블 성능 최적화

### Low Priority

**Advanced Features:**
- [ ] **비디오 보안**: 다운로드 방지 및 스트리밍 보안 강화
- [ ] **강의 승인 워크플로우**: 강의 검토 및 승인 프로세스
- [ ] **강의 통계 대시보드**: 수강생 수, 완주율, 매출 통계

## Implementation Notes

- All time values in milliseconds for precision
- User ID retrieved from Pinia user store (`userStore.getMemberId`)
- Tab state management via URL query parameters
- Soft delete pattern with `deleted_at` timestamp
- Comprehensive error handling with console logging