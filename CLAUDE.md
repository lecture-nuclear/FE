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
- All stores use Pinia with Composition API pattern

**Component Structure:**
- `views/`: Main page components (9 routes including courses, video player, admin upload)
- `components/common/`: AppHeader, UserBar - shared UI components
- `components/lectures/`: LectureItem - course display component
- `components/modals/`: LoginModal - authentication modal
- `composables/`: useCartActions - reusable cart logic

### Critical Implementation Details

**API Integration:**
- All HTTP requests go through `src/utils/axiosInstance.js`
- Automatic credential inclusion (`withCredentials: true`)
- 401 errors trigger automatic token refresh attempt
- Failed refresh redirects to login and clears user state

**Video Player Integration:**
- Plyr library integrated in VideoPlayerView
- Course access control: purchased courses only
- Thumbnail auto-upload functionality for course creation

**Routing & Access Control:**
- 9 main routes including `/courses/:id/video/:videoId` for video player
- Admin-only routes for course upload (user ID check)
- Route guards for purchased course verification

### Path Aliases
- `@/` → `src/` directory
- Use `@/` imports throughout the codebase for consistency

### Backend API Patterns
- RESTful endpoints with consistent error handling
- Course enrollment status checking
- Review system (GET/POST reviews for courses)
- Cart operations (add/remove items, checkout)

### Video Time Tracking System

**Implemented Features:**

**1. Simple Video Access Flow:**
- User clicks "영상 보기" button in LectureDetailsView
- Direct navigation to VideoPlayerView with video parameters
- No session management or access verification needed
- Immediate video playback with Plyr library

**2. Comprehensive Time Tracking:**
- **Automatic tracking start**: When Plyr player is ready
- **Real-time monitoring**: 1-second interval updates during playback
- **Accurate position tracking**: Current video position in milliseconds
- **Session-based accumulation**: Total watch time per viewing session

**3. Multiple Transmission Triggers:**
- **Tab visibility change**: `visibilitychange` event (tab switch, minimize)
- **Page unload**: `beforeunload` event (browser close, refresh)
- **Route navigation**: `onBeforeRouteLeave`, `onBeforeRouteUpdate`
- **Video switching**: `watch` on `route.params.videoId` changes
- **Periodic backup**: Every 30 seconds to prevent data loss

**4. Plyr Player Integration:**
- **Play event**: Start time tracking, reset last update time
- **Pause event**: Stop time tracking, preserve accumulated time
- **Seeking event**: Update current position, maintain watch time accuracy

**5. Duplicate Request Prevention:**
- **Flag-based protection**: `isSendingData` prevents concurrent API calls
- **Safe async handling**: `finally` block ensures flag cleanup
- **Console logging**: Clear visibility into transmission status

**6. Router Configuration:**
- **Route path**: `/lectures/:lectureId/video/:videoId`
- **Parameter passing**: lectureId, videoId, video URL, titles via query params
- **Component**: VideoPlayerView with full time tracking capabilities

**Backend API Integration:**
```
PUT /v1/last-view
- Request: { watchTimeMillis, lastTimeMillis, memberId, videoId }
- watchTimeMillis: Accumulated watch time for current session
- lastTimeMillis: Current playback position in milliseconds  
- memberId: User ID from authentication store
- videoId: Video identifier from route parameters
- Response: Standard API response with success confirmation
```

**Implementation Notes:**
- All time values are in milliseconds for precision
- User ID retrieved from Pinia user store (`userStore.getMemberId`)
- Automatic session reset after successful transmission
- Error handling with console logging, no user interruption
- Compatible with both direct video files and YouTube embeds

### LastView 시청 위치 추적 시스템 (진행 중)

**현재 상태:**
- ✅ 시청 시간 저장: `PUT /v1/last-view` (구현 완료)
- ❌ 시청 위치 조회: API 미구현 (작업 필요)
- ✅ 프론트엔드 저장 로직: VideoPlayerView에서 다양한 타이밍에 저장

**필요한 작업:**
1. 백엔드: `GET /v1/last-view/member/{memberId}/video/{videoId}` API 구현
2. 프론트엔드: 비디오 진입 시 마지막 시청 위치 조회 및 플레이어 시작 위치 설정

**LastView 도메인:**
- lastTimeMillis: 마지막 시청 위치 (밀리초) - 예: 12분 영상의 6분 위치
- watchTimeMillis: 누적 시청 시간 (밀리초) - 총 시청한 시간의 합
- 저장 타이밍: 페이지 이탈, 탭 전환, 라우트 변경, 30초 주기 백업

**확장 계획:**
- 향후 "이어보기" 대시보드 구현 가능
- 시청 통계 기능 확장 가능 
- 오프라인 지원 및 동시성 제어 고려

### Payment System Integration

**PortOne V2 결제 시스템:**
- **SDK 로딩**: CDN 방식으로 PortOne V2 SDK 로드 (`index.html`)
- **환경변수**: `.env` 파일에 `VITE_PORTONE_STORE_ID`, `VITE_PORTONE_CHANNEL_KEY` 설정
- **결제 플로우**: 장바구니 → 결제 페이지 → PortOne 결제창 → 결제 결과

**결제 시스템 구조:**
- `src/utils/payment.js`: PortOne SDK 래핑 및 결제 로직
- `src/stores/paymentStore.js`: 결제 상태 관리 (주문 생성, 결제 처리, 검증)
- `src/views/PaymentView.vue`: 메인 결제 페이지
- `src/components/payment/`: 결제 관련 컴포넌트들
  - `PaymentForm.vue`: 결제 정보 입력 폼
  - `PaymentResult.vue`: 결제 결과 표시

**결제 API 엔드포인트:**
- `POST /v1/orders`: 주문 생성
- `POST /v1/payments/verify`: 결제 검증
- `GET /v1/orders/history/{memberId}`: 주문 내역 조회
- `POST /v1/orders/cancel`: 주문 취소

**결제 기능:**
- 다중 결제 방법 지원 (신용카드, 계좌이체, 간편결제)
- 실시간 결제 검증
- 결제 완료 시 자동 장바구니 비우기
- 결제 내역 관리 및 조회

#### 결제 플로우 (Payment Flow)

**1. 장바구니에서 결제 시작**
```
UserBar/CartView → "결제하기" 클릭 → router.push('/payment')
```

**2. 결제 페이지 (PaymentView)**
- 장바구니 아이템 목록 표시 (cartStore에서 로드)
- 총 결제 금액 계산 및 표시
- 결제 방법 선택 (PaymentForm 컴포넌트)

**3. 주문 생성 (paymentStore.createOrder)**
```javascript
// paymentStore.js
orderData = {
  orderId: generateOrderId(),
  orderName: "강의명 외 N건",
  totalAmount: 총금액,
  items: [{ lectureId, title, price }] // 수량 없음
}

// 백엔드 API 호출
POST /v1/orders → 주문 생성
```

**4. PortOne 결제창 호출**
```javascript
// payment.js
PortOne.requestPayment({
  storeId: VITE_PORTONE_STORE_ID,
  channelKey: VITE_PORTONE_CHANNEL_KEY,
  paymentId: orderId,
  orderName: orderData.orderName,
  totalAmount: orderData.totalAmount,
  currency: "KRW",
  payMethod: "CARD" // 또는 다른 결제수단
})
```

**5. 결제 결과 처리**
- **성공**: PortOne 응답 → 백엔드 검증 (`POST /v1/payments/verify`)
- **실패**: 에러 메시지 표시 및 주문 취소
- **완료**: 장바구니 비우기 → 결제 완료 페이지 이동

**6. 결제 완료 후**
- 장바구니 자동 비우기 (`cartStore.clearCart()`)
- 수강 등록 처리 (백엔드에서 Enrollment 생성)
- 결제 완료 안내 및 수강 페이지 이동 링크 제공

### Component Naming
- Views: `*View.vue` (e.g., CoursesView, LectureDetailsView, PaymentView)
- Reusable components: descriptive names (LectureItem, UserBar)
- Modals: `*Modal.vue` suffix
- Payment components: `src/components/payment/` 디렉토리

## TODO - 현재 알려진 문제점

### UI/UX 이슈
- [ ] **강의 상세 페이지 레이아웃**: 영상 목록과 리뷰 섹션 간 겹침 현상 (구조적 해결 적용됨, 추가 테스트 필요)
- [ ] **반응형 디자인**: 모바일/태블릿에서 버튼 배치 및 간격 최적화 필요

### 기능 개선
- [ ] **LastView 시스템**: 시청 위치 조회 API 완전 구현 및 테스트
- [ ] **에러 처리**: API 실패 시 사용자 친화적 메시지 개선
- [ ] **성능 최적화**: 대용량 비디오 파일 로딩 시간 단축 방안