import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axiosInstance'
import { kakaoPayService } from '@/utils/kakaoPayService'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    isProcessing: false,
    currentOrder: null,
    currentPayment: null, // 카카오페이 결제 정보
    paymentResult: null,
    orderHistory: [],
    error: null,
    paymentStatus: null, // 'pending', 'success', 'failed', 'cancelled'
    // 팝업 관련 상태
    popupWindow: null,
    popupMonitor: null,
    isPopupOpen: false,
    redirectUrl: null, // 결제 성공 후 리다이렉트할 URL
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
      return kakaoPayService.formatPrice(state.currentOrder.totalAmount) + '원'
    },
  },

  actions: {
    async prepareKakaoPayment(orderItems) {
      const userStore = useUserStore()

      if (!userStore.isLoggedIn || !userStore.getMemberId) {
        throw new Error('로그인이 필요합니다.')
      }

      try {
        this.isProcessing = true
        this.error = null

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0)
        const itemName =
          orderItems.length === 1
            ? orderItems[0].title
            : `${orderItems[0].title} 외 ${orderItems.length - 1}건`

        const paymentData = {
          memberId: userStore.getMemberId,
          lectureIds: orderItems.map((item) => item.id),
          itemName,
          totalAmount,
        }

        // 결제 데이터 유효성 검사
        kakaoPayService.validatePaymentData(paymentData)

        console.log('카카오페이 결제 준비 요청 데이터:', paymentData)

        // 카카오페이 결제 준비 요청
        const result = await kakaoPayService.preparePayment(paymentData)

        console.log('카카오페이 결제 준비 응답:', result)

        if (result.success) {
          this.currentPayment = result.data
          this.paymentStatus = 'pending'

          // 현재 주문 정보 저장 (paymentId 포함)
          this.currentOrder = {
            orderItems,
            totalAmount,
            itemName,
            memberId: userStore.getMemberId,
            paymentId: result.data.paymentId, // 백엔드에서 받은 실제 paymentId 저장
          }

          console.log('결제 준비 완료 - 응답 데이터:', result.data)
          return result.data
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        this.error = error.message || '결제 준비에 실패했습니다.'
        this.paymentStatus = 'failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    async approveKakaoPayment(paymentId, pgToken) {
      try {
        this.isProcessing = true
        this.error = null

        // 카카오페이 결제 승인 요청
        const result = await kakaoPayService.approvePayment(paymentId, pgToken)

        if (result.success) {
          this.paymentResult = result.data
          this.paymentStatus = 'success'

          // 결제 성공 시 장바구니 비우기
          const cartStore = useCartStore()
          cartStore.clearCart()

          // 주문 히스토리에 추가
          this.addToOrderHistory(this.currentOrder, result.data)

          return result
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        this.error = error.message || '결제 승인에 실패했습니다.'
        this.paymentStatus = 'failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    async cancelKakaoPayment() {
      try {
        this.paymentStatus = 'cancelled'
        this.error = '사용자가 결제를 취소했습니다.'
        this.clearCurrentOrder()
      } catch (error) {
        console.error('결제 취소 처리 중 오류:', error)
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
        status: 'completed',
      }

      this.orderHistory.unshift(historyItem)
    },

    clearCurrentOrder() {
      this.currentOrder = null
      this.currentPayment = null
      this.paymentResult = null
      this.paymentStatus = null
      this.error = null
      this.redirectUrl = null // 리다이렉트 URL도 초기화
    },

    clearError() {
      this.error = null
    },

    setPaymentStatus(status) {
      this.paymentStatus = status
    },

    // 카카오페이 빠른 결제를 위한 헬퍼 메서드
    async quickKakaoPayment(cartItems) {
      try {
        const paymentData = await this.prepareKakaoPayment(cartItems)

        console.log('paymentDATA ', paymentData)

        // 카카오페이 결제창으로 리다이렉트
        // 카카오페이 API 응답 필드명 확인: next_redirect_pc_url, nextRedirectPcUrl 등 가능
        const redirectUrl =
          paymentData?.next_redirect_pc_url ||
          paymentData?.nextRedirectPcUrl ||
          paymentData?.pc_url ||
          paymentData?.redirectUrl

        if (paymentData && redirectUrl) {
          // 백엔드에서 받은 실제 paymentId 사용 (가짜 ID 생성 제거)
          if (!paymentData.paymentId) {
            throw new Error('백엔드에서 paymentId를 받지 못했습니다.')
          }

          // 결제 정보를 세션 스토리지에 저장
          sessionStorage.setItem(
            'kakao_payment_data',
            JSON.stringify({
              paymentId: paymentData.paymentId, // 백엔드에서 받은 실제 ID 사용
              orderItems: cartItems,
              totalAmount: cartItems.reduce((sum, item) => sum + item.price, 0),
            }),
          )

          console.log('카카오페이 팝업 URL:', redirectUrl)
          
          // 팝업으로 카카오페이 결제창 열기
          this.popupWindow = kakaoPayService.openKakaoPayPopup(redirectUrl)
          this.isPopupOpen = true

          // 팝업 모니터링 시작
          this.popupMonitor = kakaoPayService.monitorPopup(
            this.popupWindow,
            this.handlePopupClosed.bind(this),
            this.handlePopupMessage.bind(this)
          )

          return { success: true, popupOpened: true }
        } else {
          console.error('카카오페이 응답 데이터:', paymentData)
          throw new Error('카카오페이 결제 URL을 받지 못했습니다.')
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    // 세션에서 결제 정보 복원
    restorePaymentFromSession() {
      try {
        const paymentData = sessionStorage.getItem('kakao_payment_data')
        if (paymentData) {
          const parsed = JSON.parse(paymentData)
          this.currentOrder = {
            orderItems: parsed.orderItems,
            totalAmount: parsed.totalAmount,
            paymentId: parsed.paymentId,
          }
          return parsed
        }
        return null
      } catch (error) {
        console.error('세션에서 결제 정보 복원 실패:', error)
        return null
      }
    },

    // 세션 정리
    clearPaymentSession() {
      sessionStorage.removeItem('kakao_payment_data')
      sessionStorage.removeItem('kakao_pay_return_url')
    },

    // 팝업 관련 메서드들
    handlePopupClosed() {
      console.log('카카오페이 팝업이 닫혔습니다.')
      this.isPopupOpen = false
      this.popupWindow = null
      
      // 팝업 모니터링 정리
      if (this.popupMonitor) {
        this.popupMonitor()
        this.popupMonitor = null
      }

      // 결제가 완료되지 않은 상태에서 팝업이 닫혔다면 취소로 처리
      if (this.paymentStatus === 'pending') {
        this.cancelKakaoPayment()
      }
    },

    handlePopupMessage(data) {
      console.log('PaymentStore - 팝업 메시지 수신:', data)
      
      if (data.type === 'PAYMENT_SUCCESS') {
        console.log('PaymentStore - 결제 성공 처리 시작')
        this.paymentResult = data.result
        this.paymentStatus = 'success'
        this.redirectUrl = data.redirectUrl
        console.log('PaymentStore - redirectUrl 설정:', this.redirectUrl)
        this.closePopup()
        console.log('PaymentStore - 결제 성공 처리 완료')
      } else if (data.type === 'PAYMENT_FAILED') {
        console.log('PaymentStore - 결제 실패 처리')
        this.error = data.error
        this.paymentStatus = 'failed'
        this.redirectUrl = data.redirectUrl // 실패 시에도 리다이렉트 URL 저장
        console.log('PaymentStore - 실패 redirectUrl 설정:', this.redirectUrl)
        this.closePopup()
      } else if (data.type === 'PAYMENT_CANCELLED') {
        console.log('PaymentStore - 결제 취소 처리')
        this.cancelKakaoPayment()
        this.redirectUrl = data.redirectUrl // 취소 시에도 리다이렉트 URL 저장
        console.log('PaymentStore - 취소 redirectUrl 설정:', this.redirectUrl)
        this.closePopup()
      }
    },

    closePopup() {
      if (this.popupWindow && !this.popupWindow.closed) {
        this.popupWindow.close()
      }
      this.handlePopupClosed()
    },

    // 강제로 팝업 닫기 (타임아웃 등)
    forceClosePopup() {
      this.closePopup()
      this.error = '결제 시간이 초과되었습니다.'
      this.paymentStatus = 'failed'
    },
  },
})
