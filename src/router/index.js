import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import JoinView from '../views/JoinView.vue'
import AboutView from '../views/AboutView.vue'
import CoursesView from '../views/CoursesView.vue'
import LectureDetailsView from '../views/LectureDetailsView.vue'
import MyCoursesView from '@/views/MyCoursesView.vue'
import UploadCourseView from '@/views/UploadCourseView.vue'
import VideoPlayerView from '@/views/VideoPlayerView.vue'
import CartView from '@/views/CartView.vue'
import AdminView from '@/views/AdminView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
      path: '/search',
      redirect: (to) => {
        // 검색어가 있다면 courses 페이지로 쿼리 파라미터와 함께 리다이렉트
        if (to.query.keyword) {
          return { path: '/courses', query: { keyword: to.query.keyword } }
        }
        // 검색어가 없다면 courses 페이지로 리다이렉트
        return '/courses'
      },
    },
    {
      path: '/my-courses', // 원하는 URL 경로
      name: 'MyCourses',
      component: MyCoursesView,
      // meta: { requiresAuth: true }, // 로그인한 사용자만 접근 가능하도록 설정 (예시)
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminView,
      // meta: { requiresAuth: true, requiresAdmin: true }, // 관리자만 접근 가능
    },
    {
      path: '/admin/upload-course',
      name: 'UploadCourse',
      component: UploadCourseView,
      // meta: { requiresAuth: true, requiresAdmin: true }, // 관리자만 접근 가능
    },
    {
      path: '/lectures/:lectureId/video/:videoId',
      name: 'VideoPlayer',
      component: VideoPlayerView,
      // meta: { requiresAuth: true }, // 로그인한 사용자만 접근 가능
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView,
      meta: { requiresAuth: true }, // 로그인한 사용자만 접근 가능
    },
    {
      path: '/:catchAll(.*)',
      component: NotFoundView,
    }, // 404 notfound 경로 추가 : end
  ],
})

export default router
