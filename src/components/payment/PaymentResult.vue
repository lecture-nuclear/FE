<!-- src/components/payment/PaymentResult.vue -->
<template>
  <div class="payment-result">
    <!-- 성공 화면 -->
    <div v-if="isSuccess" class="success-result">
      <div class="success-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      </div>
      
      <h2 class="success-title">결제가 완료되었습니다!</h2>
      <p class="success-message">강의 수강권이 정상적으로 등록되었습니다.</p>
      
      <div class="payment-info">
        <div class="info-section">
          <h3>결제 정보</h3>
          <div class="info-item">
            <span class="label">주문번호</span>
            <span class="value">{{ result.data?.paymentId || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">결제수단</span>
            <span class="value">{{ paymentMethodText }}</span>
          </div>
          <div class="info-item">
            <span class="label">결제금액</span>
            <span class="value amount">{{ formatPrice(totalAmount) }}원</span>
          </div>
          <div class="info-item">
            <span class="label">결제일시</span>
            <span class="value">{{ formattedPaymentDate }}</span>
          </div>
        </div>
      </div>
      
      <div class="success-actions">
        <button @click="$emit('go-to-courses')" class="primary-btn">
          내 강의 보러가기
        </button>
        <button @click="$emit('close')" class="secondary-btn">
          닫기
        </button>
      </div>
    </div>

    <!-- 실패 화면 -->
    <div v-else class="failure-result">
      <div class="failure-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      
      <h2 class="failure-title">결제에 실패했습니다</h2>
      <p class="failure-message">
        {{ result.error || '결제 처리 중 오류가 발생했습니다.' }}
      </p>
      
      <div class="failure-details" v-if="result.data">
        <h3>실패 상세 정보</h3>
        <div class="detail-item" v-if="result.data.code">
          <span class="label">오류 코드</span>
          <span class="value">{{ result.data.code }}</span>
        </div>
        <div class="detail-item" v-if="result.data.message">
          <span class="label">오류 메시지</span>
          <span class="value">{{ result.data.message }}</span>
        </div>
      </div>
      
      <div class="failure-actions">
        <button @click="retryPayment" class="primary-btn">
          다시 시도
        </button>
        <button @click="$emit('close')" class="secondary-btn">
          닫기
        </button>
      </div>
    </div>

    <!-- 고객센터 안내 -->
    <div class="support-info">
      <p>
        결제 관련 문의가 있으시면 
        <a href="mailto:support@example.com">고객센터(support@example.com)</a>로 
        연락주시기 바랍니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { paymentService } from '@/utils/payment'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  isSuccess: {
    type: Boolean,
    default: false
  },
  orderInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'go-to-courses', 'retry-payment'])

const totalAmount = computed(() => {
  return props.result.data?.totalAmount || props.orderInfo.totalAmount || 0
})

const paymentMethodText = computed(() => {
  const method = props.result.data?.payMethod || props.orderInfo.payMethod
  const methodMap = {
    CARD: '신용카드',
    TRANSFER: '실시간 계좌이체',
    EASY_PAY: '간편결제',
    VIRTUAL_ACCOUNT: '가상계좌'
  }
  return methodMap[method] || '기타'
})

const formattedPaymentDate = computed(() => {
  const date = props.result.data?.paidAt || new Date()
  if (typeof date === 'string') {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formatPrice = (price) => {
  return paymentService.formatPrice(price)
}

const retryPayment = () => {
  emit('retry-payment')
}
</script>

<style scoped>
.payment-result {
  text-align: center;
  padding: 30px;
  max-width: 500px;
  margin: 0 auto;
}

/* 성공 화면 스타일 */
.success-result {
  color: #374151;
}

.success-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.success-title {
  color: #10b981;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.success-message {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
}

.payment-info {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
}

.info-section h3 {
  color: #374151;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: #6b7280;
}

.info-item .value {
  color: #374151;
  font-weight: 500;
}

.info-item .value.amount {
  color: #dc2626;
  font-weight: 700;
  font-size: 1.1rem;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 실패 화면 스타일 */
.failure-result {
  color: #374151;
}

.failure-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.failure-title {
  color: #ef4444;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.failure-message {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 25px;
  line-height: 1.5;
}

.failure-details {
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.failure-details h3 {
  color: #dc2626;
  font-size: 1.1rem;
  margin-bottom: 15px;
  text-align: center;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #fca5a5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: #991b1b;
  min-width: 80px;
}

.detail-item .value {
  color: #dc2626;
  text-align: right;
  flex: 1;
  margin-left: 10px;
}

.failure-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 버튼 스타일 */
.primary-btn {
  background-color: #3b82f6;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 140px;
}

.primary-btn:hover {
  background-color: #2563eb;
}

.secondary-btn {
  background-color: #f3f4f6;
  color: #374151;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 140px;
}

.secondary-btn:hover {
  background-color: #e5e7eb;
}

/* 고객센터 안내 */
.support-info {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
}

.support-info a {
  color: #3b82f6;
  text-decoration: none;
}

.support-info a:hover {
  text-decoration: underline;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .payment-result {
    padding: 20px 15px;
  }
  
  .success-actions,
  .failure-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .success-title,
  .failure-title {
    font-size: 1.5rem;
  }
  
  .payment-info,
  .failure-details {
    padding: 20px 15px;
  }
  
  .info-item,
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .info-item .value,
  .detail-item .value {
    text-align: left;
    margin-left: 0;
  }
}

/* 애니메이션 */
.payment-result {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon svg,
.failure-icon svg {
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>