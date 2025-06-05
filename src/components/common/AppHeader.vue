<!-- src/components/common/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.svg" alt="Service Logo" class="logo-img" />
        <span>MyService</span>
      </router-link>
    </div>

    <nav class="header-center">
      <router-link to="/courses" class="nav-item">강의</router-link>
      <router-link to="/about" class="nav-item">About</router-link>
      <!-- 🚩 Search 탭을 일반 nav-item 텍스트로 변경 -->
      <router-link to="/search" class="nav-item">Search</router-link>
    </nav>

    <div class="header-right">
      <UserBar />
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import UserBar from '@/components/common/UserBar.vue'
</script>

<style scoped>
/* 헤더 전체 스타일 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  width: 100%;
  box-sizing: border-box;
}

/* 왼쪽 로고 영역 */
.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 24px;
}

.logo-img {
  height: 30px;
  margin-right: 10px;
}

/* 가운데 내비게이션 영역 */
.header-center {
  display: flex;
  align-items: center;
  gap: 25px;
}

.nav-item {
  text-decoration: none;
  color: #555;
  font-size: 20px; /* 강의, About, Search 모두 이 크기 적용 */
  padding: 5px 0;
  transition: color 0.3s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #007bff;
}

/* 🚩 검색 버튼 관련 스타일 제거 (더 이상 사용하지 않음) */
/* .search-button-link {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
} */

/* .search-icon {
  font-size: 26px;
  color: #555;
  transition: color 0.3s ease;
} */

/* .search-button-link:hover .search-icon {
  color: #007bff;
} */

/* UserBar 컴포넌트가 들어갈 자리 */
.header-right {
  position: relative;
}
</style>
