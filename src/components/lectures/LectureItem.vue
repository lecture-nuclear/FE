<template>
  <div
    class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 w-full max-w-[320px] m-4 hover:bg-gray-50"
  >
    <div class="w-full h-[200px] overflow-hidden">
      <img :src="thumbnailSrc" :alt="lecture.title" class="w-full h-full object-cover block" />
    </div>
    <div class="p-5 flex flex-col flex-grow">
      <h3
        class="text-xl font-bold text-gray-800 mb-2.5 leading-snug h-[2.8em] overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]"
      >
        {{ lecture.title }}
      </h3>
      <p
        class="text-sm text-gray-600 leading-6 mb-4 h-[3em] overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]"
      >
        {{ lecture.description }}
      </p>
      <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
        <span class="text-lg font-bold text-blue-600">{{
          lecture.price ? lecture.price.toLocaleString() + '₩' : '무료'
        }}</span>
        <span class="text-sm text-gray-500"
          >조회수: {{ lecture.viewCount ? lecture.viewCount.toLocaleString() : 0 }}</span
        >
      </div>
      <div class="flex gap-2.5 mt-5">
        <button
          @click="viewDetails"
          class="flex-1 px-4 py-2.5 border-0 rounded-md cursor-pointer text-[15px] font-semibold transition-colors duration-300 whitespace-nowrap bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          상세 보기
        </button>
        <button
          v-if="showCancelButton"
          @click="cancelEnroll"
          class="flex-1 px-4 py-2.5 border-0 rounded-md cursor-pointer text-[15px] font-semibold transition-colors duration-300 whitespace-nowrap bg-red-600 text-white hover:bg-red-700"
        >
          수강 취소
        </button>
        <button
          v-else-if="!noCartButton"
          @click="addToCart"
          class="flex-1 px-4 py-2.5 border-0 rounded-md cursor-pointer text-[15px] font-semibold transition-colors duration-300 whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
        >
          장바구니 담기
        </button>
        <button
          v-else
          class="flex-1 px-4 py-2.5 border-0 rounded-md cursor-pointer text-[15px] font-semibold transition-colors duration-300 whitespace-nowrap bg-gray-500 text-white cursor-default opacity-80"
          disabled
        >
          수강 중
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { getFileUrl } from '@/utils/axiosInstance'

// 부모 컴포넌트로부터 lecture 객체와 enrolled 여부를 props로 받습니다.
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
      thumbnailUrl: '', // 썸네일 이미지 URL (옵션)
    }),
  },
  noCartButton: {
    type: Boolean,
    default: false, // 기본값은 수강하지 않은 상태
  },
  showCancelButton: {
    type: Boolean,
    default: false,
  },
})

// 부모 컴포넌트로 이벤트를 발생시킵니다.
const emit = defineEmits(['viewDetails', 'addToCart', 'cancelEnroll'])

// '상세 보기' 버튼 클릭 시 이벤트 발생
const viewDetails = () => {
  emit('viewDetails', props.lecture.id)
}

// '장바구니 담기' 버튼 클릭 시 이벤트 발생
const addToCart = () => {
  emit('addToCart', props.lecture) // lecture 객체 전체를 전달
}

// '수강 취소' 버튼 클릭 시 이벤트 발생
const cancelEnroll = () => {
  emit('cancelEnroll', props.lecture)
}

// 썸네일 URL 계산 (상대 경로 → 절대 경로 변환)
const thumbnailSrc = computed(() => {
  return (
    getFileUrl(props.lecture.thumbnailUrl) ||
    'https://placehold.co/300x200/4CAF50/FFFFFF?text=Lecture'
  )
})
</script>
