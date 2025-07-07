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

### Component Naming
- Views: `*View.vue` (e.g., CoursesView, LectureDetailsView)
- Reusable components: descriptive names (LectureItem, UserBar)
- Modals: `*Modal.vue` suffix