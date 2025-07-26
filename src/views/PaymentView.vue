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
            class="payment-button"
          >
            <span v-if="isProcessing">결제 처리 중...</span>
            <span v-else>{{ formatPrice(totalAmount) }}원 결제하기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 결제 결과 모달 -->
    <div v-if="showResultModal" class="payment-result-modal">
      <div class="modal-overlay" @click="closeResultModal"></div>
      <div class="modal-content">
        <PaymentResult 
          :result="paymentResult"
          :is-success="isPaymentSuccessful"
          @close="closeResultModal"
          @go-to-courses="goToCourses"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from '@/stores/paymentStore'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import { paymentService } from '@/utils/payment'
import PaymentResult from '@/components/payment/PaymentResult.vue'
import axiosInstance from '@/utils/axiosInstance'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const errorMessage = ref('')
const isProcessing = ref(false)
const showResultModal = ref(false)
const paymentResult = ref(null)

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
const isPaymentSuccessful = computed(() => paymentStore.isPaymentSuccessful)

const formatPrice = (price) => {
  return paymentService.formatPrice(price)
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

    const result = await paymentStore.quickPayment(cartItems.value)
    paymentResult.value = result
    showResultModal.value = true

  } catch (error) {
    console.error('결제 처리 오류:', error)
    errorMessage.value = error.message || '결제 처리 중 오류가 발생했습니다.'
    paymentResult.value = { success: false, error: error.message }
    showResultModal.value = true
  } finally {
    isProcessing.value = false
  }
}

const closeResultModal = () => {
  showResultModal.value = false
  paymentResult.value = null
  
  if (isPaymentSuccessful.value) {
    router.push('/courses')
  }
}

const goToCourses = () => {
  closeResultModal()
  router.push('/courses')
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
  background-color: #dc2626;
  color: white;
  min-width: 200px;
}

.payment-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.payment-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.payment-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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