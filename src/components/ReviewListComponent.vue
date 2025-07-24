<template>
  <div class="review-list-section">
    <div class="section-header">
      <h3 class="section-title">리뷰 목록</h3>
    </div>

    <div v-if="loading" class="loading-message">리뷰를 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="fetchReviews" class="retry-btn">다시 시도</button>
    </div>

    <div v-else-if="reviews.length === 0" class="no-reviews">
      <p>아직 등록된 리뷰가 없습니다.</p>
      <p>첫 번째 리뷰를 작성해보세요!</p>
    </div>

    <div v-else class="reviews-container">
      <div class="reviews-summary">
        <span class="total-count">총 {{ totalReviews }}개의 리뷰</span>
        <span class="average-rating" v-if="averageRating > 0">
          평균 {{ averageRating.toFixed(1) }}점
          <span class="stars">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ filled: star <= Math.round(averageRating) }"
            >
              ★
            </span>
          </span>
        </span>
      </div>

      <div class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="review-author-info">
              <span class="review-author">{{ review.name || '익명' }}</span>
              <div class="review-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ filled: star <= review.score }"
                >
                  ★
                </span>
                <span class="rating-number">({{ review.score }}점)</span>
              </div>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>

          <h4 class="review-title">{{ review.title }}</h4>
          <p class="review-content">{{ review.content }}</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <!-- TODO: review 페이지네이션 하기 (페이지 번호 버튼들 추가) -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="pagination-btn"
        >
          이전
        </button>

        <span class="page-info"> {{ currentPage + 1 }} / {{ totalPages }} </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="pagination-btn"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axiosInstance from '@/utils/axiosInstance'

const props = defineProps({
  lectureId: {
    type: [String, Number],
    required: true,
  },
})

const reviews = ref([])
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const totalReviews = ref(0)
const totalPages = ref(0)

// TODO: 리뷰 평균 내는 방식 새로 짜기 (현재는 페이지의 리뷰만으로 계산)
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.score, 0)
  return sum / reviews.value.length
})

const fetchReviews = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axiosInstance.get(`/v1/curriculum/${props.lectureId}/review`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
      },
    })

    if (response.data && response.data.data) {
      const data = response.data.data
      reviews.value = data.reviews || data.content || []
      totalReviews.value = data.totalElements || reviews.value.length
      totalPages.value = data.totalPages || Math.ceil(totalReviews.value / pageSize.value)
    } else {
      reviews.value = []
      totalReviews.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('리뷰 조회 실패:', error)
    errorMessage.value = '리뷰를 불러오는 중 오류가 발생했습니다.'
    reviews.value = []
  } finally {
    loading.value = false
  }
}

const refreshReviews = () => {
  currentPage.value = 0
  fetchReviews()
}

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    fetchReviews()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 외부에서 호출할 수 있도록 expose
defineExpose({
  refreshReviews,
})

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.review-list-section {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  display: inline-block;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #666;
}

.error-message {
  color: #e74c3c;
}

.retry-btn {
  display: block;
  margin: 15px auto 0;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #0056b3;
}

.no-reviews {
  text-align: center;
  padding: 60px 0;
  color: #666;
}

.no-reviews p {
  margin: 5px 0;
  font-size: 16px;
}

.reviews-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.total-count {
  font-weight: 600;
  color: #333;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.stars {
  display: flex;
}

.star {
  color: #ddd;
  font-size: 16px;
}

.star.filled {
  color: #ffc107;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.review-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.review-author-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.review-author {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-rating .star {
  font-size: 14px;
}

.rating-number {
  font-size: 12px;
  color: #666;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 10px 0;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
  white-space: pre-wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .review-list-section {
    padding: 20px;
  }

  .reviews-summary {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .review-header {
    flex-direction: column;
    gap: 10px;
  }

  .review-item {
    padding: 15px;
  }
}
</style>
