<!-- src/components/home/HomeButton.vue -->
<template>
  <div class="w-full text-center my-5 px-4 md:my-10 md:px-5">
    <button
      class="border-0 rounded-lg font-semibold cursor-pointer transition-all duration-300 shadow-md no-underline inline-block text-center whitespace-nowrap w-full max-w-[300px] hover:opacity-90 md:w-auto md:max-w-none"
      :class="[buttonStyleClass, buttonSizeClass]"
      @click="handleClick"
    >
      {{ text }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  style: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  sectionIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['navigate'])

const buttonStyleClass = computed(() => {
  const styles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-orange-500 text-white hover:bg-orange-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return styles[props.style] || styles.primary
})

const buttonSizeClass = computed(() => {
  const sizes = {
    small: 'py-1.5 px-3.5 text-xs md:py-2 md:px-4 md:text-sm',
    medium: 'py-2.5 px-5 text-sm md:py-3 md:px-6 md:text-base',
    large: 'py-3 px-6 text-base md:py-4 md:px-8 md:text-xl',
  }
  return sizes[props.size] || sizes.medium
})

const handleClick = () => {
  // 페이지 맨 위로 스크롤
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })

  if (props.link) {
    emit('navigate', props.link)
  }
}
</script>
