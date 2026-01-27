import { useUserStore } from '@/stores/userStore'

export const isAdmin = () => {
  const userStore = useUserStore()
  return userStore.isLoaded && userStore.role === 'ADMIN'
}