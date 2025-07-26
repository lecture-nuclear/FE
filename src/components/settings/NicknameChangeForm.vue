<template>
  <div class="nickname-change-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="nickname">새 닉네임 *</label>
        <input
          id="nickname"
          v-model="form.nickname"
          type="text"
          class="form-input"
          :class="{ 'error': errors.nickname }"
          placeholder="새로운 닉네임을 입력하세요"
          required
          maxlength="20"
        />
        <div class="input-info">
          <span class="char-count">{{ form.nickname.length }}/20</span>
          <span class="requirements">2자 이상 20자 이하</span>
        </div>
        <span v-if="errors.nickname" class="error-message">
          {{ errors.nickname }}
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
          {{ isLoading ? '변경 중...' : '닉네임 변경' }}
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
import { useUserStore } from '@/stores/userStore'
import axiosInstance from '@/utils/axiosInstance'

const userStore = useUserStore()

// 폼 데이터
const form = ref({
  nickname: ''
})

// 로딩 상태
const isLoading = ref(false)

// 에러 메시지
const errors = ref({})

// 성공/실패 메시지
const message = ref({
  text: '',
  type: '' // 'success' 또는 'error'
})

// 폼 유효성 검사
const isFormValid = computed(() => 
  form.value.nickname.trim().length >= 2 && 
  form.value.nickname.trim().length <= 20 &&
  form.value.nickname.trim() !== userStore.name // 현재 이름과 다른지 확인
)

// 실시간 유효성 검사
watch(() => form.value.nickname, () => {
  if (errors.value.nickname) {
    validateNickname()
  }
  // 메시지 초기화
  if (message.value.text) {
    message.value = { text: '', type: '' }
  }
})

// 유효성 검사 함수
const validateNickname = () => {
  const nickname = form.value.nickname.trim()
  
  if (!nickname) {
    errors.value.nickname = '닉네임을 입력해주세요.'
    return false
  }
  if (nickname.length < 2) {
    errors.value.nickname = '닉네임은 2자 이상이어야 합니다.'
    return false
  }
  if (nickname.length > 20) {
    errors.value.nickname = '닉네임은 20자 이하여야 합니다.'
    return false
  }
  if (nickname === userStore.name) {
    errors.value.nickname = '현재 닉네임과 동일합니다.'
    return false
  }
  
  delete errors.value.nickname
  return true
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateNickname()) {
    return
  }

  isLoading.value = true
  message.value = { text: '', type: '' }
  
  try {
    const response = await axiosInstance.put('/v1/member/name', {
      name: form.value.nickname.trim()
    })
    
    // 사용자 스토어의 이름 업데이트
    userStore.name = form.value.nickname.trim()
    
    message.value = {
      text: '닉네임이 성공적으로 변경되었습니다.',
      type: 'success'
    }
    
    resetForm()
    
  } catch (error) {
    console.error('닉네임 변경 실패:', error)
    
    let errorMessage = '닉네임 변경에 실패했습니다.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
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
  form.value.nickname = ''
  errors.value = {}
  message.value = { text: '', type: '' }
}
</script>

<style scoped>
.nickname-change-form {
  max-width: 400px;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
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

.input-info {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.875rem;
}

.char-count {
  color: #6b7280;
}

.requirements {
  color: #9ca3af;
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
  .form-actions {
    flex-direction: column;
  }
  
  .input-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>