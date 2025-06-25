<template>
  <div class="review-write-section">
    <h3 class="section-title">리뷰 작성</h3>

    <div v-if="!isLoggedIn" class="login-required">
      <p>리뷰를 작성하려면 로그인해야 합니다.</p>
    </div>

    <form v-else @submit.prevent="submitReview" class="review-form">
      <!-- 별점과 제목을 한 줄에 배치 -->
      <div class="form-row">
        <!-- 별점 선택 -->
        <div class="form-group rating-group">
          <label class="form-label">별점 *</label>
          <div class="star-rating">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="setRating(star)"
              @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0"
              class="star-button"
              :class="{
                active: star <= rating,
                hover: star <= hoverRating && hoverRating > 0,
              }"
            >
              ★
            </button>
          </div>
        </div>

        <!-- 제목 입력 -->
        <div class="form-group title-group">
          <label for="review-title" class="form-label">제목 *</label>
          <input
            type="text"
            id="review-title"
            v-model="title"
            placeholder="리뷰 제목을 입력하세요 (최대 15자)"
            maxlength="15"
            required
            class="form-input"
          />
          <span class="char-count">{{ title.length }}/15</span>
        </div>
      </div>

      <!-- 내용 입력 -->
      <div class="form-group">
        <label for="review-content" class="form-label">내용 *</label>
        <textarea
          id="review-content"
          v-model="content"
          placeholder="리뷰 내용을 입력하세요 (최대 300자)"
          maxlength="300"
          rows="5"
          required
          class="form-textarea"
        ></textarea>
        <span class="char-count">{{ content.length }}/300</span>
      </div>

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="cancel-btn">취소</button>
        <button type="submit" :disabled="isSubmitting || !isFormValid" class="submit-btn">
          {{ isSubmitting ? '등록 중...' : '리뷰 등록' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import axiosInstance from '@/utils/axiosInstance'

const props = defineProps({
  lectureId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['reviewSubmitted'])

const userStore = useUserStore()

const rating = ref(0)
const hoverRating = ref(0)
const title = ref('')
const content = ref('')
const isSubmitting = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)

const isFormValid = computed(() => {
  return rating.value > 0 && title.value.trim().length > 0 && content.value.trim().length > 0
})

const setRating = (star) => {
  rating.value = star
}

const submitReview = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // TODO: review 쓸 때 user의 id 같이 받아서 누가 작성한 것인지 볼 수 있도록 하기
    const response = await axiosInstance.post(`/v1/curriculum/${props.lectureId}/review`, {
      score: rating.value,
      title: title.value.trim(),
      content: content.value.trim(),
    })

    if (response.status === 200 || response.status === 201) {
      alert('리뷰가 성공적으로 등록되었습니다!')
      resetForm()
      emit('reviewSubmitted')
    }
  } catch (error) {
    console.error('리뷰 등록 실패:', error)
    if (error.response?.status === 409) {
      alert('이미 이 강의에 대한 리뷰를 작성하셨습니다.')
    } else {
      alert('리뷰 등록 중 오류가 발생했습니다.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  rating.value = 0
  hoverRating.value = 0
  title.value = ''
  content.value = ''
}
</script>

<style scoped>
.review-write-section {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  display: inline-block;
}

.login-required {
  text-align: center;
  padding: 15px 0;
}

.login-required p {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.login-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.login-link:hover {
  background-color: #0056b3;
}

.review-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
}

.rating-group {
  flex: 0 0 200px;
  margin-bottom: 0;
}

.title-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.star-rating {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.star-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
}

.star-button.active,
.star-button.hover {
  color: #ffc107;
}

.star-button:hover {
  color: #ffc107;
}

.rating-text {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 15px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #007bff;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .review-write-section {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .rating-group,
  .title-group {
    flex: none;
    margin-bottom: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
