<!-- src/views/AdminView.vue -->
<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>관리자 페이지 ⚙️</h1>
      <p>시스템 관리 및 설정을 위한 페이지입니다.</p>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="admin-tabs">
      <button 
        @click="activeTab = 'users'" 
        :class="{ active: activeTab === 'users' }"
        class="tab-btn"
      >
        👥 사용자 관리
      </button>
      <button 
        @click="activeTab = 'upload'" 
        :class="{ active: activeTab === 'upload' }"
        class="tab-btn"
      >
        📚 강의 업로드
      </button>
    </div>

    <!-- 탭 콘텐츠 -->
    <div class="tab-content">
      <!-- 사용자 관리 탭 -->
      <UserManagement v-if="activeTab === 'users'" />
      
      <!-- 강의 업로드 탭 -->
      <div v-if="activeTab === 'upload'" class="upload-section">
        <div class="upload-notice">
          <h2>📚 강의 업로드</h2>
          <p>새로운 강의를 업로드하고 관리할 수 있습니다.</p>
          
          <div class="upload-actions">
            <router-link to="/admin/upload-course" class="upload-link-btn">
              ➕ 새 강의 업로드
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { isAdmin } from '@/utils/auth'
import UserManagement from '@/components/admin/UserManagement.vue'

const router = useRouter()
const userStore = useUserStore()

// 활성 탭 상태
const activeTab = ref('users')

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
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
  background-color: #f9f9f9;
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

.admin-header p {
  font-size: 18px;
  color: #7f8c8d;
}

/* 탭 네비게이션 */
.admin-tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
}

.tab-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  background-color: transparent;
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.tab-btn.active {
  background-color: #3498db;
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

/* 탭 콘텐츠 */
.tab-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

/* 강의 업로드 섹션 */
.upload-section {
  padding: 40px;
}

.upload-notice {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.upload-notice h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 16px;
  font-weight: 700;
}

.upload-notice p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 32px;
  line-height: 1.6;
}

.upload-actions {
  display: flex;
  justify-content: center;
}

.upload-link-btn {
  display: inline-block;
  background-color: #27ae60;
  color: white;
  padding: 16px 32px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.upload-link-btn:hover {
  background-color: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

/* 반응형 디자인 */
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
  
  .admin-tabs {
    margin: 0 10px 20px;
    padding: 4px;
  }
  
  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .tab-content {
    margin: 0 10px;
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
  .admin-tabs {
    flex-direction: column;
    gap: 4px;
  }
  
  .tab-btn {
    padding: 12px;
    font-size: 14px;
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