import { ref, onMounted, onUnmounted } from 'vue'

export function useMobileView() {
  const isMobile = ref(window.innerWidth < 768)

  const update = () => {
    isMobile.value = window.innerWidth < 768
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isMobile }
}
