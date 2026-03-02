<template>
  <div
    class="bg-white rounded-xl shadow-md overflow-hidden flex w-full transition-all duration-300 hover:bg-gray-50 cursor-pointer mb-3"
    @click="viewDetails"
  >
    <!-- 썸네일 -->
    <div class="flex-none w-[110px] md:w-[180px] overflow-hidden">
      <img :src="thumbnailSrc" :alt="lecture.title" class="w-full h-full object-cover block" />
    </div>

    <!-- 콘텐츠 영역 -->
    <div class="flex flex-col flex-1 px-3 py-3 md:px-5 md:py-4">
      <!-- 제목 + 설명 -->
      <h3
        class="text-sm md:text-lg font-bold text-gray-800 mb-1 leading-snug overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]"
      >
        {{ lecture.title }}
      </h3>
      <p
        class="text-xs md:text-sm text-gray-600 leading-5 mb-2 overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]"
      >
        {{ lecture.description }}
      </p>

      <!-- 가격 + 조회수 + 버튼 (하단) -->
      <div class="flex justify-between items-end mt-auto pt-2 border-t border-gray-200">
        <!-- 가격 + 조회수 -->
        <div class="flex flex-col gap-0.5">
          <span class="text-sm md:text-base font-bold text-blue-600">
            {{ lecture.price ? lecture.price.toLocaleString() + '₩' : '무료' }}
          </span>
          <span class="text-xs text-gray-500">
            조회수: {{ lecture.viewCount ? lecture.viewCount.toLocaleString() : 0 }}
          </span>
        </div>

        <!-- 버튼 -->
        <div class="flex gap-1.5" @click.stop>
          <button
            @click="viewDetails"
            class="px-2.5 py-1.5 md:px-4 md:py-2 border-0 rounded-md cursor-pointer text-xs md:text-sm font-semibold transition-colors duration-300 whitespace-nowrap bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            상세 보기
          </button>
          <button
            v-if="showCancelButton"
            @click="cancelEnroll"
            class="px-2.5 py-1.5 md:px-4 md:py-2 border-0 rounded-md cursor-pointer text-xs md:text-sm font-semibold transition-colors duration-300 whitespace-nowrap bg-red-600 text-white hover:bg-red-700"
          >
            수강 취소
          </button>
          <button
            v-else-if="!noCartButton"
            @click="addToCart"
            class="px-2.5 py-1.5 md:px-4 md:py-2 border-0 rounded-md cursor-pointer text-xs md:text-sm font-semibold transition-colors duration-300 whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
          >
            장바구니
          </button>
          <button
            v-else
            class="px-2.5 py-1.5 md:px-4 md:py-2 border-0 rounded-md text-xs md:text-sm font-semibold whitespace-nowrap bg-gray-500 text-white cursor-default opacity-80"
            disabled
          >
            수강 중
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getFileUrl } from '@/utils/axiosInstance'

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
      thumbnailUrl: '',
    }),
  },
  noCartButton: {
    type: Boolean,
    default: false,
  },
  showCancelButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['viewDetails', 'addToCart', 'cancelEnroll'])

const viewDetails = () => {
  emit('viewDetails', props.lecture.id)
}

const addToCart = () => {
  emit('addToCart', props.lecture)
}

const cancelEnroll = () => {
  emit('cancelEnroll', props.lecture)
}

const thumbnailSrc = computed(() => {
  return (
    getFileUrl(props.lecture.thumbnailUrl) ||
    'https://placehold.co/300x200/4CAF50/FFFFFF?text=Lecture'
  )
})
</script>
