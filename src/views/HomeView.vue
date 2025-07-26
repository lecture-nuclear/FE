<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeContent } from '@/services/homeService'
import { renderHomeContent, getDefaultHomeData } from '@/utils/homeRenderer'

const router = useRouter()

// 반응형 데이터
const homeData = ref(null)
const renderedContent = ref([])
const isLoading = ref(true)
const error = ref(null)

// 홈페이지 콘텐츠 로드
const loadHomeContent = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await getHomeContent()
    
    // 서버 응답에서 home 데이터 파싱
    let parsedData
    if (typeof response.data.home === 'string') {
      // 서버에서 JSON 문자열로 온 경우
      parsedData = JSON.parse(response.data.home)
    } else {
      // 이미 객체인 경우
      parsedData = response.data
    }
    
    homeData.value = parsedData
    renderedContent.value = renderHomeContent(parsedData)
    
    console.log('홈페이지 콘텐츠 로드 완료:', parsedData)
    
  } catch (err) {
    console.error('홈페이지 데이터 로드 실패:', err)
    error.value = '홈페이지 데이터를 불러올 수 없습니다.'
    
    // 기본 데이터로 폴백
    const defaultData = getDefaultHomeData()
    homeData.value = defaultData
    renderedContent.value = renderHomeContent(defaultData)
  } finally {
    isLoading.value = false
  }
}

// 네비게이션 처리
const handleNavigation = (link) => {
  if (link) {
    console.log('네비게이션:', link)
    router.push(link)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadHomeContent()
})
</script>

<template>
  <main class="home-page">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>홈페이지를 준비하고 있습니다...</p>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>페이지를 불러올 수 없습니다</h3>
      <p>{{ error }}</p>
      <button @click="loadHomeContent" class="retry-btn">다시 시도</button>
    </div>
    
    <!-- 홈페이지 콘텐츠 -->
    <template v-else>
      <component 
        v-for="item in renderedContent"
        :key="item.key"
        :is="item.component"
        v-bind="item.props"
        @navigate="handleNavigation"
      />
    </template>
  </main>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* 로딩 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #7f8c8d;
  font-size: 1.1rem;
  text-align: center;
}

/* 에러 스타일 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-container h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.error-container p {
  color: #e74c3c;
  font-size: 1.1rem;
  margin-bottom: 30px;
  max-width: 500px;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #2980b9;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .loading-container,
  .error-container {
    padding: 40px 15px;
    min-height: 300px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-container p {
    font-size: 1rem;
  }
  
  .error-icon {
    font-size: 3rem;
  }
  
  .error-container h3 {
    font-size: 1.3rem;
  }
  
  .error-container p {
    font-size: 1rem;
  }
}
</style>
