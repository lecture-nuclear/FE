<!-- src/components/home/HomeCarousel.vue -->
<template>
  <div class="home-carousel">
    <div class="carousel-container">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div
          v-for="(item, index) in processedImgs"
          :key="index"
          class="carousel-slide"
          @click="handleSlideClick(item.link)"
        >
          <img :src="item.img" :alt="item.text || `슬라이드 ${index + 1}`" />
          <div v-if="item.text" class="slide-text">
            <h3>{{ item.text }}</h3>
          </div>
        </div>
      </div>
      
      <!-- 이전/다음 버튼 -->
      <button 
        v-if="imgs.length > 1"
        class="carousel-nav prev" 
        @click="prevSlide"
      >
        ❮
      </button>
      <button 
        v-if="imgs.length > 1"
        class="carousel-nav next" 
        @click="nextSlide"
      >
        ❯
      </button>
      
      <!-- 인디케이터 (이미지 위에 표시) -->
      <div v-if="imgs.length > 1" class="carousel-indicators">
        <button 
          v-for="(_, index) in imgs" 
          :key="index"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click="goToSlide(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getFileUrl } from '@/utils/axiosInstance'

const props = defineProps({
  imgs: { 
    type: Array, 
    required: true,
    validator: (value) => value.length > 0 && value.every(item => item.img)
  },
  time: { 
    type: Number, 
    default: 5 
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  sectionIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['navigate'])

const currentIndex = ref(0)
let interval = null

// 이미지 URL 변환 (상대경로 → 절대경로)
const processedImgs = computed(() => {
  return props.imgs.map(item => ({
    ...item,
    img: getFileUrl(item.img)
  }))
})

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.imgs.length
  // 사용자가 수동으로 넘겼을 때 자동 슬라이드 재시작
  if (props.autoPlay) {
    startAutoSlide()
  }
}

const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 ? props.imgs.length - 1 : currentIndex.value - 1
  // 사용자가 수동으로 넘겼을 때 자동 슬라이드 재시작
  if (props.autoPlay) {
    startAutoSlide()
  }
}

const goToSlide = (index) => {
  currentIndex.value = index
  // 사용자가 인디케이터 클릭했을 때 자동 슬라이드 재시작
  if (props.autoPlay) {
    startAutoSlide()
  }
}

const handleSlideClick = (link) => {
  if (link) {
    emit('navigate', link)
  }
}

const startAutoSlide = () => {
  if (!props.autoPlay || props.imgs.length <= 1) return
  
  stopAutoSlide()
  interval = setInterval(() => {
    nextSlide()
  }, props.time * 1000)
}

const stopAutoSlide = () => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

// props.time 변경 시 자동 슬라이드 재시작
watch(() => props.time, () => {
  if (props.autoPlay) {
    startAutoSlide()
  }
})

// 컴포넌트 마운트/언마운트 시 자동 슬라이드 관리
onMounted(() => {
  if (props.autoPlay) {
    startAutoSlide()
  }
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<style scoped>
.home-carousel {
  position: relative;
  width: 100%;
  margin-bottom: 0;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-text {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  text-align: center;
}

.slide-text h3 {
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-nav:hover:not(:disabled) {
  background-color: white;
  transform: translateY(-50%) scale(1.1);
}


.carousel-nav.prev {
  left: 20px;
}

.carousel-nav.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.indicator.active {
  background-color: #3498db;
}

.indicator:hover {
  background-color: #2980b9;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .carousel-container {
    height: 300px;
  }
  
  .slide-text h3 {
    font-size: 1.4rem;
  }
  
  .carousel-nav {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .carousel-nav.prev {
    left: 15px;
  }
  
  .carousel-nav.next {
    right: 15px;
  }
}

@media (max-width: 480px) {
  .home-carousel {
    margin-bottom: 0;
  }
  
  .carousel-container {
    height: 250px;
    border-radius: 8px;
  }
  
  .slide-text h3 {
    font-size: 1.2rem;
  }
  
  .slide-overlay {
    padding: 30px 20px 20px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
}</style>