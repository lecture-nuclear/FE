import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import JoinView from '../views/JoinView.vue' // 🚩 회원가입 뷰 임포트

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/join', // 🚩 회원가입 라우트 추가
      name: 'join',
      component: JoinView,
    },
  ],
})

export default router
