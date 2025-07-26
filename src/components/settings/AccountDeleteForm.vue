<template>
  <div class="account-delete-form">
    <div class="warning-section">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h3>회원탈퇴 시 주의사항</h3>
        <ul>
          <li>탈퇴 후에는 <strong>계정을 복구할 수 없습니다</strong></li>
          <li>구매한 강의 수강 기록은 보존되지만 재접근이 불가합니다</li>
          <li>장바구니 내용은 모두 삭제됩니다</li>
          <li>탈퇴 후 동일한 이메일로 재가입이 가능합니다</li>
        </ul>
      </div>
    </div>
    
    <form @submit.prevent="handleDeleteRequest">
      <div class="form-group">
        <label for="password">비밀번호 확인 *</label>
        <div class="input-wrapper">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '숨기기' : '보기' }}
          </button>
        </div>
        <span v-if="errors.password" class="error-message">
          {{ errors.password }}
        </span>
      </div>

      <div class="confirmation-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="form.agreeToDelete"
            class="checkbox"
          />
          <span class="checkbox-text">
            위 주의사항을 모두 확인했으며, 회원탈퇴에 동의합니다.
          </span>
        </label>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="resetForm"
          :disabled="isLoading"
        >
          취소
        </button>
        <button
          type="submit"
          class="btn btn-danger"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '탈퇴 처리 중...' : '회원탈퇴' }}
        </button>
      </div>
    </form>

    <!-- 확인 모달 -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>정말 탈퇴하시겠습니까?</h3>
        </div>
        <div class="modal-body">
          <p>
            <strong>{{ userStore.name }}님</strong>, 정말로 회원탈퇴를 진행하시겠습니까?
          </p>
          <p class="final-warning">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div class="modal-actions">
          <button 
            class="btn btn-secondary" 
            @click="closeConfirmModal"
            :disabled="isDeleting"
          >
            취소
          </button>
          <button 
            class="btn btn-danger" 
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="loading-spinner"></span>
            {{ isDeleting ? '탈퇴 중...' : '네, 탈퇴합니다' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 성공/실패 메시지 -->
    <div v-if="message.text" class="message" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import axiosInstance from '@/utils/axiosInstance'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// 폼 데이터
const form = ref({
  password: '',
  agreeToDelete: false
})

// UI 상태
const showPassword = ref(false)
const showConfirmModal = ref(false)
const isLoading = ref(false)
const isDeleting = ref(false)

// 에러 메시지
const errors = ref({})

// 성공/실패 메시지
const message = ref({
  text: '',
  type: ''
})

// 폼 유효성 검사
const isFormValid = computed(() => 
  form.value.password.trim() && 
  form.value.agreeToDelete
)

// 비밀번호 유효성 검사
const validatePassword = () => {
  if (!form.value.password.trim()) {
    errors.value.password = '비밀번호를 입력해주세요.'
    return false
  }
  delete errors.value.password
  return true
}

// 탈퇴 요청 처리
const handleDeleteRequest = () => {
  if (!validatePassword() || !form.value.agreeToDelete) {
    return
  }
  
  // 확인 모달 표시
  showConfirmModal.value = true
}

// 확인 모달 닫기
const closeConfirmModal = () => {
  showConfirmModal.value = false
}

// 최종 탈퇴 확인
const confirmDelete = async () => {
  isDeleting.value = true
  message.value = { text: '', type: '' }
  
  try {
    await axiosInstance.delete('/v1/member/delete', {
      data: {
        password: form.value.password
      }
    })
    
    // 성공 메시지 표시
    message.value = {
      text: '회원탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.',
      type: 'success'
    }
    
    // 모달 닫기
    showConfirmModal.value = false
    
    // 2초 후 로그아웃 및 홈으로 이동
    setTimeout(async () => {
      try {
        // 로그아웃 처리
        await axiosInstance.post('/auth/logout')
      } catch (error) {
        console.error('로그아웃 오류:', error)
      } finally {
        // 사용자 데이터 및 장바구니 초기화
        userStore.logout()
        cartStore.clearCart()
        
        // 홈페이지로 이동
        router.push('/')
      }
    }, 2000)
    
  } catch (error) {
    console.error('회원탈퇴 실패:', error)
    
    let errorMessage = '회원탈퇴 처리 중 오류가 발생했습니다.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 401) {
      errorMessage = '비밀번호가 올바르지 않습니다.'
    } else if (error.response?.status === 400) {
      errorMessage = '입력한 정보를 확인해주세요.'
    }
    
    message.value = {
      text: errorMessage,
      type: 'error'
    }
    
    showConfirmModal.value = false
  } finally {
    isDeleting.value = false
  }
}

// 폼 초기화
const resetForm = () => {
  form.value = {
    password: '',
    agreeToDelete: false
  }
  errors.value = {}
  message.value = { text: '', type: '' }
  showPassword.value = false
}
</script>

<style scoped>
.account-delete-form {
  max-width: 500px;
}

.warning-section {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-content h3 {
  margin: 0 0 12px 0;
  color: #92400e;
  font-size: 1.1rem;
  font-weight: 600;
}

.warning-content ul {
  margin: 0;
  padding-left: 20px;
  color: #92400e;
}

.warning-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 80px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.confirmation-group {
  margin-bottom: 32px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-text {
  color: #374151;
  font-size: 0.95rem;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  flex: 1;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #374151;
  line-height: 1.5;
}

.final-warning {
  color: #ef4444;
  font-weight: 600;
}

.modal-actions {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions .btn {
  min-height: auto;
  padding: 10px 20px;
}

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .warning-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .warning-icon {
    font-size: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>