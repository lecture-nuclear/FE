<template>
  <div class="payment-cancel">
    <div class="cancel-icon">
      <i class="icon-cancel"></i>
    </div>
    <h1 class="cancel-title">결제 취소</h1>
    <p class="cancel-message">
      결제가 취소되었습니다.<br>
      다시 시도하시거나 다른 결제 방법을 이용해 주세요.
    </p>

    <div v-if="cancelReason" class="cancel-reason">
      <p class="reason-text">취소 사유: {{ cancelReason }}</p>
    </div>

    <div class="cancel-actions">
      <button @click="retryPayment" class="primary-button">
        다시 결제하기
      </button>
      <button @click="goToCart" class="secondary-button">
        장바구니로 돌아가기
      </button>
      <button @click="goToHome" class="tertiary-button">
        홈으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from '@/stores/paymentStore'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()

const cancelReason = ref('')

const retryPayment = () => {
  // 세션에서 결제 정보 복원하여 다시 시도
  const sessionData = paymentStore.restorePaymentFromSession()
  if (sessionData && sessionData.orderItems) {
    router.push({
      path: '/payment',
      query: { 
        direct: 'true',
        lectureId: sessionData.orderItems.map(item => item.id).join(',')
      }
    })
  } else {
    router.push('/cart')
  }
}

const goToCart = () => {
  router.push('/cart')
}

const goToHome = () => {
  router.push('/')
}

const processPaymentCancel = () => {
  try {
    // URL에서 취소 사유 확인
    const reason = route.query.reason || route.query.error
    if (reason) {
      cancelReason.value = decodeURIComponent(reason)
    }

    // 팝업 환경인지 확인
    if (window.opener && !window.opener.closed) {
      // 부모 창으로 결제 취소 메시지 전송
      window.opener.postMessage({
        type: 'PAYMENT_CANCELLED',
        reason: cancelReason.value || '사용자가 결제를 취소했습니다.'
      }, window.location.origin)
      
      // 팝업 닫기
      window.close()
      return
    }

    // 결제 상태 업데이트
    paymentStore.cancelKakaoPayment()
    
    // 취소 로그 기록
    console.log('결제 취소됨:', {
      timestamp: new Date().toISOString(),
      reason: cancelReason.value,
      url: window.location.href
    })
  } catch (error) {
    console.error('결제 취소 처리 중 오류:', error)
  }
}

onMounted(() => {
  processPaymentCancel()
})
</script>

<style scoped>
.payment-cancel {
  max-width: 500px;
  margin: 50px auto;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cancel-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #F59E0B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-cancel::before {
  content: '✕';
  color: white;
  font-size: 36px;
  font-weight: bold;
}

.cancel-title {
  color: #92400E;
  font-size: 2rem;
  margin-bottom: 10px;
}

.cancel-message {
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.cancel-reason {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}

.reason-text {
  color: #92400E;
  font-size: 0.9rem;
  margin: 0;
}

.cancel-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.primary-button,
.secondary-button,
.tertiary-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background: #10B981;
  color: white;
}

.primary-button:hover {
  background: #059669;
}

.secondary-button {
  background: #F59E0B;
  color: white;
}

.secondary-button:hover {
  background: #D97706;
}

.tertiary-button {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.tertiary-button:hover {
  background: #E5E7EB;
}

@media (max-width: 768px) {
  .payment-cancel {
    margin: 20px auto;
    padding: 20px 15px;
  }
  
  .cancel-actions {
    gap: 10px;
  }
}
</style>