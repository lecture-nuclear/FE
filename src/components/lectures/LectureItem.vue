<!-- src/components/lectures/LectureItem.vue -->
<template>
  <div class="lecture-item-card">
    <div class="lecture-thumbnail">
      <!-- 강의 썸네일 이미지 (예시 이미지 또는 실제 이미지 URL) -->
      <img
        :src="lecture.imageUrl || 'https://placehold.co/300x200/4CAF50/FFFFFF?text=Lecture'"
        :alt="lecture.title"
        class="thumbnail-img"
      />
    </div>
    <div class="lecture-info">
      <h3 class="lecture-title">{{ lecture.title }}</h3>
      <p class="lecture-description">{{ lecture.description }}</p>
      <div class="lecture-meta">
        <span class="lecture-price">{{
          lecture.price ? lecture.price.toLocaleString() + '₩' : '무료'
        }}</span>
        <span class="lecture-views"
          >조회수: {{ lecture.viewCount ? lecture.viewCount.toLocaleString() : 0 }}</span
        >
      </div>
      <div class="lecture-actions">
        <button @click="viewDetails" class="btn-details">상세 보기</button>
        <button @click="addToCart" class="btn-add-cart">장바구니 담기</button>
        <!-- TODO: 장바구니 api 연결하기 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 부모 컴포넌트로부터 lecture 객체를 props로 받습니다.
const props = defineProps({
  lecture: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      title: '제목 없음',
      description: '설명 없음',
      price: 0,
      viewCount: 0,
      imageUrl: '', // 썸네일 이미지 URL (옵션)
    }),
  },
})

// 부모 컴포넌트로 이벤트를 발생시킵니다.
const emit = defineEmits(['viewDetails', 'addToCart'])

// '상세 보기' 버튼 클릭 시 이벤트 발생
const viewDetails = () => {
  emit('viewDetails', props.lecture.id)
}

// '장바구니 담기' 버튼 클릭 시 이벤트 발생
const addToCart = () => {
  emit('addToCart', props.lecture) // lecture 객체 전체를 전달
}
</script>

<style scoped>
.lecture-item-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  width: 100%; /* 부모 컨테이너에 따라 유동적으로 조절 */
  max-width: 320px; /* 카드 최대 너비 */
  margin: 15px; /* 카드 간 간격 */
}

.lecture-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.lecture-thumbnail {
  width: 100%;
  height: 200px; /* 썸네일 고정 높이 */
  overflow: hidden;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지가 썸네일에 꽉 차도록 */
  display: block;
}

.lecture-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 남은 공간을 채우도록 */
}

.lecture-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
  height: 2.8em; /* 두 줄까지 표시하고 잘라내기 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.lecture-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  height: 3em; /* 세 줄까지 표시하고 잘라내기 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.lecture-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* 하단에 붙도록 */
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.lecture-price {
  font-size: 18px;
  font-weight: bold;
  color: #007bff; /* 파란색 가격 */
}

.lecture-views {
  font-size: 14px;
  color: #888;
}

.lecture-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-details,
.btn-add-cart {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.btn-details {
  background-color: #e9ecef;
  color: #333;
}

.btn-details:hover {
  background-color: #dee2e6;
}

.btn-add-cart {
  background-color: #28a745;
  color: white;
}

.btn-add-cart:hover {
  background-color: #218838;
}
</style>
