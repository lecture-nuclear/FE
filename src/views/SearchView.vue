<!-- src/views/SearchView.vue -->
<template>
  <div class="search-page">
    <div class="search-header">
      <h1>강의 검색</h1>
      <p>찾으시는 강의의 제목을 입력해주세요.</p>
      <div class="search-input-container">
        <input
          type="text"
          v-model="searchKeyword"
          @keyup.enter="performSearch"
          placeholder="강의 제목을 입력하세요..."
          class="search-input"
        />
        <button @click="performSearch" class="search-button">검색</button>
      </div>
    </div>

    <!-- 한 페이지당 강의 개수 선택 드롭다운 (CoursesView와 동일) -->
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

    <div v-if="loading" class="loading-message">검색 결과를 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }} 검색 결과를 불러올 수 없습니다.
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
      <div v-else class="no-lectures-message">검색 결과가 없습니다.</div>

      <!-- Pagination Controls (CoursesView와 동일) -->
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axiosInstance from '@/utils/axiosInstance'
import LectureItem from '@/components/lectures/LectureItem.vue'
import { useCartActions } from '@/composables/useCartActions'

const route = useRoute()
const router = useRouter()
const { handleAddToCart: handleAddToCartComposables } = useCartActions()

const lectures = ref([])
const loading = ref(false) // 초기 로딩 상태는 false로 설정 (검색 전)
const errorMessage = ref('')
const currentPage = ref(0)
const pageSize = ref(9)
const totalPages = ref(0)
const totalElements = ref(0)
const searchKeyword = ref(route.query.keyword || '') // URL 쿼리 파라미터에서 검색어 가져오기

const pageSizes = [6, 9, 12, 15]

const fetchLectures = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const params = {
      pageNo: currentPage.value,
      criteria: 'createdAt', // 정렬 기준 (필요에 따라 변경 가능)
      size: pageSize.value,
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value // 검색어가 있을 경우 keyword 파라미터 추가
    }

    const response = await axiosInstance.get('/v1/curriculum/lectures', {
      params: params,
    })

    if (response.data && response.data.data && response.data.data.lectures) {
      lectures.value = response.data.data.lectures
      totalElements.value = response.data.data.totalElements || lectures.value.length
      totalPages.value =
        response.data.data.totalPages || Math.ceil(totalElements.value / pageSize.value)
    } else {
      lectures.value = []
      errorMessage.value = '강의 목록 응답 형식이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('강의 목록 불러오기 실패:', error)
    if (error.response && error.response.status === 404 && searchKeyword.value) {
      errorMessage.value = `'${searchKeyword.value}'에 대한 검색 결과를 찾을 수 없습니다.`
    } else if (error.response) {
      errorMessage.value = `강의 목록을 불러오는데 실패했습니다: ${error.response.status} - ${error.response.statusText || '서버 오류'}`
    } else if (error.request) {
      errorMessage.value = '네트워크 오류: 서버에 연결할 수 없습니다.'
    } else {
      errorMessage.value = '알 수 없는 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}

const performSearch = () => {
  currentPage.value = 0 // 새 검색 시 첫 페이지로 초기화
  // URL 쿼리 파라미터 업데이트 (브라우저 히스토리 관리)
  router.push({ path: '/search', query: { keyword: searchKeyword.value } })
  fetchLectures()
}

const setPageSize = () => {
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
  // 컴포넌트 마운트 시 URL 쿼리 파라미터에 따라 검색 실행
  if (searchKeyword.value !== null && searchKeyword.value !== undefined) {
    fetchLectures()
  }
})

// URL 쿼리 파라미터 변경 감지 (뒤로가기/앞으로가기 시에도 검색어 업데이트)
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = newKeyword || ''
    currentPage.value = 0 // 검색어 변경 시 페이지 초기화
    fetchLectures()
  },
)

// 페이지 크기 변경 시 URL 업데이트는 하지 않고 API만 호출
watch(pageSize, () => {
  currentPage.value = 0
  fetchLectures()
})
</script>

<style scoped>
.search-page {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.search-header {
  text-align: center;
  margin-bottom: 40px;
}

.search-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.search-header p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 25px;
}

.search-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex-grow: 1;
  padding: 12px 18px;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
}

.search-button {
  padding: 12px 25px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.search-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
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
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3개의 동일한 너비의 열 생성 */
  gap: 25px; /* 아이템 간 간격 */
  padding: 20px 0;
  flex-grow: 1;
  justify-items: center; /* 그리드 아이템들을 셀의 중앙에 정렬 */
}

@media (max-width: 1024px) {
  .lecture-grid {
    grid-template-columns: repeat(2, 1fr); /* 2열로 변경 */
    gap: 20px;
  }
  .search-page {
    padding: 20px;
  }
  .page-size-selector {
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 768px) {
  .lecture-grid {
    grid-template-columns: 1fr; /* 1열로 변경 */
    gap: 15px;
  }
  .search-page {
    padding: 15px;
  }
  .search-header h1 {
    font-size: 30px;
  }
  .search-header p {
    font-size: 16px;
  }
  .search-input-container {
    flex-direction: column;
    gap: 15px;
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
