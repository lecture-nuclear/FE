<!-- src/components/home/HomeLectures.vue -->
<template>
  <div class="home-lectures">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>강의 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadLectures" class="retry-btn">다시 시도</button>
    </div>

    <div v-else-if="loadedLectures.length > 0" class="lectures-grid">
      <LectureItem
        v-for="lecture in loadedLectures"
        :key="lecture.id"
        :lecture="lecture"
        :no-cart-button="false"
        @view-details="handleViewDetails"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <div v-else class="empty-container">
      <p>표시할 강의가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LectureItem from '@/components/lectures/LectureItem.vue'
import { useCartActions } from '@/composables/useCartActions'
import axiosInstance from '@/utils/axiosInstance'

const props = defineProps({
  lectures: {
    type: Array,
    required: true,
    validator: (value) => Array.isArray(value) && value.every((id) => typeof id === 'number'),
  },
  sectionIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const { addToCart } = useCartActions()

const isLoading = ref(false)
const error = ref(null)
const loadedLectures = ref([])

// 강의 정보 로드
const loadLectures = async () => {
  if (!props.lectures || props.lectures.length === 0) {
    loadedLectures.value = []
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // 각 강의 ID별로 API 호출
    const lecturePromises = props.lectures.map(async (lectureId) => {
      try {
        const response = await axiosInstance.get(`/v1/curriculum/lectures/${lectureId}`)
        return response.data.data
      } catch (err) {
        console.warn(`강의 ID ${lectureId} 로드 실패:`, err)
        return null
      }
    })

    const results = await Promise.all(lecturePromises)
    loadedLectures.value = results.filter(Boolean) // null 값 제거

    if (loadedLectures.value.length === 0) {
      error.value = '강의 정보를 찾을 수 없습니다.'
    }
  } catch (err) {
    console.error('강의 목록 로드 실패:', err)
    error.value = '강의 정보를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 강의 상세보기
const handleViewDetails = (lectureId) => {
  router.push(`/lectures/${lectureId}`)
}

// 장바구니에 추가
const handleAddToCart = async (lecture) => {
  try {
    await addToCart(lecture)
  } catch (error) {
    console.error('장바구니 추가 실패:', error)
  }
}

// 컴포넌트 마운트 시 강의 로드
onMounted(() => {
  loadLectures()
})
</script>

<style scoped>
.home-lectures {
  width: 100%;
  margin-bottom: 0;
  padding: 0 20px;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #7f8c8d;
  font-size: 1rem;
}

.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #e74c3c;
}

.error-container p {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #c0392b;
}

.lectures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-container {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .home-lectures {
    padding: 0 15px;
    margin-bottom: 40px;
  }

  .lectures-header {
    margin-bottom: 30px;
  }

  .lectures-header h2 {
    font-size: 1.8rem;
  }

  .lectures-header p {
    font-size: 1rem;
  }

  .lectures-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .home-lectures {
    padding: 0 10px;
    margin-bottom: 30px;
  }

  .lectures-header h2 {
    font-size: 1.6rem;
  }

  .lectures-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .loading-container,
  .error-container,
  .empty-container {
    padding: 40px 15px;
  }
}
</style>
