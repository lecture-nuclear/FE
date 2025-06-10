<!-- src/views/CoursesView.vue -->
<template>
  <div class="courses-page">
    <div class="courses-header">
      <h1>모든 강의</h1>
      <p>다양한 분야의 흥미로운 강의들을 만나보세요.</p>
    </div>

    <!-- 한 페이지당 강의 개수 선택 드롭다운 -->
    <div class="page-size-selector">
      <label for="pageSizeSelect">개수 보기:</label>
      <select
        id="pageSizeSelect"
        v-model="pageSize"
        @change="setPageSize(pageSize)"
        class="page-size-dropdown"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}개</option>
      </select>
    </div>

    <div v-if="loading" class="loading-message">강의 목록을 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }} 강의를 불러올 수 없습니다.
    </div>

    <div v-else>
      <div v-if="lectures.length > 0" class="lecture-grid">
        <LectureItem
          v-for="lecture in lectures"
          :key="lecture.id"
          :lecture="lecture"
          @viewDetails="handleViewDetails"
          @addToCart="handleAddToCartComposables"
        />
      </div>
      <div v-else class="no-lectures-message">아직 등록된 강의가 없습니다.</div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="pagination-btn"
        >
          이전
        </button>
        <span v-for="page in totalPages" :key="page" class="page-number-wrapper">
          <button
            @click="goToPage(page - 1)"
            :class="{ active: currentPage === page - 1 }"
            class="pagination-btn page-number-btn"
          >
            {{ page }}
          </button>
        </span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages - 1"
          class="pagination-btn"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/utils/axiosInstance'
import LectureItem from '@/components/lectures/LectureItem.vue'
import { useRouter } from 'vue-router'
import { useCartActions } from '@/composables/useCartActions' // 새로운 컴포저블 임포트

const router = useRouter()
const { handleAddToCart: handleAddToCartComposables } = useCartActions() // composable 함수 임포트 및 별칭 사용

const lectures = ref([])
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(0)
const pageSize = ref(9)
const totalPages = ref(0)
const totalElements = ref(0)

const pageSizes = [6, 9, 12, 15]

const fetchLectures = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await axiosInstance.get('/v1/curriculum/lectures', {
      params: {
        pageNo: currentPage.value,
        criteria: 'createdAt',
        size: pageSize.value,
      },
    })

    if (response.data && response.data.data && response.data.data.lectures) {
      lectures.value = response.data.data.lectures

      if (
        response.data.data.totalElements !== undefined &&
        response.data.data.totalPages !== undefined
      ) {
        totalElements.value = response.data.data.totalElements
        totalPages.value = response.data.data.totalPages
      } else {
        totalPages.value = Math.max(
          1,
          Math.ceil(lectures.value.length / pageSize.value) +
            (currentPage.value > 0 ? currentPage.value : 0),
        )
      }
    } else {
      lectures.value = []
      errorMessage.value = '강의 목록 응답 형식이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('강의 목록 불러오기 실패:', error)
    errorMessage.value = '강의 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const setPageSize = (size) => {
  currentPage.value = 0
  fetchLectures()
}

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    fetchLectures()
  }
}

const handleViewDetails = (lectureId) => {
  console.log('상세 보기 클릭:', lectureId)
  router.push(`/lectures/${lectureId}`)
}

onMounted(() => {
  fetchLectures()
})
</script>

<style scoped>
.courses-page {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.courses-header {
  text-align: center;
  margin-bottom: 40px;
}

.courses-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.courses-header p {
  font-size: 18px;
  color: #7f8c8d;
}

.page-size-selector {
  position: absolute;
  top: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #555;
  white-space: nowrap;
}

.page-size-selector label {
  font-weight: 600;
  margin-right: 4px;
}

.page-size-dropdown {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f8f8;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23555' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.page-size-dropdown:hover {
  border-color: #ccc;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.page-size-dropdown:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.loading-message,
.error-message,
.no-lectures-message {
  text-align: center;
  font-size: 20px;
  color: #666;
  padding: 50px 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: #e74c3c;
}

.lecture-grid {
  /* 🚩 이전 버전의 그리드 레이아웃으로 복원 */
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3개의 동일한 너비의 열 생성 */
  gap: 25px; /* 아이템 간 간격 */
  padding: 20px 0;
  flex-grow: 1;
  justify-items: center; /* 그리드 아이템들을 셀의 중앙에 정렬 */
}

/* � 개별 미디어 쿼리의 grid-template-columns 복원 */
@media (max-width: 1024px) {
  /* 태블릿 */
  .lecture-grid {
    grid-template-columns: repeat(2, 1fr); /* 2열로 변경 */
    gap: 20px;
  }
  .courses-page {
    padding: 20px;
  }
  .page-size-selector {
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 768px) {
  /* 모바일 */
  .lecture-grid {
    grid-template-columns: 1fr; /* 1열로 변경 */
    gap: 15px;
  }
  .courses-page {
    padding: 15px;
  }
  .courses-header h1 {
    font-size: 30px;
  }
  .courses-header p {
    font-size: 16px;
  }
  .page-size-selector {
    position: static; /* 절대 위치 해제 */
    margin-top: 20px; /* 헤더 아래로 이동 */
    justify-content: center; /* 중앙 정렬 */
  }
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #eee;
  gap: 8px;
}

.pagination-btn {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-number-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-number-btn.active:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
