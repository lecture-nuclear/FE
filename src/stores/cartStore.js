// src/stores/cartStore.js
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance'
import { useUserStore } from '@/stores/userStore' // userStore 임포트

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    itemCount: 0,
    totalPrice: 0,
  }),
  getters: {
    cartItemCount: (state) => state.items.length,
    cartTotalPrice: (state) =>
      state.items.reduce((total, item) => total + item.price, 0),
  },
  actions: {
    // 장바구니에 아이템 추가 (강의는 수량 없음)
    addItem(item) {
      const existingItem = this.items.find((i) => i.id === item.id)
      if (!existingItem) {
        this.items.push({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image || null,
        })
        this.updateCartSummary()
      }
      // 이미 존재하는 경우 중복 추가하지 않음
    },
    /**
     * 장바구니에서 특정 아이템을 제거하고 백엔드에 삭제 요청을 보냅니다.
     * @param {number} lectureId 제거할 강의의 ID (백엔드의 lectureId)
     */
    async removeItem(lectureId) {
      // 🚩 매개변수 이름을 lectureId로 변경
      const userStore = useUserStore() // userStore 인스턴스 가져오기

      if (!userStore.isLoggedIn || userStore.getMemberId === null) {
        console.warn(
          '로그인되지 않았거나 사용자 ID를 알 수 없어 장바구니에서 아이템을 삭제할 수 없습니다.',
        )
        return
      }

      try {
        await axiosInstance.delete('/v1/shopping-cart', {
          data: {
            // DELETE 요청의 본문은 'data' 속성을 사용합니다.
            memberId: userStore.getMemberId, // Pinia userStore의 id (DB id)
            lectureId: lectureId, // 삭제할 강의의 ID
          },
        })

        // 🚩 성공 시에만 Pinia 스토어에서 아이템 제거
        this.items = this.items.filter((item) => item.id !== lectureId)
        this.updateCartSummary()
        alert('장바구니에서 상품이 삭제되었습니다.')
      } catch (error) {
        console.error('장바구니 아이템 삭제 실패:', error)
        alert('장바구니 아이템 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    },
    // 장바구니 전체 비우기 (기존 로직 유지)
    clearCart() {
      this.items = []
      this.updateCartSummary()
      // axiosInstance.post('/cart/clear');
    },
    // 장바구니 정보 수동 설정 (기존 로직 유지)
    setCart(items) {
      this.items = items
      this.updateCartSummary()
    },
    // 장바구니 요약 정보 업데이트 (기존 로직 유지)
    updateCartSummary() {
      this.itemCount = this.cartItemCount
      this.totalPrice = this.cartTotalPrice
    },
    // 백엔드에서 장바구니 정보 로드 (기존 로직 유지)
    async loadCartFromBackend() {
      const userStore = useUserStore()

      if (!userStore.isLoggedIn || userStore.getMemberId === null) {
        console.warn('사용자 ID(DB ID)가 없거나 로그인되지 않아 장바구니를 로드할 수 없습니다.')
        this.clearCart()
        return
      }

      try {
        // 🚩 백엔드 응답 구조에 맞춰 response.data.data.lectureList 사용
        const response = await axiosInstance.get(`/v1/shopping-cart/${userStore.getMemberId}`)
        const loadedItems = response.data.data.lectureList.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price || 0, // null인 경우 0으로 처리
          image: item.thumbnailUrl || null, // 백엔드에서 thumbnailUrl로 반환
        }))
        this.setCart(loadedItems)
      } catch (error) {
        console.error('초기 장바구니 정보 로드 실패:', error)
        this.clearCart()
      }
    },
  },
})
