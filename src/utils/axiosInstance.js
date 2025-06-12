// src/utils/axiosInstance.js
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import router from '@/router'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// TODO: refresh 안됨
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const userStore = useUserStore()

    if (!error.response) {
      alert('🚨 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
      console.error('🚨 서버에 연결할 수 없습니다.', error)
      return Promise.reject(error)
    }

    // HTTP Status Code 418 (I AM TEAPOT) 또는 401 Unauthorized 감지
    // _retry 플래그로 무한 재시도 방지
    // 로그인 및 토큰 재발급 요청은 이 인터셉터에서 재시도하지 않도록 제외합니다.
    if (
      (error.response.status === 418 || error.response.status === 401) &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true

      // 🚩 추가: 토큰 갱신 시도 전에 로그인 상태를 강제로 확인 및 업데이트
      // 이를 통해 userStore.isLoggedIn이 최신 상태인지 확인합니다.
      if (!isRefreshing) {
        // 이미 갱신 중인 상태가 아니라면
        try {
          // 사용자 정보 로드 액션을 호출하여 상태를 업데이트합니다.
          // 이 과정에서 유효한 세션이 있다면 isLoggedIn이 true가 될 것입니다.
          await userStore.checkLoginStatus()
          // 만약 checkLoginStatus가 로그인 상태가 아니라고 판단하면 (쿠키 만료 등)
          // userStore.isLoggedIn은 여전히 false일 것이므로, 이 경우 refresh 시도를 건너뜀.
          // 또한, checkLoginStatus 내부에서 실패 시 reject를 하므로,
          // 여기서 catch 블록으로 바로 넘어갈 수 있습니다.
        } catch (statusError) {
          console.warn('checkLoginStatus 도중 오류 발생 또는 비로그인 상태 확인:', statusError)
          // 로그인 상태가 아님을 확인했으므로, 더 이상 refresh 시도 없이 로그인 페이지로 리다이렉트
          userStore.logout() // 확실하게 로그아웃 상태로 만듬
          alert('세션이 만료되었습니다. 다시 로그인해주세요.')
          router.push('/login')
          return Promise.reject(error) // 원래 에러 reject
        }
      }

      // 여전히 isLoggedIn이 false이거나, checkLoginStatus에서 이미 리다이렉트 처리했어야 하지만
      // 혹시 모를 경우를 대비하여 한 번 더 방어 코드를 둡니다.
      // 하지만 위의 checkLoginStatus가 제대로 작동한다면 이 조건에 걸릴 일은 줄어들 것입니다.
      if (!userStore.isLoggedIn) {
        console.warn('사용자 스토어가 로그인 상태가 아니므로 토큰 갱신 시도를 건너뜀 (최종 확인).')
        // 이미 위에서 처리했겠지만, 만약을 위한 방어 코드
        userStore.logout()
        alert('세션이 만료되었습니다. 다시 로그인해주세요.')
        router.push('/login')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
      }

      isRefreshing = true

      try {
        const refreshResponse = await axiosInstance.post('/auth/refresh')

        if (refreshResponse.status === 200) {
          const userData = refreshResponse.data.data
          userStore.loginSuccess({
            name: userData.name || '사용자',
            email: userData.email || '',
            id: userData.id || null,
          })

          processQueue(null)
          return axiosInstance(originalRequest)
        } else {
          throw new Error('토큰 재발급 실패: 서버 응답 오류')
        }
      } catch (refreshError) {
        console.error('⛔ Refresh token failed or expired, requires re-login:', refreshError)
        processQueue(refreshError)
        userStore.logout()
        alert('세션이 만료되었습니다. 다시 로그인해주세요.')
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
