<template>
  <div class="join-page">
    <div class="join-container">
      <h2>회원가입</h2>
      <form @submit.prevent="handleJoin">
        <div class="form-group">
          <label for="join-userId">아이디:</label>
          <input type="text" id="join-userId" v-model="userId" required />
        </div>
        <div class="form-group">
          <label for="join-email">이메일:</label>
          <input type="email" id="join-email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="join-name">이름:</label>
          <input type="text" id="join-name" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="join-password">비밀번호:</label>
          <input type="password" id="join-password" v-model="password" required />
        </div>
        <button type="submit" class="join-submit-button">회원가입</button>
      </form>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/utils/axiosInstance' // 백엔드 통신을 위해 axiosInstance 임포트

const router = useRouter()

const userId = ref('') // 🚩 id 대신 userId로 변경
const email = ref('')
const name = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// 회원가입 처리 함수
const handleJoin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axiosInstance.post('/auth/join', {
      // 백엔드 회원가입 API 엔드포인트
      userId: userId.value, // 🚩 userId로 전송
      email: email.value,
      name: name.value,
      password: password.value,
    })

    if (response.status === 200 || response.status === 201) {
      successMessage.value = '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.'
      // 회원가입 성공 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login') // 로그인 페이지 경로로 수정
      }, 2000) // 2초 후 이동
    } else {
      // 서버 응답 상태 코드가 200 또는 201이 아닌 경우
      errorMessage.value = '회원가입 실패: 서버 응답이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('회원가입 요청 실패:', error)
    if (error.response) {
      // 서버에서 에러 응답을 보낸 경우
      if (error.response.status === 409) {
        // 409 Conflict 에러 처리
        // 백엔드에서 보낸 상세 메시지가 있다면 사용, 없다면 기본 메시지 사용
        errorMessage.value =
          error.response.data.message || '회원가입 실패: 이미 사용 중인 정보가 있습니다.'
      } else if (error.response.data && error.response.data.message) {
        errorMessage.value = `회원가입 실패: ${error.response.data.message}`
      } else {
        errorMessage.value = `회원가입 실패 (HTTP ${error.response.status}): ${error.response.statusText}`
      }
    } else if (error.request) {
      // 요청이 전송되었지만 서버로부터 응답을 받지 못한 경우 (네트워크 문제 등)
      errorMessage.value = '네트워크 오류: 서버에 연결할 수 없습니다.'
    } else {
      // 요청 설정 중 오류 발생
      errorMessage.value = '회원가입 처리 중 알 수 없는 오류가 발생했습니다.'
    }
  }
}
</script>

<style scoped>
.join-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px); /* 헤더 높이 제외하고 화면 중앙에 오도록 */
  background-color: #f0f2f5;
  padding: 20px;
}

.join-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 450px;
  max-width: 100%;
  text-align: center;
}

h2 {
  margin-top: 0;
  color: #333;
  font-size: 28px;
  margin-bottom: 30px;
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
  font-size: 15px;
}

.form-group input {
  width: calc(100% - 22px); /* 패딩과 보더 고려 */
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

.join-submit-button {
  background-color: #28a745; /* 녹색 버튼 */
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.join-submit-button:hover {
  background-color: #218838;
}

.error-message {
  color: #dc3545; /* 빨간색 에러 메시지 */
  margin-top: 15px;
  font-size: 14px;
}

.success-message {
  color: #28a745; /* 초록색 성공 메시지 */
  margin-top: 15px;
  font-size: 14px;
  font-weight: bold;
}
</style>
