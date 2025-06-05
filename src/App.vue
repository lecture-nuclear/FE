<template>
  <div id="app">
    <AppHeader />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
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
  /* 🚩 #app 컨테이너가 100% 너비를 차지하는지 확인 */
  width: 100%;
  box-sizing: border-box;
}

/* RouterView가 나머지 공간을 차지하도록 설정 (선택 사항) */
/* RouterView를 감싸는 별도의 컨테이너를 두는 것이 좋음 */
/*
.router-view-container {
  flex-grow: 1;
}
*/
</style>
