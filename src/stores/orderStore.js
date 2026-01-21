// src/stores/orderStore.js
import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchOrderHistory(memberId) {
      this.loading = true
      this.error = null
      try {
        const response = await axiosInstance.get(`/v1/orders/history/${memberId}`)
        if (response.data && response.data.data) {
          this.orders = response.data.data
        } else {
          this.orders = []
        }
      } catch (error) {
        console.error('주문 내역 조회 실패:', error)
        this.error = error.response?.data?.message || '주문 내역을 불러오는 중 오류가 발생했습니다.'
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    async cancelOrder(orderId) {
      try {
        await axiosInstance.post('/v1/orders/cancel', { orderId })
        // 취소 후 해당 주문 상태 업데이트
        const order = this.orders.find(o => o.orderId === orderId)
        if (order) {
          order.status = 'CANCELLED'
        }
        return true
      } catch (error) {
        console.error('주문 취소 실패:', error)
        throw error
      }
    }
  },
  getters: {
    getOrders: (state) => state.orders,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
})
