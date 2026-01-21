// src/utils/axiosInstance.js
import axios from 'axios'
import router from '@/router'

// API Base URL 추출 (파일 URL 생성에 사용)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 상대 경로를 절대 파일 URL로 변환
 * @param {string} relativePath - BE에서 반환한 상대 경로 (예: /files/thumbnails/image.jpg)
 * @returns {string} 절대 URL (예: http://localhost:8080/api/files/thumbnails/image.jpg)
 */
export const getFileUrl = (relativePath) => {
  if (!relativePath) return ''
  // 이미 절대 URL인 경우 그대로 반환 (기존 데이터 호환)
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  return `${API_BASE_URL}${relativePath}`
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

// 순환 의존성 해결을 위한 콜백 함수들
let userStoreCallbacks = {
  loginSuccess: null,
  logout: null,
}

// userStore에서 콜백 함수를 설정하는 함수
export const setUserStoreCallbacks = (callbacks) => {
  userStoreCallbacks.loginSuccess = callbacks.loginSuccess
  userStoreCallbacks.logout = callbacks.logout
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor - 401 에러 시 자동 refresh token 시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 네트워크 에러 처리
    if (!error.response) {
      alert('🚨 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
      console.error('🚨 서버에 연결할 수 없습니다.', error)
      return Promise.reject(error)
    }

    // 401 Unauthorized 에러 감지 및 refresh token 시도
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/logout'
    ) {
      // 무한 재시도 방지
      originalRequest._retry = true

      // 이미 refresh 요청이 진행 중인 경우 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              resolve(axiosInstance(originalRequest))
            },
            reject,
          })
        })
      }

      // refresh token 시도 시작
      isRefreshing = true

      try {
        console.log('🔄 토큰 갱신 시도 중...')
        const refreshResponse = await axiosInstance.post('/auth/refresh')

        if (refreshResponse.status === 200 && refreshResponse.data.data) {
          const userData = refreshResponse.data.data

          // userStore 업데이트 (콜백 함수 사용)
          if (userStoreCallbacks.loginSuccess) {
            userStoreCallbacks.loginSuccess({
              name: userData.name || '사용자',
              email: userData.email || '',
              id: userData.id || null,
            })
          }

          console.log('✅ 토큰 갱신 성공')

          // 대기 중인 요청들 재실행
          processQueue(null)

          // 원래 요청 재시도
          return axiosInstance(originalRequest)
        } else {
          throw new Error('토큰 재발급 실패: 응답 형식 오류')
        }
      } catch (refreshError) {
        console.error('⛔ 토큰 갱신 실패:', refreshError)

        // 대기 중인 요청들 모두 실패 처리
        processQueue(refreshError)

        // 로그아웃 처리 (콜백 함수 사용)
        if (userStoreCallbacks.logout) {
          userStoreCallbacks.logout()
        }

        // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (router.currentRoute.value.path !== '/') {
          router.push('/')
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 418 에러 (기존 로직 유지)
    if (error.response.status === 418) {
      console.warn('🫖 서버에서 418 에러 응답')
      // 418 에러에 대한 특별한 처리가 필요하다면 여기에 추가
    }

    // 기타 에러는 그대로 전달
    return Promise.reject(error)
  },
)

// Request Interceptor (선택사항 - 요청 전 로깅 등)
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (예: 로깅, 헤더 추가 등)
    console.log(`📤 API 요청: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('📤 요청 에러:', error)
    return Promise.reject(error)
  },
)

export default axiosInstance
