<!-- src/components/home/HomeButton.vue -->
<template>
  <div class="w-full text-center my-10 px-5 max-md:my-7.5 max-md:px-4 max-sm:my-5 max-sm:px-2.5">
    <button
      class="border-0 rounded-lg font-semibold cursor-pointer transition-all duration-300 shadow-md no-underline inline-block text-center whitespace-nowrap hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm max-sm:w-full max-sm:max-w-[300px]"
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
    primary: 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-blue-500/30',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-gray-500/30',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-600/30',
    warning: 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30',
  }
  return styles[props.style] || styles.primary
})

const buttonSizeClass = computed(() => {
  const sizes = {
    small:
      'py-2 px-4 text-sm max-md:py-1.5 max-md:px-3.5 max-md:text-[0.85rem] max-sm:py-2 max-sm:px-4 max-sm:text-xs',
    medium:
      'py-3 px-6 text-base max-md:py-2.5 max-md:px-5 max-md:text-[0.95rem] max-sm:py-2.5 max-sm:px-5 max-sm:text-sm',
    large:
      'py-4 px-8 text-xl max-md:py-3.5 max-md:px-7 max-md:text-lg max-sm:py-3 max-sm:px-6 max-sm:text-base',
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
