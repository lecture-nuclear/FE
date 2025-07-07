<!-- src/components/common/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.svg" alt="MyService Logo" class="logo-img" />
        <span>Lecture</span>
      </router-link>
    </div>

    <div class="header-right">
      <!-- 햄버거 메뉴 아이콘 (모바일에서만 보임) -->
      <div class="hamburger-menu" @click="toggleMobileMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

      <!-- 네비게이션 링크 (PC에서 보임, 모바일 메뉴에도 포함) -->
      <nav :class="{ 'nav-open': showMobileMenu }">
        <router-link to="/courses" class="nav-link" @click="closeMobileMenu">강의</router-link>
        <router-link to="/about" class="nav-link" @click="closeMobileMenu">About</router-link>
        <router-link
          :to="{ name: 'search', query: { keyword: '' } }"
          class="nav-link"
          @click="closeMobileMenu"
          >Search</router-link
        >
      </nav>

      <!-- 사용자 로그인/장바구니 바 -->
      <UserBar />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import UserBar from './UserBar.vue'

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
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  min-height: 70px;
}

.header-left .logo {
  display: flex; /* 🚩 로고 이미지와 텍스트를 함께 정렬 */
  align-items: center; /* 🚩 세로 중앙 정렬 */
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap;
}

/* 🚩 로고 이미지 스타일 */
.logo-img {
  height: 35px; /* 로고 이미지 높이 */
  margin-right: 10px; /* 로고 이미지와 텍스트 사이 간격 */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

nav {
  display: flex;
  gap: 25px;
}

.nav-link {
  font-size: 18px;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #007bff;
}

/* 햄버거 메뉴 아이콘 스타일 */
.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  cursor: pointer;
  z-index: 1001;
  padding: 5px;
}

.hamburger-menu .bar {
  width: 100%;
  height: 3px;
  background-color: #555;
  border-radius: 2px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .app-header {
    padding: 15px 20px;
  }

  .header-right {
    gap: 15px;
  }

  .hamburger-menu {
    display: flex;
  }

  nav {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    right: 0;
    width: 100%;
    background-color: #f8f8f8;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 20px 0;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      visibility 0.3s ease;
  }

  nav.nav-open {
    display: flex;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  nav .nav-link {
    padding: 12px 20px;
    text-align: center;
    width: 100%;
    border-bottom: 1px solid #eee;
    font-size: 17px;
  }
  nav .nav-link:last-child {
    border-bottom: none;
  }
}

@media (max-width: 480px) {
  .header-left .logo {
    font-size: 24px;
  }
  .app-header {
    padding: 10px 15px;
  }
  /* 🚩 모바일에서 로고 이미지 크기 조정 */
  .logo-img {
    height: 30px;
  }
}
</style>
