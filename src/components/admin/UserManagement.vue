<!-- src/components/admin/UserManagement.vue -->
<template>
  <div class="user-management">
    <div class="management-header">
      <h2>👥 사용자 관리</h2>
      <p>등록된 모든 사용자를 조회하고 관리할 수 있습니다.</p>
    </div>

    <!-- 검색 및 필터 영역 -->
    <div class="search-section">
      <div class="search-bar">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="사용자명 또는 이메일로 검색..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
        <button @click="handleSearch" class="search-btn">🔍 검색</button>
        <button @click="clearSearch" class="clear-btn">초기화</button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>사용자 목록을 불러오는 중...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="error-container">
      <p>❌ {{ error }}</p>
      <button @click="fetchUsers" class="retry-btn">다시 시도</button>
    </div>

    <!-- 사용자 목록 테이블 -->
    <div v-else-if="filteredUsers.length > 0" class="users-table-container">
      <div class="table-info">
        <span class="user-count">총 {{ filteredUsers.length }}명의 사용자</span>
      </div>
      
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>가입일</th>
              <th>마지막 수정</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-id">{{ user.id }}</td>
              <td class="user-name">
                <span class="name-text">{{ user.name }}</span>
                <span class="user-id-badge">@{{ user.userId }}</span>
              </td>
              <td class="user-email">{{ user.email }}</td>
              <td class="user-date">{{ formatDate(user.createdAt) }}</td>
              <td class="user-date">{{ formatDate(user.updatedAt) }}</td>
              <td class="user-actions">
                <button @click="viewUserDetail(user)" class="detail-btn">
                  📋 상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 사용자 없음 상태 -->
    <div v-else class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>사용자가 없습니다</h3>
      <p v-if="searchKeyword">검색 조건에 맞는 사용자를 찾을 수 없습니다.</p>
      <p v-else>등록된 사용자가 없습니다.</p>
    </div>

    <!-- 사용자 상세 모달 -->
    <UserDetailModal
      v-if="showDetailModal"
      :user="selectedUser"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllUsers } from '@/services/adminService'
import UserDetailModal from './UserDetailModal.vue'

// 반응형 데이터
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchKeyword = ref('')
const showDetailModal = ref(false)
const selectedUser = ref(null)

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword) ||
    user.userId.toLowerCase().includes(keyword)
  )
})

// 사용자 목록 가져오기
const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await getAllUsers()
    users.value = response.data
  } catch (err) {
    console.error('사용자 목록 조회 실패:', err)
    error.value = err.response?.data?.message || '사용자 목록을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 검색 처리
const handleSearch = () => {
  // 실시간 필터링이므로 별도 처리 불필요
  console.log('검색 키워드:', searchKeyword.value)
}

// 검색 초기화
const clearSearch = () => {
  searchKeyword.value = ''
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 사용자 상세보기
const viewUserDetail = (user) => {
  selectedUser.value = user
  showDetailModal.value = true
}

// 상세 모달 닫기
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedUser.value = null
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.management-header {
  margin-bottom: 30px;
  text-align: center;
}

.management-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.management-header p {
  font-size: 16px;
  color: #7f8c8d;
}

.search-section {
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-btn, .clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn {
  background-color: #3498db;
  color: white;
}

.search-btn:hover {
  background-color: #2980b9;
}

.clear-btn {
  background-color: #95a5a6;
  color: white;
}

.clear-btn:hover {
  background-color: #7f8c8d;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #e74c3c;
}

.retry-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #c0392b;
}

.users-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-info {
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;
}

.user-count {
  font-weight: 600;
  color: #2c3e50;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #34495e;
  color: white;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.users-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e1e8ed;
  font-size: 14px;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.user-id {
  font-weight: 600;
  color: #7f8c8d;
}

.user-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text {
  font-weight: 600;
  color: #2c3e50;
}

.user-id-badge {
  font-size: 12px;
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.user-email {
  color: #3498db;
}

.user-date {
  color: #7f8c8d;
  font-size: 13px;
}

.detail-btn {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.detail-btn:hover {
  background-color: #2980b9;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.empty-state p {
  font-size: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .user-management {
    padding: 15px;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .users-table th,
  .users-table td {
    padding: 12px 8px;
    font-size: 13px;
  }
  
  .user-name {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  
  .user-id-badge {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .management-header h2 {
    font-size: 24px;
  }
  
  .users-table th,
  .users-table td {
    padding: 10px 6px;
    font-size: 12px;
  }
  
  .detail-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>