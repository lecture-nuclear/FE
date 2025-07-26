<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
</script>

<style>
/* 🚩 전역 스타일 (main.js 또는 main.css에서 임포트될 수 있음) */
/* 웹 페이지 전체에 기본적으로 적용될 스타일 */
body {
  margin: 0; /* 기본 마진 제거 */
  padding: 0; /* 기본 패딩 제거 */
  font-family: Arial, sans-serif; /* 기본 폰트 설정 */
  box-sizing: border-box; /* 모든 요소에 box-sizing 적용 */
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  width: 100%;
}
</style>
