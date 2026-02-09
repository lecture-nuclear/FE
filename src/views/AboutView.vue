<!-- src/views/AboutView.vue -->
<template>
  <div class="about-page">
    <div class="about-container">
      <!-- 🚩 백엔드에서 가져온 내용을 표시 -->
      <h1 v-if="title">{{ title }}</h1>
      <div v-html="aboutContent"></div>
      <!-- HTML 내용을 렌더링할 수 있도록 v-html 사용 -->

      <p v-if="!aboutContent && !errorMessage" class="loading-message">
        서비스 내용을 불러오는 중입니다...
      </p>
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <router-link to="/" class="back-to-home">메인으로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // ref, onMounted 임포트
import { RouterLink } from 'vue-router'
import axiosInstance from '@/utils/axiosInstance' // 🚩 axiosInstance 임포트

const aboutContent = ref('') // 🚩 백엔드에서 가져온 내용을 저장할 변수
const title = ref('서비스 소개') // 기본 제목, 필요시 백엔드에서 가져올 수도 있음
const errorMessage = ref('') // 에러 메시지 저장 변수

onMounted(async () => {
  try {
    // 🚩 백엔드 GET 요청: axiosInstance 사용, '/v1/about'으로 요청
    const response = await axiosInstance.get('/v1/about')

    // 응답 데이터 구조에 맞춰 content 필드 접근
    if (response.data && response.data.data && response.data.data.content) {
      aboutContent.value = response.data.data.content
      // 만약 백엔드에서 제목도 준다면: title.value = response.data.data.title;
    } else {
      errorMessage.value = '서비스 내용을 불러오는데 실패했습니다: 응답 형식이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('About 내용 로드 실패:', error)
    if (error.response) {
      errorMessage.value = `서비스 내용을 불러오는데 실패했습니다: ${error.response.status} - ${error.response.statusText || '서버 오류'}`
    } else if (error.request) {
      errorMessage.value = '네트워크 오류: 서버에 연결할 수 없습니다.'
    } else {
      errorMessage.value = '알 수 없는 오류가 발생했습니다.'
    }
  }
})
</script>

<style scoped>
.about-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px); /* 헤더 높이 제외하고 화면 중앙에 오도록 */
  background-color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
}

.about-container {
  background-color: transparent;
  padding: 0;
  text-align: center;
  max-width: var(--page-max-width);
  width: 100%;
}

h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 25px;
  font-weight: 700;
}

/* 🚩 백엔드에서 가져온 content의 스타일 (p 태그로 감싸지 않았을 때 대비) */
.about-container > div {
  font-size: 18px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 30px; /* 마지막 단락 하단 마진 */
}

/* 🚩 에러 및 로딩 메시지 스타일 */
.loading-message,
.error-message {
  font-size: 16px;
  color: #777;
  margin-bottom: 20px;
}
.error-message {
  color: #dc3545; /* 빨간색 에러 메시지 */
}

.back-to-home {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.back-to-home:hover {
  background-color: #0056b3;
}
</style>
