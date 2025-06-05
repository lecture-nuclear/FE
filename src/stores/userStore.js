// src/stores/userStore.js
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance' // axiosInstance 임포트

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    name: '게스트',
    email: '',
    id: '',
  }),
  actions: {
    loginSuccess(userData) {
      this.isLoggedIn = true
      this.name = userData.name || '사용자'
      this.email = userData.email || ''
      this.id = userData.id || ''
    },
    logout() {
      this.isLoggedIn = false
      this.name = '게스트'
      this.email = ''
      this.id = ''
    },
    checkSuccess(data) {
      console.log('data', data)
      this.isLoggedIn = true
      this.name = data.data.name || '사용자' // 백엔드에서 받은 사용자 이름 사용
      this.id = data.data.id
    },
    // 페이지 로드 시 로그인 상태 확인
    async checkLoginStatus() {
      try {
        // 서버에 현재 로그인 상태 (쿠키 기반 세션)를 확인하는 API 호출
        // 이 API는 인증된 상태면 사용자 정보를, 아니면 401 Unauthorized를 반환해야 합니다.
        const response = await axiosInstance.get('/auth/status') // 예시 API 엔드포인트
        if (response.status === 200) {
          this.checkSuccess(response.data) // 로그인 상태 업데이트
        } else {
          this.logout() // 로그인 상태가 아님
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.logout() // 인증되지 않음
        } else {
          console.error('로그인 상태 확인 실패:', error)
          this.logout() // 그 외 에러 발생 시 로그아웃 처리
        }
      }
    },
  },
})
