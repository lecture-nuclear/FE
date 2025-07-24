// src/utils/auth.js
import { useUserStore } from '@/stores/userStore'

/**
 * 현재 사용자가 관리자인지 확인
 * @returns {boolean} 관리자 여부
 */
export const isAdmin = () => {
  const userStore = useUserStore()
  return userStore.isLoaded && userStore.id === 1
}