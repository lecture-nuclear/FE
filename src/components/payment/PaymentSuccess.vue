<template>
  <div class="payment-success">
    <div class="success-icon">
      <i class="icon-check"></i>
    </div>
    <h1 class="success-title">결제 완료!</h1>
    <p class="success-message">
      결제가 성공적으로 완료되었습니다.<br>
      구매하신 강의를 바로 수강하실 수 있습니다.
    </p>
    
    <div v-if="paymentResult" class="payment-details">
      <h3>결제 정보</h3>
      <div class="detail-item">
        <span class="label">결제 금액:</span>
        <span class="value">{{ formatPrice(paymentResult.amount?.total || 0) }}원</span>
      </div>
      <div class="detail-item">
        <span class="label">결제 방법:</span>
        <span class="value">카카오페이</span>
      </div>
      <div class="detail-item">
        <span class="label">결제 시각:</span>
        <span class="value">{{ formatDate(paymentResult.approvedAt) }}</span>
      </div>
    </div>

    <div class="success-actions">
      <button @click="goToCourses" class="primary-button">
        내 강의 보러가기
      </button>
      <button @click="goToHome" class="secondary-button">
        홈으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePaymentStore } from '@/stores/paymentStore'
import { kakaoPayService } from '@/utils/kakaoPayService'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()

// 팝업 환경 체크를 즉시 수행 - 다른 모든 로직보다 우선
const isPopup = window.opener && !window.opener.closed
console.log('PaymentSuccess - 즉시 팝업 환경 체크:', isPopup)

const paymentResult = ref(null)
const loading = ref(true)
const error = ref('')

const formatPrice = (price) => {
  return kakaoPayService.formatPrice(price)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('ko-KR')
}

const goToCourses = () => {
  router.push('/courses')
}

const goToHome = () => {
  router.push('/')
}

const processPaymentSuccess = async () => {
  console.log('PaymentSuccess - processPaymentSuccess 시작, 팝업 환경:', isPopup)

  // 팝업 환경이면 즉시 처리 후 종료
  if (isPopup) {
    try {
      const pgToken = route.query.pg_token
      const paymentId = route.query.payment_id
      
      if (!pgToken) {
        console.log('PaymentSuccess - 팝업에서 토큰 없음으로 실패 메시지 전송')
        window.opener.postMessage({
          type: 'PAYMENT_FAILED',
          error: '결제 토큰이 없습니다.',
          redirectUrl: '/payment',
          message: '결제 처리 중 오류가 발생했습니다.'
        }, window.location.origin)
        window.close()
        return
      }

      // URL에서 paymentId를 받았다면 세션에 저장
      if (paymentId) {
        sessionStorage.setItem('current_payment_id', paymentId)
      }

      // 세션에서 결제 정보 복원
      const sessionData = paymentStore.restorePaymentFromSession()
      const finalPaymentId = paymentId || sessionData?.paymentId
      
      if (!finalPaymentId) {
        console.log('PaymentSuccess - 팝업에서 결제 ID 없음으로 실패 메시지 전송')
        window.opener.postMessage({
          type: 'PAYMENT_FAILED',
          error: '결제 ID를 찾을 수 없습니다.',
          redirectUrl: '/payment',
          message: '결제 처리 중 오류가 발생했습니다.'
        }, window.location.origin)
        window.close()
        return
      }

      // 백엔드에서 받은 실제 paymentId로 결제 승인 처리
      const result = await paymentStore.approveKakaoPayment(finalPaymentId, pgToken)
      
      if (result.success) {
        console.log('PaymentSuccess - 팝업에서 성공 메시지 전송')
        window.opener.postMessage({
          type: 'PAYMENT_SUCCESS',
          result: result.data,
          redirectUrl: '/my-courses',
          message: '결제가 성공적으로 완료되었습니다.'
        }, window.location.origin)
      } else {
        console.log('PaymentSuccess - 팝업에서 승인 실패로 실패 메시지 전송')
        window.opener.postMessage({
          type: 'PAYMENT_FAILED',
          error: result.error || '결제 승인에 실패했습니다.',
          redirectUrl: '/payment',
          message: '결제 처리 중 오류가 발생했습니다.'
        }, window.location.origin)
      }
    } catch (err) {
      console.error('PaymentSuccess - 팝업에서 오류 발생:', err)
      console.log('PaymentSuccess - 팝업에서 예외 발생으로 실패 메시지 전송')
      window.opener.postMessage({
        type: 'PAYMENT_FAILED',
        error: err.message,
        redirectUrl: '/payment',
        message: '결제 처리 중 오류가 발생했습니다.'
      }, window.location.origin)
    }
    
    window.close()
    return // 팝업이면 여기서 완전히 종료
  }

  // 일반 환경에서만 실행되는 로직
  try {
    const pgToken = route.query.pg_token
    const paymentId = route.query.payment_id
    
    if (!pgToken) {
      throw new Error('결제 토큰이 없습니다.')
    }

    // URL에서 paymentId를 받았다면 세션에 저장
    if (paymentId) {
      sessionStorage.setItem('current_payment_id', paymentId)
    }

    // 세션에서 결제 정보 복원
    const sessionData = paymentStore.restorePaymentFromSession()
    const finalPaymentId = paymentId || sessionData?.paymentId
    
    if (!finalPaymentId) {
      throw new Error('결제 ID를 찾을 수 없습니다.')
    }

    // 백엔드에서 받은 실제 paymentId로 결제 승인 처리
    const result = await paymentStore.approveKakaoPayment(finalPaymentId, pgToken)
    
    if (result.success) {
      paymentResult.value = result.data
      paymentStore.setPaymentStatus('success')
      // 세션 정리
      paymentStore.clearPaymentSession()
    } else {
      throw new Error(result.error || '결제 승인에 실패했습니다.')
    }
  } catch (err) {
    console.error('결제 승인 처리 중 오류:', err)
    error.value = err.message
    paymentStore.setPaymentStatus('failed')
    
    // 오류 발생 시 실패 페이지로 리다이렉트 (일반 환경에서만)
    setTimeout(() => {
      router.replace('/payment/fail?error=' + encodeURIComponent(err.message))
    }, 3000)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  processPaymentSuccess()
})
</script>

<style scoped>
.payment-success {
  max-width: 500px;
  margin: 50px auto;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-check::before {
  content: '✓';
  color: white;
  font-size: 40px;
  font-weight: bold;
}

.success-title {
  color: #065F46;
  font-size: 2rem;
  margin-bottom: 10px;
}

.success-message {
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.payment-details {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.payment-details h3 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1.2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #E5E7EB;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #6B7280;
  font-weight: 500;
}

.value {
  color: #374151;
  font-weight: 600;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.primary-button,
.secondary-button {
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
  background: #F3F4F6;
  color: #374151;
}

.secondary-button:hover {
  background: #E5E7EB;
}

@media (max-width: 768px) {
  .payment-success {
    margin: 20px auto;
    padding: 20px 15px;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>