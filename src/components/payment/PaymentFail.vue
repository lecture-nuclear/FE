<template>
  <div class="payment-fail">
    <div class="fail-icon">
      <i class="icon-fail"></i>
    </div>
    <h1 class="fail-title">결제 실패</h1>
    <p class="fail-message">
      결제 처리 중 오류가 발생했습니다.<br>
      잠시 후 다시 시도해 주세요.
    </p>

    <div v-if="errorDetails" class="error-details">
      <h3>오류 상세 정보</h3>
      <div class="error-item">
        <span class="error-label">오류 코드:</span>
        <span class="error-value">{{ errorDetails.code || 'UNKNOWN' }}</span>
      </div>
      <div class="error-item">
        <span class="error-label">오류 메시지:</span>
        <span class="error-value">{{ errorDetails.message || '알 수 없는 오류' }}</span>
      </div>
      <div v-if="errorDetails.timestamp" class="error-item">
        <span class="error-label">발생 시각:</span>
        <span class="error-value">{{ formatDate(errorDetails.timestamp) }}</span>
      </div>
    </div>

    <div class="troubleshooting">
      <h3>문제 해결 방법</h3>
      <ul>
        <li>인터넷 연결 상태를 확인해 주세요</li>
        <li>결제 정보를 다시 확인해 주세요</li>
        <li>잠시 후 다시 시도해 주세요</li>
        <li>문제가 지속되면 고객센터로 문의해 주세요</li>
      </ul>
    </div>

    <div class="fail-actions">
      <button @click="retryPayment" class="primary-button">
        다시 결제하기
      </button>
      <button @click="contactSupport" class="secondary-button">
        고객센터 문의
      </button>
      <button @click="goToCart" class="tertiary-button">
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

const errorDetails = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('ko-KR')
}

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

const contactSupport = () => {
  // 고객센터 연결 (실제 구현 시 고객센터 연락처로 변경)
  const supportEmail = 'support@example.com'
  const subject = encodeURIComponent('결제 오류 문의')
  const body = encodeURIComponent(`결제 오류가 발생했습니다.

오류 정보:
- 오류 코드: ${errorDetails.value?.code || 'UNKNOWN'}
- 오류 메시지: ${errorDetails.value?.message || '알 수 없는 오류'}
- 발생 시각: ${errorDetails.value?.timestamp || new Date().toISOString()}
- URL: ${window.location.href}

추가 설명을 작성해 주세요:
`)
  
  window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
}

const goToCart = () => {
  router.push('/cart')
}

const goToHome = () => {
  router.push('/')
}

const processPaymentFail = () => {
  try {
    // URL에서 오류 정보 추출
    const error = route.query.error
    const errorCode = route.query.error_code
    const errorMessage = route.query.error_msg || route.query.message

    if (error || errorCode || errorMessage) {
      errorDetails.value = {
        code: errorCode || 'PAYMENT_ERROR',
        message: errorMessage || error || '결제 처리 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }
    }

    // 팝업 환경인지 확인
    if (window.opener && !window.opener.closed) {
      // 부모 창으로 결제 실패 메시지 전송
      window.opener.postMessage({
        type: 'PAYMENT_FAILED',
        error: errorDetails.value?.message || '결제에 실패했습니다.'
      }, window.location.origin)
      
      // 팝업 닫기
      window.close()
      return
    }

    // 결제 상태 업데이트
    paymentStore.setPaymentStatus('failed')
    paymentStore.error = errorDetails.value?.message || '결제에 실패했습니다.'
    
    // 실패 로그 기록
    console.error('결제 실패:', {
      errorDetails: errorDetails.value,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('결제 실패 처리 중 오류:', err)
    errorDetails.value = {
      code: 'PROCESSING_ERROR',
      message: '결제 실패 처리 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }
  }
}

onMounted(() => {
  processPaymentFail()
})
</script>

<style scoped>
.payment-fail {
  max-width: 600px;
  margin: 50px auto;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.fail-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #EF4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-fail::before {
  content: '!';
  color: white;
  font-size: 48px;
  font-weight: bold;
}

.fail-title {
  color: #DC2626;
  font-size: 2rem;
  margin-bottom: 10px;
}

.fail-message {
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-details {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.error-details h3 {
  margin: 0 0 15px 0;
  color: #DC2626;
  font-size: 1.1rem;
}

.error-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #FECACA;
}

.error-item:last-child {
  border-bottom: none;
}

.error-label {
  color: #991B1B;
  font-weight: 500;
  min-width: 100px;
}

.error-value {
  color: #DC2626;
  font-weight: 600;
  word-break: break-word;
}

.troubleshooting {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.troubleshooting h3 {
  margin: 0 0 15px 0;
  color: #0369A1;
  font-size: 1.1rem;
}

.troubleshooting ul {
  margin: 0;
  padding-left: 20px;
  color: #1E40AF;
}

.troubleshooting li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.fail-actions {
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
  background: #3B82F6;
  color: white;
}

.secondary-button:hover {
  background: #2563EB;
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
  .payment-fail {
    margin: 20px auto;
    padding: 20px 15px;
  }
  
  .error-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .error-label {
    min-width: auto;
  }
  
  .fail-actions {
    gap: 10px;
  }
}
</style>