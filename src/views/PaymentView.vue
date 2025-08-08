<!-- src/views/PaymentView.vue -->
<template>
  <div class="payment-page">
    <div class="payment-header">
      <h1>결제하기</h1>
      <p>선택하신 강의를 안전하게 결제해주세요.</p>
    </div>

    <div v-if="loading" class="loading-message">
      결제 정보를 준비하는 중입니다...
    </div>

    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }}
    </div>

    <!-- 팝업 결제 진행 중 안내 -->
    <div v-else-if="paymentStore.isPopupOpen" class="popup-notice">
      <div class="notice-content">
        <div class="spinner"></div>
        <h3>결제 진행 중</h3>
        <p>별도 창에서 카카오페이 결제를 진행해주세요.</p>
        <p class="sub-text">팝업 창이 보이지 않으면 브라우저 설정을 확인해주세요.</p>
      </div>
    </div>

    <div v-else class="payment-content">
      <!-- 주문 요약 섹션 -->
      <div class="order-summary-section">
        <h2>주문 요약</h2>
        <div v-if="cartItems.length > 0" class="order-items">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="order-item"
          >
            <div class="item-info">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="item-image"
              />
              <div class="item-details">
                <h3 class="item-title">{{ item.title }}</h3>
                <div class="item-price">{{ formatPrice(item.price) }}원</div>
              </div>
            </div>
            <div class="item-quantity">수량: {{ item.quantity }}</div>
          </div>
        </div>
        <div class="order-total">
          <div class="total-row">
            <span class="total-label">총 결제 금액</span>
            <span class="total-amount">{{ formatPrice(totalAmount) }}원</span>
          </div>
        </div>
      </div>

      <!-- 결제 정보 섹션 -->
      <div class="payment-info-section">
        <h2>결제 정보</h2>
        <div class="customer-info">
          <div class="info-item">
            <label>주문자명</label>
            <span>{{ userStore.name }}</span>
          </div>
          <div class="info-item">
            <label>이메일</label>
            <span>{{ userStore.email }}</span>
          </div>
        </div>
      </div>

      <!-- 결제 버튼 섹션 -->
      <div class="payment-action-section">
        <div class="payment-buttons">
          <button @click="goBack" class="cancel-button">취소</button>
          <button 
            @click="processPayment" 
            :disabled="isProcessing || cartItems.length === 0"
            class="payment-button kakao-pay-button"
          >
            <span v-if="isProcessing">카카오페이 결제 준비 중...</span>
            <span v-else>
              <i class="kakao-icon">💳</i>
              카카오페이로 {{ formatPrice(totalAmount) }}원 결제
            </span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from '@/stores/paymentStore'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import { kakaoPayService } from '@/utils/kakaoPayService'
import axiosInstance from '@/utils/axiosInstance'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const errorMessage = ref('')
const isProcessing = ref(false)

// Direct purchase mode state
const isDirectPurchase = ref(false)
const directLecture = ref(null)

const cartItems = computed(() => {
  if (isDirectPurchase.value && directLecture.value) {
    return [directLecture.value]
  }
  return cartStore.items
})

const totalAmount = computed(() => {
  if (isDirectPurchase.value && directLecture.value) {
    return directLecture.value.price || 0
  }
  return cartStore.cartTotalPrice
})

const formatPrice = (price) => {
  return kakaoPayService.formatPrice(price)
}

// Fetch lecture data for direct purchase
const fetchLectureData = async (lectureId) => {
  try {
    const response = await axiosInstance.get(`/v1/curriculum/lectures/${lectureId}`)
    if (response.data && response.data.data) {
      const lecture = response.data.data
      return {
        id: lecture.id,
        title: lecture.title,
        price: lecture.price || 0,
        image: lecture.thumbnailUrl || null
      }
    }
    throw new Error('강의 정보를 불러올 수 없습니다.')
  } catch (error) {
    console.error('강의 정보 조회 실패:', error)
    throw error
  }
}

const processPayment = async () => {
  if (cartItems.value.length === 0) {
    errorMessage.value = '결제할 상품이 없습니다.'
    return
  }

  if (!userStore.isLoggedIn) {
    errorMessage.value = '로그인이 필요합니다.'
    return
  }

  try {
    isProcessing.value = true
    errorMessage.value = ''

    console.log('결제 시작 - 장바구니 아이템:', cartItems.value)
    
    // 카카오페이 팝업 결제 처리
    const result = await paymentStore.quickKakaoPayment(cartItems.value)
    
    console.log('결제 처리 결과:', result)
    
    if (result.popupOpened) {
      console.log('카카오페이 팝업 열림')
      // 팝업이 성공적으로 열렸으면 사용자에게 알림
      errorMessage.value = ''
      
      // 15분 타임아웃 설정
      setTimeout(() => {
        if (paymentStore.isPopupOpen && paymentStore.paymentStatus === 'pending') {
          paymentStore.forceClosePopup()
          errorMessage.value = '결제 시간이 초과되었습니다. 다시 시도해주세요.'
        }
      }, 15 * 60 * 1000) // 15분
    }

  } catch (error) {
    console.error('결제 처리 오류:', error)
    
    if (error.message.includes('팝업이 차단')) {
      errorMessage.value = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.'
    } else {
      errorMessage.value = error.message || '결제 처리 중 오류가 발생했습니다.'
    }
  } finally {
    isProcessing.value = false
  }
}


const goBack = () => {
  router.back()
}

const initializePayment = async () => {
  try {
    loading.value = true
    
    // 사용자 로그인 상태 확인
    await userStore.checkLoginStatus()
    
    if (!userStore.isLoggedIn) {
      errorMessage.value = '로그인이 필요합니다.'
      return
    }

    // Check if this is a direct purchase
    const isDirect = route.query.direct === 'true'
    const lectureId = route.query.lectureId
    
    if (isDirect && lectureId) {
      // Direct purchase mode
      isDirectPurchase.value = true
      directLecture.value = await fetchLectureData(lectureId)
    } else {
      // Cart-based purchase mode
      isDirectPurchase.value = false
      // 장바구니 정보 로드
      await cartStore.loadCartFromBackend()
      
      if (cartItems.value.length === 0) {
        errorMessage.value = '결제할 상품이 없습니다.'
        return
      }
    }

  } catch (error) {
    console.error('결제 초기화 오류:', error)
    errorMessage.value = '결제 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 결제 완료/실패/취소 시 리다이렉트 처리
watch(() => paymentStore.redirectUrl, (newUrl, oldUrl) => {
  console.log('PaymentView - redirectUrl 변경 감지:', { old: oldUrl, new: newUrl })
  if (newUrl) {
    const status = paymentStore.paymentStatus
    console.log(`결제 ${status} - 리다이렉트 실행:`, newUrl)
    
    // 성공 시에만 장바구니 정리
    if (status === 'success') {
      cartStore.clearCart()
      console.log('장바구니 정리 완료')
    }
    
    // 지정된 URL로 리다이렉트
    router.push(newUrl)
    
    // redirectUrl 초기화 (중복 실행 방지)
    paymentStore.redirectUrl = null
  }
})

// 팝업 상태 변화 감지
watch(() => paymentStore.paymentStatus, (newStatus) => {
  console.log('PaymentView - paymentStatus 변경:', newStatus)
})

watch(() => paymentStore.isPopupOpen, (isOpen) => {
  console.log('PaymentView - popupOpen 상태:', isOpen)
})

onMounted(() => {
  initializePayment()
})
</script>

<style scoped>
.payment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.payment-header {
  text-align: center;
  margin-bottom: 40px;
}

.payment-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.payment-header p {
  color: #666;
  font-size: 1.1rem;
}

.loading-message, .error-message {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

.loading-message {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-summary-section,
.payment-info-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-summary-section h2,
.payment-info-section h2 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f3f4f6;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
}

.item-title {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #374151;
}

.item-price {
  color: #059669;
  font-weight: 600;
}

.item-quantity {
  color: #6b7280;
  font-size: 0.9rem;
}

.order-total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
}

.total-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #dc2626;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.info-item label {
  font-weight: 600;
  color: #374151;
}

.info-item span {
  color: #6b7280;
}

.payment-action-section {
  margin-top: 20px;
}

.payment-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cancel-button,
.payment-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #374151;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.payment-button {
  background-color: #fee500;
  color: #3c1e1e;
  min-width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.payment-button:hover:not(:disabled) {
  background-color: #fdd835;
}

.kakao-pay-button {
  background-color: #fee500;
  border: 2px solid #ffeb3b;
}

.kakao-pay-button:hover:not(:disabled) {
  background-color: #fdd835;
  border-color: #fbc02d;
}

.kakao-icon {
  font-size: 1.2rem;
}

.payment-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.popup-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 20px;
}

.notice-content {
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #fee500;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #fee500;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notice-content h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.notice-content p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.sub-text {
  font-size: 0.9rem !important;
  color: #999 !important;
}

@media (max-width: 768px) {
  .payment-page {
    padding: 10px;
  }
  
  .payment-buttons {
    flex-direction: column;
  }
  
  .cancel-button,
  .payment-button {
    width: 100%;
  }
  
  .item-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>