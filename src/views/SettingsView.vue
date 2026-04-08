<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="page-title">
        <PhGearSix :size="32" weight="duotone" />
        <span>설정</span>
      </h1>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="settings-main">
      <!-- 왼쪽 사이드바 탭 네비게이션 -->
      <div class="settings-sidebar">
        <nav class="sidebar-nav">
          <button
            @click="activeTab = 'profile'"
            :class="{ active: activeTab === 'profile' }"
            class="sidebar-tab"
          >
            <PhUserCircle class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">프로필 정보</span>
          </button>
          <button
            @click="activeTab = 'nickname'"
            :class="{ active: activeTab === 'nickname' }"
            class="sidebar-tab"
          >
            <PhPencilSimpleLine class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">닉네임 변경</span>
          </button>
          <button
            @click="activeTab = 'password'"
            :class="{ active: activeTab === 'password' }"
            class="sidebar-tab"
          >
            <PhLockKey class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">비밀번호 변경</span>
          </button>
          <button
            @click="activeTab = 'delete'"
            :class="{ active: activeTab === 'delete' }"
            class="sidebar-tab danger-tab"
          >
            <PhWarningCircle class="tab-icon" :size="20" weight="duotone" />
            <span class="tab-text">회원탈퇴</span>
          </button>
        </nav>
      </div>

      <!-- 오른쪽 메인 콘텐츠 -->
      <div class="settings-content">
        <!-- 프로필 정보 탭 -->
        <div v-if="activeTab === 'profile'" class="content-section">
          <div class="section-header">
            <h2 class="section-title">
              <PhUserCircle :size="24" weight="duotone" />
              <span>프로필 정보</span>
            </h2>
            <p>현재 계정의 기본 정보를 확인할 수 있습니다.</p>
          </div>
          <div class="user-info">
            <div class="info-item">
              <label>닉네임</label>
              <span>{{ userStore.name }}</span>
            </div>
            <div class="info-item">
              <label>이메일</label>
              <span>{{ userStore.email }}</span>
            </div>
          </div>
        </div>

        <!-- 닉네임 변경 탭 -->
        <div v-if="activeTab === 'nickname'" class="content-section">
          <div class="section-header">
            <h2 class="section-title">
              <PhPencilSimpleLine :size="24" weight="duotone" />
              <span>닉네임 변경</span>
            </h2>
            <p>다른 사용자에게 표시될 닉네임을 변경할 수 있습니다.</p>
          </div>
          <NicknameChangeForm />
        </div>

        <!-- 비밀번호 변경 탭 -->
        <div v-if="activeTab === 'password'" class="content-section">
          <div class="section-header">
            <h2 class="section-title">
              <PhLockKey :size="24" weight="duotone" />
              <span>비밀번호 변경</span>
            </h2>
            <p>계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.</p>
          </div>
          <PasswordChangeForm />
        </div>

        <!-- 회원탈퇴 탭 -->
        <div v-if="activeTab === 'delete'" class="content-section">
          <div class="section-header">
            <h2 class="section-title danger-text">
              <PhWarningCircle :size="24" weight="duotone" />
              <span>회원탈퇴</span>
            </h2>
            <p>계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <AccountDeleteForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhGearSix,
  PhLockKey,
  PhPencilSimpleLine,
  PhUserCircle,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/userStore'
import NicknameChangeForm from '@/components/settings/NicknameChangeForm.vue'
import PasswordChangeForm from '@/components/profile/PasswordChangeForm.vue'
import AccountDeleteForm from '@/components/settings/AccountDeleteForm.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 유효한 탭 목록
const validTabs = ['profile', 'nickname', 'password', 'delete']

// URL 쿼리 파라미터에서 탭 상태 관리
const activeTab = computed({
  get() {
    const tab = route.query.tab || 'profile'
    return validTabs.includes(tab) ? tab : 'profile'
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
</script>

<style scoped>
.settings-page {
  padding: 30px;
  max-width: var(--page-max-width);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
  background-color: #ffffff;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.page-title,
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* 메인 컨텐츠 영역 */
.settings-main {
  display: flex;
  gap: 30px;
  min-height: 600px;
}

/* 왼쪽 사이드바 */
.settings-sidebar {
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

.sidebar-tab.danger-tab:hover {
  background-color: #fef2f2;
  color: #dc2626;
  border-left-color: #fca5a5;
}

.sidebar-tab.danger-tab.active {
  background-color: #fef2f2;
  color: #dc2626;
  border-left-color: #dc2626;
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
.settings-content {
  flex: 1;
  background-color: transparent;
  min-height: 600px;
}

.content-section {
  padding: 40px;
}

.section-header {
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 700;
}

.danger-text {
  color: #dc2626;
}

.section-header p {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.user-info {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-item label {
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
}

.info-item span {
  color: #212529;
  font-size: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .settings-main {
    gap: 20px;
  }

  .settings-sidebar {
    width: 240px;
    min-width: 240px;
  }

  .sidebar-tab {
    padding: 14px 20px;
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 20px;
  }

  .settings-header h1 {
    font-size: 30px;
  }

  .settings-main {
    flex-direction: column;
    gap: 20px;
  }

  .settings-sidebar {
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

  .sidebar-tab.danger-tab:hover {
    border-left-color: transparent;
    border-bottom-color: #fca5a5;
  }

  .sidebar-tab.danger-tab.active {
    border-left-color: transparent;
    border-bottom-color: #dc2626;
  }

  .settings-content {
    order: 2;
  }

  .content-section {
    padding: 30px 20px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .section-header p {
    font-size: 16px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .settings-page {
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

  .content-section {
    padding: 25px 15px;
  }

  .section-header h2 {
    font-size: 22px;
  }
}
</style>
