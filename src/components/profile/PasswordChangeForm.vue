<template>
  <div class="password-change-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="currentPassword">현재 비밀번호 *</label>
        <div class="input-wrapper">
          <input
            id="currentPassword"
            v-model="form.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.currentPassword }"
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            {{ showCurrentPassword ? '숨기기' : '보기' }}
          </button>
        </div>
        <span v-if="errors.currentPassword" class="error-message">
          {{ errors.currentPassword }}
        </span>
      </div>

      <div class="form-group">
        <label for="newPassword">새 비밀번호 *</label>
        <div class="input-wrapper">
          <input
            id="newPassword"
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.newPassword }"
            placeholder="새 비밀번호를 입력하세요"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showNewPassword = !showNewPassword"
          >
            {{ showNewPassword ? '숨기기' : '보기' }}
          </button>
        </div>
        <div class="password-requirements">
          <p>비밀번호 요구사항:</p>
          <ul>
            <li :class="{ 'valid': hasMinLength }">8자 이상</li>
            <li :class="{ 'valid': hasLetter }">영문 포함</li>
            <li :class="{ 'valid': hasNumber }">숫자 포함</li>
            <li :class="{ 'valid': hasSpecialChar }">특수문자 포함</li>
          </ul>
        </div>
        <span v-if="errors.newPassword" class="error-message">
          {{ errors.newPassword }}
        </span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">새 비밀번호 확인 *</label>
        <div class="input-wrapper">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="새 비밀번호를 다시 입력하세요"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            {{ showConfirmPassword ? '숨기기' : '보기' }}
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="error-message">
          {{ errors.confirmPassword }}
        </span>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="resetForm"
          :disabled="isLoading"
        >
          초기화
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '변경 중...' : '비밀번호 변경' }}
        </button>
      </div>
    </form>

    <!-- 성공/실패 메시지 -->
    <div v-if="message.text" class="message" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axiosInstance from '@/utils/axiosInstance'

// 폼 데이터
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 비밀번호 보기/숨기기 상태
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 로딩 상태
const isLoading = ref(false)

// 에러 메시지
const errors = ref({})

// 성공/실패 메시지
const message = ref({
  text: '',
  type: '' // 'success' 또는 'error'
})

// 비밀번호 검증 computed
const hasMinLength = computed(() => form.value.newPassword.length >= 8)
const hasLetter = computed(() => /[a-zA-Z]/.test(form.value.newPassword))
const hasNumber = computed(() => /\d/.test(form.value.newPassword))
const hasSpecialChar = computed(() => /[@$!%*?&]/.test(form.value.newPassword))

const isPasswordValid = computed(() => 
  hasMinLength.value && hasLetter.value && hasNumber.value && hasSpecialChar.value
)

const isPasswordMatch = computed(() => 
  form.value.newPassword && form.value.newPassword === form.value.confirmPassword
)

const isFormValid = computed(() => 
  form.value.currentPassword && 
  isPasswordValid.value && 
  isPasswordMatch.value
)

// 실시간 유효성 검사
watch(() => form.value.newPassword, () => {
  if (errors.value.newPassword) {
    validateNewPassword()
  }
})

watch(() => form.value.confirmPassword, () => {
  if (errors.value.confirmPassword) {
    validateConfirmPassword()
  }
})

// 유효성 검사 함수들
const validateCurrentPassword = () => {
  if (!form.value.currentPassword) {
    errors.value.currentPassword = '현재 비밀번호를 입력해주세요.'
    return false
  }
  delete errors.value.currentPassword
  return true
}

const validateNewPassword = () => {
  if (!form.value.newPassword) {
    errors.value.newPassword = '새 비밀번호를 입력해주세요.'
    return false
  }
  if (!isPasswordValid.value) {
    errors.value.newPassword = '비밀번호 요구사항을 만족하지 않습니다.'
    return false
  }
  if (form.value.newPassword === form.value.currentPassword) {
    errors.value.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
    return false
  }
  delete errors.value.newPassword
  return true
}

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '비밀번호 확인을 입력해주세요.'
    return false
  }
  if (!isPasswordMatch.value) {
    errors.value.confirmPassword = '새 비밀번호와 일치하지 않습니다.'
    return false
  }
  delete errors.value.confirmPassword
  return true
}

const validateForm = () => {
  const isCurrentValid = validateCurrentPassword()
  const isNewValid = validateNewPassword()
  const isConfirmValid = validateConfirmPassword()
  
  return isCurrentValid && isNewValid && isConfirmValid
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  message.value = { text: '', type: '' }
  
  try {
    const response = await axiosInstance.put('/v1/member/password', {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword
    })
    
    message.value = {
      text: '비밀번호가 성공적으로 변경되었습니다.',
      type: 'success'
    }
    
    resetForm()
    
  } catch (error) {
    console.error('비밀번호 변경 실패:', error)
    
    let errorMessage = '비밀번호 변경에 실패했습니다.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 401) {
      errorMessage = '현재 비밀번호가 올바르지 않습니다.'
    } else if (error.response?.status === 400) {
      errorMessage = '입력한 정보를 확인해주세요.'
    }
    
    message.value = {
      text: errorMessage,
      type: 'error'
    }
  } finally {
    isLoading.value = false
  }
}

// 폼 초기화
const resetForm = () => {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  errors.value = {}
  message.value = { text: '', type: '' }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}
</script>

<style scoped>
.password-change-form {
  max-width: 500px;
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

.password-requirements {
  margin-top: 8px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.password-requirements p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.password-requirements ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.password-requirements li {
  font-size: 0.875rem;
  color: #6b7280;
  position: relative;
  padding-left: 20px;
}

.password-requirements li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #ef4444;
  font-weight: bold;
}

.password-requirements li.valid {
  color: #059669;
}

.password-requirements li.valid::before {
  content: '✓';
  color: #059669;
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
  margin-top: 32px;
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

.btn-primary {
  background-color: #3b82f6;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
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
  .password-requirements ul {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-input {
    padding-right: 70px;
  }
  
  .password-toggle {
    right: 8px;
    font-size: 0.8rem;
  }
}
</style>