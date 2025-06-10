import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import JoinView from '../views/JoinView.vue'
import AboutView from '../views/AboutView.vue'
import CoursesView from '../views/CoursesView.vue'
import LectureDetailsView from '../views/LectureDetailsView.vue'
import SearchView from '../views/SearchView.vue' // 🚩 추가

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/join',
      name: 'join',
      component: JoinView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/courses',
      name: 'courses',
      component: CoursesView,
    },
    {
      path: '/lectures/:id',
      name: 'lecture-details',
      component: LectureDetailsView,
    },
    {
      path: '/search', // 🚩 검색 페이지 라우트 추가
      name: 'search',
      component: SearchView,
    },
  ],
})

export default router
