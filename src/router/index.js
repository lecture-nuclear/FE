import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import JoinView from '../views/JoinView.vue'
import AboutView from '../views/AboutView.vue'
import CoursesView from '../views/CoursesView.vue'
import LectureDetailsView from '../views/LectureDetailsView.vue'
import SearchView from '../views/SearchView.vue'
import MyCoursesView from '@/views/MyCoursesView.vue'
import UploadCourseView from '@/views/UploadCourseView.vue'
import VideoPlayerView from '@/views/VideoPlayerView.vue'

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
      name: 'search',
      component: SearchView,
    },
    {
      path: '/my-courses', // 원하는 URL 경로
      name: 'MyCourses',
      component: MyCoursesView,
      // meta: { requiresAuth: true }, // 로그인한 사용자만 접근 가능하도록 설정 (예시)
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
  ],
})

export default router
