<!-- src/components/common/AppHeader.vue -->
<template>
  <header
    class="flex justify-between items-center px-7 py-4 bg-gray-50 border-b border-gray-200 shadow-sm sticky top-0 w-full z-[1000] min-h-[70px]"
  >
    <div class="header-left">
      <router-link
        to="/"
        class="flex items-center text-3xl font-extrabold text-gray-800 no-underline whitespace-nowrap px-2.5 py-1.5 rounded-md transition-colors duration-200 hover:bg-gray-100"
      >
        <img src="@/assets/logo.svg" alt="MyService Logo" class="h-9 mr-2.5" />
        <span>Lecture</span>
      </router-link>
    </div>

    <div class="flex items-center gap-7">
      <!-- 햄버거 메뉴 아이콘 (모바일에서만 보임) -->
      <div
        @click="toggleMobileMenu"
        class="hidden max-md:flex flex-col justify-around w-7 h-6 cursor-pointer z-[1001] p-1"
      >
        <div class="w-full h-0.5 bg-gray-600 rounded-sm transition-all duration-300"></div>
        <div class="w-full h-0.5 bg-gray-600 rounded-sm transition-all duration-300"></div>
        <div class="w-full h-0.5 bg-gray-600 rounded-sm transition-all duration-300"></div>
      </div>

      <!-- 네비게이션 링크 (PC에서 보임, 모바일 메뉴에도 포함) -->
      <nav
        :class="[
          'flex gap-6 max-md:hidden max-md:flex-col max-md:absolute max-md:top-full max-md:right-0 max-md:w-full max-md:bg-gray-50 max-md:shadow-lg max-md:py-5 max-md:rounded-b-lg max-md:opacity-0 max-md:invisible max-md:-translate-y-2.5 transition-all duration-300',
          {
            'max-md:!flex max-md:!opacity-100 max-md:!visible max-md:!translate-y-0':
              showMobileMenu,
          },
        ]"
      >
        <router-link
          to="/courses"
          @click="closeMobileMenu"
          class="text-lg text-gray-600 no-underline font-medium px-2.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap hover:text-gray-800 hover:bg-gray-100 max-md:px-5 max-md:py-3 max-md:text-center max-md:w-full max-md:border-b max-md:border-gray-200 max-md:text-[17px] max-md:rounded-none"
          >강의</router-link
        >
        <router-link
          to="/about"
          @click="closeMobileMenu"
          class="text-lg text-gray-600 no-underline font-medium px-2.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap hover:text-gray-800 hover:bg-gray-100 max-md:px-5 max-md:py-3 max-md:text-center max-md:w-full max-md:border-b max-md:border-gray-200 max-md:text-[17px] max-md:rounded-none"
          >About</router-link
        >
        <!-- 로그인한 사용자만 보이는 조건부 메뉴 -->
        <template v-if="userStore.isLoggedIn">
          <!-- 관리자는 "관리⚙️" 탭, 일반 사용자는 "수강 중 강의" 탭 -->
          <router-link
            v-if="isAdmin()"
            to="/admin"
            @click="closeMobileMenu"
            class="text-lg text-gray-600 no-underline font-medium px-2.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap hover:text-gray-800 hover:bg-gray-100 max-md:px-5 max-md:py-3 max-md:text-center max-md:w-full max-md:border-b max-md:border-gray-200 max-md:text-[17px] max-md:rounded-none"
          >
            관리⚙️
          </router-link>
          <router-link
            v-else
            to="/my-courses"
            @click="closeMobileMenu"
            class="text-lg text-gray-600 no-underline font-medium px-2.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap hover:text-gray-800 hover:bg-gray-100 max-md:px-5 max-md:py-3 max-md:text-center max-md:w-full max-md:border-b max-md:border-gray-200 max-md:text-[17px] max-md:rounded-none max-md:last:border-b-0"
          >
            수강 중 강의
          </router-link>
        </template>
      </nav>

      <!-- 사용자 로그인/장바구니 바 -->
      <UserBar />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { isAdmin } from '@/utils/auth'
import UserBar from './UserBar.vue'

const userStore = useUserStore()

const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// 화면 크기 변경 감지 (옵션: CSS로만 처리할 경우 필요 없음)
// const handleResize = () => {
//   if (window.innerWidth > 768) { // 특정 해상도 이상에서는 메뉴 닫기
//     showMobileMenu.value = false;
//   }
// };

onMounted(() => {
  // window.addEventListener('resize', handleResize); // 필요시 리사이즈 이벤트 리스너 추가
})

onBeforeUnmount(() => {
  // window.removeEventListener('resize', handleResize); // 필요시 리사이즈 이벤트 리스너 제거
})
</script>

<style scoped>
/* 모바일에서 로고 크기 조정 */
@media (max-width: 480px) {
  .header-left img {
    height: 30px;
  }
  .header-left a {
    font-size: 24px;
  }
  header {
    padding: 10px 15px;
  }
}
</style>
