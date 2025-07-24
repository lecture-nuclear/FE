<!-- src/components/payment/PaymentForm.vue -->
<template>
  <div class="payment-form">
    <h3>결제 정보 입력</h3>
    
    <form @submit.prevent="submitPayment">
      <!-- 주문자 정보 섹션 -->
      <div class="form-section">
        <h4>주문자 정보</h4>
        <div class="form-group">
          <label for="customerName">이름 *</label>
          <input
            id="customerName"
            v-model="paymentData.customer.name"
            type="text"
            required
            :disabled="isProcessing"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="customerEmail">이메일 *</label>
          <input
            id="customerEmail"
            v-model="paymentData.customer.email"
            type="email"
            required
            :disabled="isProcessing"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="customerPhone">휴대폰 번호</label>
          <input
            id="customerPhone"
            v-model="paymentData.customer.phone"
            type="tel"
            :disabled="isProcessing"
            placeholder="010-1234-5678"
            class="form-input"
          />
        </div>
      </div>

      <!-- 결제 방법 선택 -->
      <div class="form-section">
        <h4>결제 방법</h4>
        <div class="payment-methods">
          <div class="method-option">
            <input
              id="card"
              v-model="paymentData.payMethod"
              type="radio"
              value="CARD"
              :disabled="isProcessing"
            />
            <label for="card">신용카드</label>
          </div>
          
          <div class="method-option">
            <input
              id="transfer"
              v-model="paymentData.payMethod"
              type="radio"
              value="TRANSFER"
              :disabled="isProcessing"
            />
            <label for="transfer">실시간 계좌이체</label>
          </div>
          
          <div class="method-option">
            <input
              id="kakaopay"
              v-model="paymentData.payMethod"
              type="radio"
              value="EASY_PAY"
              :disabled="isProcessing"
            />
            <label for="kakaopay">간편결제 (카카오페이 등)</label>
          </div>
        </div>
      </div>

      <!-- 결제 금액 확인 -->
      <div class="form-section">
        <h4>결제 금액</h4>
        <div class="amount-summary">
          <div class="amount-row">
            <span>상품 금액</span>
            <span>{{ formatPrice(orderSummary.subtotal) }}원</span>
          </div>
          <div class="amount-row discount-row" v-if="orderSummary.discount > 0">
            <span>할인 금액</span>
            <span>-{{ formatPrice(orderSummary.discount) }}원</span>
          </div>
          <div class="amount-row total-row">
            <span>총 결제 금액</span>
            <span class="total-amount">{{ formatPrice(orderSummary.total) }}원</span>
          </div>
        </div>
      </div>

      <!-- 약관 동의 -->
      <div class="form-section">
        <div class="agreement-section">
          <div class="agreement-item">
            <input
              id="termsAgree"
              v-model="agreements.terms"
              type="checkbox"
              :disabled="isProcessing"
              required
            />
            <label for="termsAgree">
              <a href="#" @click.prevent="showTerms">서비스 이용약관</a>에 동의합니다. (필수)
            </label>
          </div>
          
          <div class="agreement-item">
            <input
              id="privacyAgree"
              v-model="agreements.privacy"
              type="checkbox"
              :disabled="isProcessing"
              required
            />
            <label for="privacyAgree">
              <a href="#" @click.prevent="showPrivacy">개인정보 처리방침</a>에 동의합니다. (필수)
            </label>
          </div>
          
          <div class="agreement-item">
            <input
              id="marketingAgree"
              v-model="agreements.marketing"
              type="checkbox"
              :disabled="isProcessing"
            />
            <label for="marketingAgree">
              마케팅 정보 수신에 동의합니다. (선택)
            </label>
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 결제 버튼 -->
      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          :disabled="isProcessing"
          class="cancel-btn"
        >
          취소
        </button>
        
        <button
          type="submit"
          :disabled="!canSubmit || isProcessing"
          class="submit-btn"
        >
          <span v-if="isProcessing">결제 처리 중...</span>
          <span v-else>{{ formatPrice(orderSummary.total) }}원 결제하기</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { paymentService } from '@/utils/payment'

const props = defineProps({
  orderItems: {
    type: Array,
    required: true
  },
  initialCustomerInfo: {
    type: Object,
    default: () => ({})
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const paymentData = ref({
  customer: {
    name: '',
    email: '',
    phone: ''
  },
  payMethod: 'CARD'
})

const agreements = ref({
  terms: false,
  privacy: false,
  marketing: false
})

const errorMessage = ref('')

// 주문 요약 정보 계산
const orderSummary = computed(() => {
  const subtotal = props.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = 0 // 할인 로직이 있다면 여기에 구현
  const total = subtotal - discount

  return {
    subtotal,
    discount,
    total
  }
})

// 결제 가능 여부 체크
const canSubmit = computed(() => {
  return (
    paymentData.value.customer.name.trim() &&
    paymentData.value.customer.email.trim() &&
    paymentData.value.payMethod &&
    agreements.value.terms &&
    agreements.value.privacy &&
    !props.isProcessing
  )
})

const formatPrice = (price) => {
  return paymentService.formatPrice(price)
}

const submitPayment = () => {
  if (!canSubmit.value) {
    errorMessage.value = '필수 정보를 모두 입력해주세요.'
    return
  }

  try {
    // 결제 데이터 유효성 검사
    const paymentRequest = {
      orderId: paymentService.generateOrderId(),
      orderName: props.orderItems.length === 1 
        ? props.orderItems[0].title 
        : `${props.orderItems[0].title} 외 ${props.orderItems.length - 1}건`,
      totalAmount: orderSummary.value.total,
      currency: 'KRW',
      customer: paymentData.value.customer,
      products: props.orderItems,
      payMethod: paymentData.value.payMethod,
      agreements: agreements.value
    }

    paymentService.validatePaymentData(paymentRequest)
    
    emit('submit', paymentRequest)
    errorMessage.value = ''
    
  } catch (error) {
    errorMessage.value = error.message || '결제 요청 처리 중 오류가 발생했습니다.'
  }
}

const showTerms = () => {
  // 이용약관 팝업 표시 로직
  alert('서비스 이용약관 내용을 표시합니다.')
}

const showPrivacy = () => {
  // 개인정보 처리방침 팝업 표시 로직
  alert('개인정보 처리방침 내용을 표시합니다.')
}

// 초기 고객 정보 설정
watch(() => props.initialCustomerInfo, (newInfo) => {
  if (newInfo) {
    paymentData.value.customer = {
      ...paymentData.value.customer,
      ...newInfo
    }
  }
}, { immediate: true })

onMounted(() => {
  errorMessage.value = ''
})
</script>

<style scoped>
.payment-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.payment-form h3 {
  color: #374151;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.5rem;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h4 {
  color: #374151;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.method-option:hover {
  border-color: #d1d5db;
}

.method-option input[type="radio"] {
  margin: 0;
}

.method-option label {
  cursor: pointer;
  font-weight: 500;
}

.amount-summary {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.discount-row {
  color: #059669;
}

.total-row {
  padding-top: 10px;
  border-top: 2px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.1rem;
}

.total-amount {
  color: #dc2626;
  font-weight: 700;
  font-size: 1.2rem;
}

.agreement-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agreement-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agreement-item input[type="checkbox"] {
  margin: 0;
  width: 18px;
  height: 18px;
}

.agreement-item label {
  font-size: 0.95rem;
  color: #374151;
}

.agreement-item a {
  color: #3b82f6;
  text-decoration: underline;
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fca5a5;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.submit-btn {
  background-color: #dc2626;
  color: white;
  min-width: 200px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #b91c1c;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .payment-form {
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
  
  .payment-methods {
    gap: 8px;
  }
  
  .method-option {
    padding: 10px;
  }
}
</style>