// src/stores/userStore.js
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    name: '게스트',
    email: '',
    id: null, // memberId 역할을 하는 id를 null로 초기화
    isLoaded: false, // 사용자 정보 로드 완료 여부 추가
    loadingPromise: null, // 중복 로딩 방지를 위한 Promise 저장
  }),
  actions: {
    loginSuccess(userData) {
      this.isLoggedIn = true
      this.name = userData.name || '사용자'
      this.email = userData.email || ''
      this.id = userData.id || null // id(memberId) 저장
      this.isLoaded = true // 로그인 성공 시 정보 로드 완료
    },
    logout() {
      this.isLoggedIn = false
      this.name = '게스트'
      this.email = ''
      this.id = null
      this.isLoaded = false // 로그아웃 시 정보 로드 상태 초기화
      this.loadingPromise = null // 로딩 Promise도 초기화
    },
    checkSuccess(data) {
      console.log('data', data)
      this.isLoggedIn = true
      this.name = data.data.name || '사용자' // 백엔드에서 받은 사용자 이름 사용
      this.id = data.data.id // memberId 역할을 하는 id 저장
      this.isLoaded = true // 체크 성공 시 정보 로드 완료
    },
    /**
     * 페이지 로드 시 로그인 상태 확인 및 사용자 정보 로드.
     * 이 함수는 Promise를 반환하여 외부에서 로딩 완료를 기다릴 수 있게 합니다.
     */
    async checkLoginStatus() {
      // 이미 로딩 중인 Promise가 있다면 해당 Promise를 반환하여 중복 호출 방지
      if (this.loadingPromise) {
        return this.loadingPromise
      }

      // 이미 로드 완료된 상태라면 즉시 resolved Promise 반환
      if (this.isLoaded) {
        return Promise.resolve()
      }

      // 새로운 로딩 Promise 생성 및 저장
      this.loadingPromise = (async () => {
        try {
          const response = await axiosInstance.get('/auth/status') // 예시 API 엔드포인트
          if (response.status === 200 && response.data && response.data.data) {
            this.checkSuccess(response.data) // 로그인 상태 및 사용자 정보 업데이트
          } else {
            // 200 OK라도 데이터 형식이 안 맞으면 로그아웃 처리
            console.error('로그인 상태 확인 응답 형식이 올바르지 않습니다.')
            this.logout()
            throw new Error('Invalid login status response')
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.warn('인증 실패 (401): 로그인 필요')
            this.logout() // 인증되지 않음
          } else {
            console.error('로그인 상태 확인 실패:', error)
            this.logout() // 그 외 에러 발생 시 로그아웃 처리
          }
          throw error // 오류 발생 시 throw
        } finally {
          this.loadingPromise = null // 로딩 완료 또는 실패 후 Promise 초기화
        }
      })()
      return this.loadingPromise
    },
  },
  getters: {
    // memberId (여기서는 id)를 안전하게 가져오기 위한 getter
    getMemberId: (state) => state.id,
    // 사용자 정보 로드 완료 여부 getter
    isUserLoaded: (state) => state.isLoaded,
  },
})
