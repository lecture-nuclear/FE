<!-- src/components/modals/LoginModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>로그인</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="id">아이디:</label>
          <input type="text" id="id" v-model="userId" required />
        </div>
        <div class="form-group">
          <label for="password">비밀번호:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <!-- 회원가입 링크 -->
        <div class="register-link-container">
          <router-link to="/join" class="register-link" @click="closeModal">회원가입</router-link>
        </div>
        <button type="submit" class="login-submit-button">로그인</button>
      </form>
      <button @click="closeModal" class="modal-close-button">닫기</button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useUserStore } from '@/stores/userStore'
import axiosInstance from '@/utils/axiosInstance'
import { RouterLink } from 'vue-router'

const emit = defineEmits(['close'])

const userStore = useUserStore()
const userId = ref('')
const password = ref('')
const errorMessage = ref('')

// 로그인 처리 함수
const handleLogin = async () => {
  errorMessage.value = ''
  try {
    // 백엔드 로그인 API 엔드포인트로 userId와 비밀번호 전송
    const response = await axiosInstance.post('/auth/login', {
      userId: userId.value,
      password: password.value,
    })

    if (response.status === 200) {
      // 🚩 로그인 성공 시, 백엔드 응답에서 직접 name과 email을 받아 Pinia 스토어 업데이트
      // 이미지에서 확인한 응답 구조: response.data.data.name, response.data.data.email
      const userData = response.data.data // 'data' 필드 안에 실제 사용자 정보가 있음
      userStore.loginSuccess({ name: userData.name, email: userData.email, id: userData.id }) // userId도 함께 저장
      alert('로그인 성공!')
      closeModal()
    } else {
      errorMessage.value = '로그인 실패: 서버 응답이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('로그인 요청 실패:', error)
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage.value = '아이디 또는 비밀번호가 올바르지 않습니다.'
      } else if (error.response.data && error.response.data.message) {
        errorMessage.value = `로그인 실패: ${error.response.data.message}`
      } else {
        errorMessage.value = '로그인 중 알 수 없는 오류가 발생했습니다.'
      }
    } else if (error.request) {
      errorMessage.value = '네트워크 오류: 서버에 연결할 수 없습니다.'
    } else {
      errorMessage.value = '로그인 처리 중 알 수 없는 오류가 발생했습니다.'
    }
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* 모달 오버레이 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 모달 콘텐츠 박스 스타일 */
.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90%;
  text-align: center;
  position: relative;
}

h2 {
  margin-top: 0;
  color: #333;
  font-size: 24px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

/* 회원가입 링크 컨테이너 스타일 */
.register-link-container {
  text-align: right;
  margin-bottom: 15px;
  font-size: 14px;
}

.register-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.register-link:hover {
  text-decoration: underline;
}

.login-submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  width: 100%;
  margin-top: 0px;
  transition: background-color 0.3s ease;
}

.login-submit-button:hover {
  background-color: #0056b3;
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

.modal-close-button:hover {
  color: #333;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 14px;
}
</style>
