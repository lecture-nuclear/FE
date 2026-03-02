<template>
  <div class="my-courses-page">
    <div class="my-courses-header">
      <h1>내 강의</h1>
      <p>현재 수강 중인 강의 목록입니다.</p>
    </div>

    <div v-if="loading" class="loading-message">내 강의 목록을 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }} 강의를 불러올 수 없습니다.
    </div>

    <div v-else>
      <!-- 그리드 뷰 (데스크탑) -->
      <div v-if="myLectures.length > 0 && !isMobile" class="my-lecture-grid">
        <LectureItem
          v-for="lecture in myLectures"
          :key="lecture.id"
          :lecture="lecture"
          :noCartButton="true"
          :showCancelButton="true"
          @viewDetails="handleViewDetails"
          @addToCart="handleAddToCartComposables"
          @cancelEnroll="handleCancelEnroll"
        />
      </div>

      <!-- 리스트 뷰 (모바일) -->
      <div v-else-if="myLectures.length > 0 && isMobile" class="my-lecture-list">
        <LectureListItem
          v-for="lecture in myLectures"
          :key="lecture.id"
          :lecture="lecture"
          :noCartButton="true"
          :showCancelButton="true"
          @viewDetails="handleViewDetails"
          @cancelEnroll="handleCancelEnroll"
        />
      </div>
      <div v-else class="no-lectures-message">아직 수강 중인 강의가 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/utils/axiosInstance'
import LectureItem from '@/components/lectures/LectureItem.vue'
import LectureListItem from '@/components/lectures/LectureListItem.vue'
import { useRouter } from 'vue-router'
import { useCartActions } from '@/composables/useCartActions'
import { useUserStore } from '@/stores/userStore'
import { useMobileView } from '@/composables/useMobileView'

const router = useRouter()
const { handleAddToCart: handleAddToCartComposables } = useCartActions()
const { isMobile } = useMobileView()

const myLectures = ref([])
const loading = ref(true)
const errorMessage = ref('')

const userStore = useUserStore() // user 정보 pinia

const fetchMyLectures = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // 실제 사용자 강의 목록을 가져오는 API 엔드포인트로 변경해야 합니다.
    // 여기서는 예시로 모든 강의 목록을 가져오는 엔드포인트를 사용합니다.
    // 백엔드에서 `my-lectures`와 같은 API를 제공해야 합니다.
    await userStore.checkLoginStatus()
    const response = await axiosInstance.get('/v1/enroll/members/' + userStore.getMemberId)
    console.log(response)

    if (response.data && response.data.data && response.data.data.lectures) {
      myLectures.value = response.data.data.lectures
    } else {
      myLectures.value = []
      errorMessage.value = '내 강의 목록 응답 형식이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('내 강의 목록 불러오기 실패:', error)
    errorMessage.value = '내 강의 목록을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const handleViewDetails = (lectureId) => {
  console.log('내 강의 상세 보기 클릭:', lectureId)
  router.push(`/lectures/${lectureId}`)
}

const handleCancelEnroll = async (lecture) => {
  if (!confirm('정말로 이 강의의 수강을 취소하시겠습니까?')) return

  try {
    await axiosInstance.delete('/v1/enroll', {
      data: { memberId: userStore.getMemberId, lectureId: lecture.id }
    })
    myLectures.value = myLectures.value.filter(l => l.id !== lecture.id)
    alert('수강이 취소되었습니다.')
  } catch (error) {
    console.error('수강 취소 실패:', error)
    alert('수강 취소에 실패했습니다: ' + (error.response?.data?.message || error.message))
  }
}

// `handleAddToCartComposables`는 CoursesView와 동일하게 사용합니다.
// 내 강의 목록에서는 '장바구니 담기' 버튼이 필요 없을 수도 있으나,
// LectureItem 컴포넌트를 재활용하기 위해 그대로 유지합니다.
// 필요시 LectureItem에서 조건부 렌더링으로 숨길 수 있습니다.

onMounted(() => {
  fetchMyLectures()
})
</script>

<style scoped>
.my-courses-page {
  padding: 30px;
  max-width: var(--page-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.my-courses-header {
  text-align: center;
  margin-bottom: 40px;
}

.my-courses-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.my-courses-header p {
  font-size: 18px;
  color: #7f8c8d;
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

.my-lecture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px 0;
  flex-grow: 1;
}

.my-lecture-list {
  padding: 20px 0;
  flex-grow: 1;
}

/* 미디어 쿼리 */
@media (max-width: 1024px) {
  .my-courses-page {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .my-lecture-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .my-courses-page {
    padding: 15px;
  }
  .my-courses-header h1 {
    font-size: 30px;
  }
  .my-courses-header p {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .my-lecture-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>
