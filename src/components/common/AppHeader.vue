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
      <router-link to="/about" class="nav-item">Search</router-link>
    </nav>

    <div class="header-right">
      <div class="user-bar-placeholder"></div>
    </div>
  </header>
</template>

<script setup></script>

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
  /* min-width: 900px; */ /* 필요에 따라 유지하거나 제거 */
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
  font-size: 24px; /* 로고 텍스트 크기 */
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
  /* 🚩 글자 크기 조정: 로고 텍스트와 비슷하게 또는 원하는 크기로 설정 */
  font-size: 20px; /* 기존 18px -> 20px 또는 22px로 변경하여 크게 조정 */
  padding: 5px 0;
  transition: color 0.3s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #007bff;
}

/* 🚩 검색 버튼 스타일 */
.search-button-link {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
}

.search-icon {
  /* 🚩 아이콘 크기 조정: nav-item의 폰트 크기에 맞춰 조절 */
  font-size: 26px; /* 기존 24px -> 26px 또는 28px로 변경하여 크게 조정 */
  color: #555;
  transition: color 0.3s ease;
}

.search-button-link:hover .search-icon {
  color: #007bff;
}

/* 오른쪽 User Bar (Placeholder) */
.header-right {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-bar-placeholder {
  height: 30px;
  width: 100px;
  background-color: #e0e0e0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 14px;
}
</style>
