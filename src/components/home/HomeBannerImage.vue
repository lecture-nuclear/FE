<!-- src/components/home/HomeBannerImage.vue -->
<template>
  <div class="banner-container">
    <div
      class="home-banner"
      :style="{ backgroundImage: `url(${imageUrl})` }"
      :class="{ clickable: !!link }"
      @click="handleClick"
    >
      <div v-if="text" class="banner-text">
        <h2>{{ text }}</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { getFileUrl } from '@/utils/axiosInstance'

const props = defineProps({
  img: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  sectionIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['navigate'])

// 이미지 URL 변환 (상대경로 → 절대경로)
const imageUrl = computed(() => getFileUrl(props.img))

const handleClick = () => {
  if (props.link) {
    emit('navigate', props.link)
  }
}
</script>

<style scoped>
.banner-container {
  width: 100%;
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.home-banner {
  position: relative;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  border-radius: 12px;
  overflow: hidden;
}

.home-banner.clickable {
  cursor: pointer;
}

.banner-text {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  text-align: center;
  color: white;
}

.banner-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  line-height: 1.2;
}

/* 반응형 디자인: 모바일 (< 768px) */
@media (max-width: 768px) {
  .banner-container {
    padding: 0 15px;
  }

  .home-banner {
    height: 250px;
    margin-bottom: 0;
    border-radius: 8px;
  }

  .banner-text h2 {
    font-size: 1.5rem;
  }
}
</style>
