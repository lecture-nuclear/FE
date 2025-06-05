// src/utils/axiosInstance.js
import axios from 'axios'
import { useUserStore } from '@/stores/userStore' // Pinia 스토어 사용
import router from '@/router' // Vue Router 사용 시

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // 백엔드 API 기본 URL로 변경하세요.
  withCredentials: true, // 쿠키 사용 (HTTP Only 쿠키 전송 및 수신)
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false // 토큰 갱신 중복 요청 방지 플래그
let failedQueue = [] // 갱신 중 실패한 요청들을 담을 큐

// 큐에 쌓인 요청들을 처리하는 함수
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      // 쿠키 기반 인증이므로 새 쿠키는 브라우저가 자동 포함하여 재시도될 것입니다.
      // resolve에 토큰을 전달하는 대신, 단순히 요청을 재실행하도록 합니다.
      prom.resolve()
    }
  })
  failedQueue = []
}

// 🚩 응답 인터셉터: 응답을 받거나 에러 발생 시 처리
axiosInstance.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 반환
  async (error) => {
    const originalRequest = error.config
    const userStore = useUserStore() // 인터셉터 내부에서 스토어 인스턴스 가져오기

    // 1. 서버 응답이 없을 때 (네트워크 오류 등)
    if (!error.response) {
      alert('🚨 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
      console.error('🚨 서버에 연결할 수 없습니다.', error)
      return Promise.reject(error)
    }

    // 2. HTTP Status Code 418 (I AM TEAPOT) 또는 401 Unauthorized 감지
    // 백엔드에서 토큰 만료 신호로 418 또는 401을 보낼 경우
    // _retry 플래그로 무한 재시도 방지
    // 로그인 및 토큰 재발급 요청은 이 인터셉터에서 재시도하지 않도록 제외합니다.
    if (
      (error.response.status === 418 || error.response.status === 401) &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (!userStore.isLoggedIn) {
        console.warn('Pinia UserStore가 로그아웃 상태이므로 토큰 갱신 시도를 건너뜜.')
        return Promise.reject(error)
      }

      originalRequest._retry = true // 재시도 플래그 설정 (재시도 방지)

      if (isRefreshing) {
        // 이미 토큰 갱신 중이라면, 현재 요청을 큐에 추가하고 대기합니다.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
      }

      isRefreshing = true // 토큰 갱신 시작 플래그 설정

      try {
        // 3. 리프레시 토큰으로 새로운 액세스 토큰 발급 요청
        // 리프레시 토큰은 HTTP Only 쿠키에 저장되어 있다면 'withCredentials: true'로 자동 전송됩니다.
        // 서버는 응답 헤더의 Set-Cookie로 새 액세스 토큰 쿠키를 보낼 것입니다.
        const refreshResponse = await axiosInstance.post('/auth/refresh') // 백엔드 토큰 재발급 API 엔드포인트

        if (refreshResponse.status === 200) {
          // 사용자 이름 등의 정보가 응답 바디에 있다면 Pinia 스토어 업데이트
          // 백엔드 응답 구조에 따라 'name', 'email', 'id' 필드명을 확인하여 수정하세요.
          const userData = refreshResponse.data.data // 예시: 응답이 data.data 객체 안에 있음
          userStore.loginSuccess({
            name: userData.name || '사용자',
            email: userData.email || '',
            id: userData.id || null,
          })

          processQueue(null) // 큐에 있던 요청들 성공 처리 및 재시도
          return axiosInstance(originalRequest) // 원래 실패했던 요청 재시도
        } else {
          // 200 OK가 아니면 리프레시 실패로 간주합니다.
          throw new Error('토큰 재발급 실패: 서버 응답 오류')
        }
      } catch (refreshError) {
        // 4. 리프레시 토큰 만료 또는 갱신 실패 시
        console.error('⛔ Refresh token failed or expired, requires re-login:', refreshError)
        processQueue(refreshError) // 큐에 있던 요청들 실패 처리
        userStore.logout() // Pinia 스토어 상태 초기화
        alert('세션이 만료되었습니다. 다시 로그인해주세요.')
        router.push('/login') // 로그인 페이지로 리다이렉트 (Vue Router 사용 시)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false // 토큰 갱신 완료
      }
    }

    // 418 또는 401이 아닌 다른 에러들은 그대로 reject합니다.
    return Promise.reject(error)
  },
)

export default axiosInstance
