<!-- src/views/AdminView.vue -->
<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1 class="page-title">
        <PhGearSix :size="32" weight="duotone" />
        <span>관리자 페이지</span>
      </h1>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="admin-main">
      <!-- 왼쪽 사이드바 탭 네비게이션 -->
      <div class="admin-sidebar">
        <nav class="sidebar-nav">
          <button
            @click="activeTab = 'users'"
            :class="{ active: activeTab === 'users' }"
            class="sidebar-tab"
          >
            <PhUsersThree class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">사용자 관리</span>
          </button>
          <button
            @click="activeTab = 'upload'"
            :class="{ active: activeTab === 'upload' }"
            class="sidebar-tab"
          >
            <PhBookOpenText class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">강의 업로드</span>
          </button>
          <button
            @click="activeTab = 'home'"
            :class="{ active: activeTab === 'home' }"
            class="sidebar-tab"
          >
            <PhHouseLine class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">홈화면 꾸미기</span>
          </button>
          <button
            @click="activeTab = 'about'"
            :class="{ active: activeTab === 'about' }"
            class="sidebar-tab"
          >
            <PhFileText class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">서비스 소개 편집</span>
          </button>
        </nav>
      </div>

      <!-- 오른쪽 메인 콘텐츠 -->
      <div class="admin-content">
        <!-- 사용자 관리 탭 -->
        <UserManagement v-if="activeTab === 'users'" />

        <!-- 강의 업로드 탭 -->
        <UploadCourse v-if="activeTab === 'upload'" />

        <!-- 홈화면 꾸미기 탭 -->
        <HomeContentManager v-if="activeTab === 'home'" />

        <!-- 서비스 소개 편집 탭 -->
        <AboutEditor v-if="activeTab === 'about'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhBookOpenText,
  PhFileText,
  PhGearSix,
  PhHouseLine,
  PhUsersThree,
} from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/userStore'
import { isAdmin } from '@/utils/auth'
import UserManagement from '@/components/admin/UserManagement.vue'
import HomeContentManager from '@/components/admin/home/HomeContentManager.vue'
import AboutEditor from '@/components/admin/AboutEditor.vue'
import UploadCourse from '@/views/UploadCourseView.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 유효한 탭 목록
const validTabs = ['users', 'upload', 'home', 'about']

// URL 쿼리 파라미터에서 탭 상태 관리
const activeTab = computed({
  get() {
    const tab = route.query.tab || 'users'
    return validTabs.includes(tab) ? tab : 'users'
  },
  set(newTab) {
    if (validTabs.includes(newTab)) {
      router.push({
        path: route.path,
        query: { ...route.query, tab: newTab },
      })
    }
  },
})

// 관리자가 아닌 경우 접근 차단
onMounted(async () => {
  try {
    // 로그인 상태 확인 후 관리자 검사
    await userStore.checkLoginStatus()

    if (!userStore.isLoggedIn || !isAdmin()) {
      alert('관리자만 접근할 수 있습니다.')
      router.push('/')
    }
  } catch (error) {
    console.error('로그인 상태 확인 실패:', error)
    alert('관리자만 접근할 수 있습니다.')
    router.push('/')
  }
})
</script>

<style scoped>
.admin-page {
  padding: 30px;
  max-width: var(--page-max-width);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
  background-color: #ffffff;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.page-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.admin-header p {
  font-size: 18px;
  color: #7f8c8d;
}

/* 메인 컨텐츠 영역 */
.admin-main {
  display: flex;
  gap: 30px;
  min-height: 600px;
}

/* 왼쪽 사이드바 */
.admin-sidebar {
  width: 280px;
  min-width: 280px;
  background-color: transparent;
  padding: 20px 0;
  height: fit-content;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-tab {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 24px;
  border: none;
  background-color: transparent;
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  border-left: 4px solid transparent;
}

.sidebar-tab:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
  border-left-color: #ddd;
}

.sidebar-tab.active {
  background-color: #f0f8ff;
  color: #3498db;
  border-left-color: #3498db;
  font-weight: 700;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  flex-shrink: 0;
}

.tab-text {
  flex: 1;
}

/* 오른쪽 메인 콘텐츠 */
.admin-content {
  flex: 1;
  background-color: transparent;
  min-height: 600px;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .admin-main {
    gap: 20px;
  }

  .admin-sidebar {
    width: 240px;
    min-width: 240px;
  }

  .sidebar-tab {
    padding: 14px 20px;
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .admin-header h1 {
    font-size: 30px;
  }

  .admin-header p {
    font-size: 16px;
  }

  .admin-main {
    flex-direction: column;
    gap: 20px;
  }

  .admin-sidebar {
    width: 100%;
    min-width: auto;
    order: 1;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0;
  }

  .sidebar-tab {
    min-width: 160px;
    padding: 12px 20px;
    font-size: 14px;
    border-left: none;
    border-bottom: 4px solid transparent;
    white-space: nowrap;
  }

  .sidebar-tab:hover {
    border-left-color: transparent;
    border-bottom-color: #ddd;
  }

  .sidebar-tab.active {
    border-left-color: transparent;
    border-bottom-color: #3498db;
  }

  .admin-content {
    order: 2;
  }

  .upload-section {
    padding: 30px 20px;
  }

  .upload-notice h2 {
    font-size: 24px;
  }

  .upload-notice p {
    font-size: 16px;
  }

  .upload-link-btn {
    padding: 14px 24px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 15px;
  }

  .sidebar-tab {
    min-width: 140px;
    padding: 10px 16px;
    font-size: 13px;
  }

  .tab-icon {
    font-size: 18px;
  }

  .upload-notice h2 {
    font-size: 22px;
  }

  .upload-link-btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
