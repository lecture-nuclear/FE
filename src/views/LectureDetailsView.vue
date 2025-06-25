<!-- src/views/LectureDetailsView.vue -->
<template>
  <div class="lecture-detail-page">
    <div v-if="loading" class="loading-message">강의 정보를 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }}
      <router-link to="/courses" class="back-to-list">강의 목록으로 돌아가기</router-link>
    </div>

    <div v-else-if="lectureDetails" class="detail-container">
      <div class="lecture-header">
        <h1 class="lecture-title">{{ lectureDetails.title }}</h1>
        <div class="lecture-meta">
          <span class="views"
            >조회수:
            {{ lectureDetails.viewCount ? lectureDetails.viewCount.toLocaleString() : 0 }}</span
          >
          <span class="created-at">등록일: {{ formatDate(lectureDetails.createdAt) }}</span>
        </div>
      </div>

      <div class="content-and-sidebar-wrapper">
        <!-- 🚩 데스크톱에서 메인 콘텐츠가 왼쪽에 오도록 먼저 배치 -->
        <div class="main-lecture-content">
          <div v-if="lectureDetails.thumbnailUrl" class="lecture-thumbnail-full">
            <img
              :src="lectureDetails.thumbnailUrl"
              :alt="lectureDetails.title"
              class="thumbnail-img-full"
            />
          </div>
          <div v-else class="lecture-thumbnail-placeholder">
            <span class="placeholder-text">이미지 없음</span>
          </div>

          <p class="lecture-description">{{ lectureDetails.description }}</p>

          <h2 class="section-title">강의 영상 목록</h2>
          <ul class="video-list">
            <li v-for="(video, index) in lectureDetails.videos" :key="index" class="video-item">
              <span class="video-title">{{ index + 1 }}. {{ video.title }}</span>
              <template v-if="video.link">
                <router-link
                  v-if="isPurchased"
                  :to="{
                    name: 'VideoPlayer',
                    params: { lectureId: lectureDetails.id, videoIndex: index },
                    query: { 
                      url: video.link, 
                      title: video.title,
                      lectureTitle: lectureDetails.title
                    }
                  }"
                  class="video-link"
                >
                  영상 보기
                </router-link>
                <button
                  v-else
                  @click="handleUnpurchasedVideoClick"
                  class="video-link disabled"
                  disabled
                >
                  영상 보기
                </button>
              </template>
              <span v-else class="no-link">링크 없음</span>
            </li>
          </ul>
        </div>

        <!-- 🚩 데스크톱에서 구매/장바구니 버튼이 오른쪽에 오도록 배치 -->
        <div class="sidebar-actions">
          <template v-if="userStore.isLoggedIn">
            <template v-if="isPurchased">
              <button @click="handleTakeLecture" class="btn-take-lecture">수강하기</button>
              <div class="last-viewed-info" v-if="lastViewedAt">
                마지막 시청 기록: {{ formatDate(lastViewedAt) }}
              </div>
              <div class="last-viewed-info" v-else>아직 시청 기록이 없습니다.</div>
            </template>
            <template v-else>
              <button @click="handleEnrollLecture" class="btn-enroll">
                강의 구매 ({{
                  lectureDetails.price ? lectureDetails.price.toLocaleString() + '₩' : '무료'
                }})
              </button>
            </template>
          </template>
          <template v-else>
            <button @click="handleEnrollLecture" class="btn-enroll">
              강의 구매 ({{
                lectureDetails.price ? lectureDetails.price.toLocaleString() + '₩' : '무료'
              }})
            </button>
            <p class="login-prompt-text">로그인 후 강의 구매/수강 가능</p>
          </template>

          <button 
            v-if="!isPurchased" 
            @click="handleAddToCart" 
            class="btn-add-cart"
          >
            장바구니 담기
          </button>
        </div>
      </div>

      <!-- 리뷰 작성 섹션 -->
      <div v-if="userStore.isLoggedIn">
        <ReviewWriteComponent 
          :lectureId="lectureDetails.id" 
          @reviewSubmitted="handleReviewSubmitted"
        />
      </div>
      <div v-else class="review-login-required">
        <h3 class="section-title">리뷰 작성</h3>
        <div class="login-message">
          <p>리뷰를 작성하려면 로그인하세요</p>
        </div>
      </div>

      <!-- 리뷰 조회 섹션 -->
      <ReviewListComponent 
        :lectureId="lectureDetails.id" 
        ref="reviewListRef"
      />
    </div>

    <div v-else class="no-data-message">
      강의 정보를 찾을 수 없습니다.
      <router-link to="/courses" class="back-to-list">강의 목록으로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import axiosInstance from '@/utils/axiosInstance'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import ReviewWriteComponent from '@/components/ReviewWriteComponent.vue'
import ReviewListComponent from '@/components/ReviewListComponent.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const lectureDetails = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const isPurchased = ref(false)
const lastViewedAt = ref(null)
const reviewListRef = ref(null)

const fetchLectureDetails = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const lectureId = route.params.id
    if (!lectureId) {
      errorMessage.value = '강의 ID가 없습니다.'
      loading.value = false
      return
    }

    const response = await axiosInstance.get(`/v1/curriculum/lectures/${lectureId}`)

    if (response.data && response.data.data) {
      lectureDetails.value = response.data.data
      if (lectureDetails.value.price === undefined || lectureDetails.value.price === null) {
        lectureDetails.value.price = 0
      }

      // TODO: lectureDetail 조회 시 수강 상태 같이 받기
      if (userStore.isLoggedIn && userStore.id !== null) {
        await fetchPurchaseStatus(lectureId)
      }
    } else {
      errorMessage.value = '강의 정보를 불러오는데 실패했습니다: 응답 형식이 올바르지 않습니다.'
    }
  } catch (error) {
    console.error('강의 상세 정보 로드 실패:', error)
    if (error.response && error.response.status === 404) {
      errorMessage.value = '해당 강의를 찾을 수 없습니다.'
    } else if (error.response) {
      errorMessage.value = `강의 정보를 불러오는데 실패했습니다: ${error.response.status} - ${error.response.statusText || '서버 오류'}`
    } else if (error.request) {
      errorMessage.value = '네트워크 오류: 서버에 연결할 수 없습니다.'
    } else {
      errorMessage.value = '알 수 없는 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}

const fetchPurchaseStatus = async (lectureId) => {
  try {
    const memberId = userStore.getMemberId
    const response = await axiosInstance.post(`/v1/enroll/status`, {
      memberId: memberId,
      lectureId: lectureId,
    }) // TODO: lastViewdAt 말고, watchTimeMillis를 반환함
    console.log(response)

    if (response.data && response.data.data) {
      isPurchased.value = response.data.data.isPurchased || false
      lastViewedAt.value = response.data.data.watchedTimeMillis || null
    } else {
      isPurchased.value = false
      lastViewedAt.value = null
    }
  } catch (error) {
    console.error('구매 상태 로드 실패:', error)
    isPurchased.value = false
    lastViewedAt.value = null
  }
}

const handleReviewSubmitted = () => {
  // 리뷰가 작성되면 리뷰 목록을 새로고침
  if (reviewListRef.value && reviewListRef.value.refreshReviews) {
    reviewListRef.value.refreshReviews()
  }
}

const handleEnrollLecture = async () => {
  if (!userStore.isLoggedIn) {
    alert('강의를 구매하려면 로그인해야 합니다.')
    return
  }

  try {
    const response = await axiosInstance.post('/v1/enroll', {
      memberId: userStore.id,
      lectureId: lectureDetails.value.id,
    })
    if (response.status === 200 || response.status === 201) {
      alert(`${lectureDetails.value.title} 강의 구매가 완료되었습니다!`)
      isPurchased.value = true
      lastViewedAt.value = null
      router.push('/my-courses')
    } else {
      alert('강의 구매에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('강의 구매 실패:', error)
    if (error.response && error.response.status === 409) {
      alert('이미 구매한 강의입니다.')
      isPurchased.value = true
      fetchPurchaseStatus(lectureDetails.value.id)
    } else {
      alert('강의 구매 중 오류가 발생했습니다.')
    }
  }
}

const handleTakeLecture = () => {
  alert(`${lectureDetails.value.title} 강의를 수강합니다! (이동 로직 추가 필요)`)
}

const handleUnpurchasedVideoClick = () => {
  alert('강의를 구매한 후 영상을 시청할 수 있습니다.')
}

// 🚩 장바구니에 강의를 추가하는 함수 (백엔드 PUT 요청)
const handleAddToCart = async () => {
  // 🚩 async 추가
  if (!userStore.isLoggedIn) {
    alert('장바구니에 담으려면 로그인해야 합니다.')
    router.push('/login')
    return
  }
  if (!lectureDetails.value) {
    alert('강의 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  try {
    // 🚩 백엔드 PUT 요청: /api/v1/shopping-cart
    const response = await axiosInstance.put('/v1/shopping-cart', {
      memberId: userStore.id,
      lectureId: lectureDetails.value.id,
    })

    if (response.status === 201) {
      // 200 OK 또는 201 Created 등 성공 응답
      alert(`${lectureDetails.value.title} 강의가 장바구니에 담겼습니다!`)
      // 🚩 장바구니 Pinia 스토어 업데이트 (선택 사항이지만 권장)
      // 백엔드에서 최신 장바구니 데이터를 보내주면 그걸로 업데이트
      // 아니면, 현재 장바구니에 아이템을 수동으로 추가 (중복 방지 로직 필요)
      cartStore.addItem({
        id: lectureDetails.value.id,
        title: lectureDetails.value.title,
        price: lectureDetails.value.price,
        quantity: 1, // 장바구니 추가 시 기본 수량
        image: lectureDetails.value.thumbnailUrl, // 썸네일 URL
      })
    } else {
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('장바구니 추가 실패:', error)
    if (error.response && error.response.status === 409) {
      // 이미 장바구니에 있는 경우 등
      alert('이미 장바구니에 있는 강의입니다.')
    } else {
      alert('장바구니 추가 중 오류가 발생했습니다.')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`
}

onMounted(() => {
  fetchLectureDetails()
})
</script>

<style scoped>
.lecture-detail-page {
  padding: 40px;
  /* max-width: 1200px; */
  /* 🚩 margin: 0 auto; 줄 삭제 */
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #f9f9f9;
}

.loading-message,
.error-message,
.no-data-message {
  text-align: center;
  font-size: 20px;
  color: #666;
  padding: 50px 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-message {
  color: #e74c3c;
}

.back-to-list {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.back-to-list:hover {
  background-color: #0056b3;
}

.detail-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.lecture-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.lecture-title {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
  word-break: keep-all;
}

.lecture-meta {
  font-size: 15px;
  color: #7f8c8d;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.content-and-sidebar-wrapper {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  /* 데스크톱에서는 flex-direction 기본값인 row가 유지됩니다. (main-lecture-content 왼쪽에, sidebar-actions 오른쪽에) */
}

.main-lecture-content {
  flex: 3;
  min-width: 300px;
}

.sidebar-actions {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column; /* 버튼들을 세로로 정렬 */
  gap: 15px;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.lecture-thumbnail-full {
  width: 100%;
  max-width: 800px; /* 썸네일 최대 너비는 1200px의 main-lecture-content에 맞춰 유지 */
  margin: 0 auto 30px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.thumbnail-img-full {
  width: 100%;
  height: auto;
  display: block;
}
.lecture-thumbnail-placeholder {
  width: 100%;
  max-width: 800px;
  height: 300px;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  font-size: 20px;
  border-radius: 8px;
  margin: 0 auto 30px auto;
}

.lecture-description {
  font-size: 18px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.section-title {
  font-size: 24px;
  color: #2c3e50;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  display: inline-block;
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  font-size: 17px;
  color: #555;
}

.video-item:last-child {
  border-bottom: none;
}

.video-title {
  font-weight: 500;
  flex-grow: 1;
}

.video-link {
  background-color: #28a745;
  color: white;
  padding: 6px 12px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
  margin-left: 15px;
  border: none;
  cursor: pointer;
}

.video-link:hover:not(.disabled) {
  background-color: #218838;
}

.video-link.disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.video-link.disabled:hover {
  background-color: #6c757d;
}

.no-link {
  color: #a0a0a0;
  font-size: 14px;
  margin-left: 15px;
}

.btn-enroll,
.btn-take-lecture,
.btn-add-cart {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  width: 100%;
  max-width: 280px;
}

.btn-enroll {
  background-color: #007bff;
  color: white;
}

.btn-enroll:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-take-lecture {
  background-color: #28a745;
  color: white;
}

.btn-take-lecture:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.btn-add-cart {
  background-color: #6c757d;
  color: white;
}

.btn-add-cart:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.last-viewed-info {
  font-size: 16px;
  color: #555;
  text-align: center;
  margin-top: 5px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  width: 100%;
  max-width: 280px;
  box-sizing: border-box;
}

.login-prompt-text {
  font-size: 15px;
  color: #888;
  margin-top: 10px;
  text-align: center;
  width: 100%;
}

.review-login-required {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

.review-login-required .section-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  display: inline-block;
}

.login-message {
  text-align: center;
  padding: 40px 0;
}

.login-message p {
  font-size: 18px;
  color: #666;
  margin: 0;
}


@media (max-width: 1200px) {
  .lecture-detail-page {
    padding: 30px;
  }
}

@media (max-width: 992px) {
  .content-and-sidebar-wrapper {
    flex-direction: column-reverse;
    gap: 20px;
  }
  .main-lecture-content,
  .lecture-thumbnail-full,
  .lecture-thumbnail-placeholder {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .lecture-detail-page {
    padding: 20px;
  }
  .detail-container {
    padding: 20px;
  }
  .lecture-title {
    font-size: 28px;
  }
  .lecture-description {
    font-size: 16px;
  }
  .section-title {
    font-size: 20px;
  }
  .video-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .video-link,
  .no-link {
    margin-left: 0;
    margin-top: 5px;
  }
  .btn-enroll,
  .btn-take-lecture,
  .btn-add-cart,
  .last-viewed-info {
    width: 100%;
    max-width: none;
  }
}
</style>
