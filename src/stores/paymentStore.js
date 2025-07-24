import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance'
import { paymentService } from '@/utils/payment'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    isProcessing: false,
    currentOrder: null,
    paymentResult: null,
    orderHistory: [],
    error: null,
    paymentStatus: null // 'pending', 'success', 'failed', 'cancelled'
  }),

  getters: {
    hasActiveOrder: (state) => state.currentOrder !== null,
    isPaymentSuccessful: (state) => state.paymentStatus === 'success',
    isPaymentFailed: (state) => state.paymentStatus === 'failed',
    totalOrderAmount: (state) => {
      if (!state.currentOrder) return 0
      return state.currentOrder.totalAmount || 0
    },
    formattedTotalAmount: (state) => {
      if (!state.currentOrder) return '0원'
      return paymentService.formatPrice(state.currentOrder.totalAmount) + '원'
    }
  },

  actions: {
    async createOrder(orderItems) {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn || !userStore.getMemberId) {
        throw new Error('로그인이 필요합니다.')
      }

      try {
        this.isProcessing = true
        this.error = null

        const orderId = paymentService.generateOrderId()
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0)

        const orderData = {
          orderId,
          orderName: orderItems.length === 1 
            ? orderItems[0].title 
            : `${orderItems[0].title} 외 ${orderItems.length - 1}건`,
          totalAmount,
          currency: 'KRW',
          customer: {
            id: userStore.getMemberId,
            name: userStore.name,
            email: userStore.email,
            phone: userStore.phone || ''
          },
          products: orderItems,
          createdAt: new Date().toISOString()
        }

        // 백엔드에 주문 생성 요청
        await axiosInstance.post('/v1/orders', {
          orderId: orderData.orderId,
          memberId: userStore.getMemberId,
          items: orderItems.map(item => ({
            lectureId: item.id,
            title: item.title,
            price: item.price
          })),
          totalAmount: orderData.totalAmount
        })

        this.currentOrder = orderData
        this.paymentStatus = 'pending'

        return orderData
      } catch (error) {
        this.error = error.message || '주문 생성에 실패했습니다.'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    async processPayment() {
      if (!this.currentOrder) {
        throw new Error('결제할 주문이 없습니다.')
      }

      try {
        this.isProcessing = true
        this.error = null

        // 결제 데이터 유효성 검사
        paymentService.validatePaymentData(this.currentOrder)

        // PortOne 결제 요청
        const paymentResult = await paymentService.requestPayment(this.currentOrder)

        if (paymentResult.success) {
          this.paymentResult = paymentResult.data
          await this.verifyPayment(paymentResult.data.paymentId)
        } else {
          throw new Error(paymentResult.error)
        }

        return paymentResult
      } catch (error) {
        this.error = error.message || '결제 처리에 실패했습니다.'
        this.paymentStatus = 'failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    async verifyPayment(paymentId) {
      try {
        const userStore = useUserStore()
        
        const response = await axiosInstance.post('/v1/payments/verify', {
          paymentId,
          orderId: this.currentOrder.orderId,
          memberId: userStore.getMemberId
        })

        if (response.data.success) {
          this.paymentStatus = 'success'
          
          // 결제 성공 시 장바구니 비우기
          const cartStore = useCartStore()
          cartStore.clearCart()
          
          // 주문 히스토리에 추가
          this.addToOrderHistory(this.currentOrder, this.paymentResult)
          
        } else {
          throw new Error('결제 검증에 실패했습니다.')
        }
      } catch (error) {
        this.paymentStatus = 'failed'
        this.error = error.message || '결제 검증에 실패했습니다.'
        throw error
      }
    },

    async loadOrderHistory() {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn || !userStore.getMemberId) {
        return
      }

      try {
        const response = await axiosInstance.get(`/v1/orders/history/${userStore.getMemberId}`)
        this.orderHistory = response.data.data || []
      } catch (error) {
        console.error('주문 내역 로드 실패:', error)
        this.orderHistory = []
      }
    },

    addToOrderHistory(order, paymentResult) {
      const historyItem = {
        ...order,
        paymentResult,
        completedAt: new Date().toISOString(),
        status: 'completed'
      }
      
      this.orderHistory.unshift(historyItem)
    },

    clearCurrentOrder() {
      this.currentOrder = null
      this.paymentResult = null
      this.paymentStatus = null
      this.error = null
    },

    clearError() {
      this.error = null
    },

    setPaymentStatus(status) {
      this.paymentStatus = status
    },

    async cancelPayment() {
      if (this.currentOrder && this.currentOrder.orderId) {
        try {
          await axiosInstance.post('/v1/orders/cancel', {
            orderId: this.currentOrder.orderId
          })
        } catch (error) {
          console.error('주문 취소 실패:', error)
        }
      }
      
      this.paymentStatus = 'cancelled'
      this.clearCurrentOrder()
    },

    // 빠른 결제를 위한 헬퍼 메서드
    async quickPayment(cartItems) {
      try {
        await this.createOrder(cartItems)
        return await this.processPayment()
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})