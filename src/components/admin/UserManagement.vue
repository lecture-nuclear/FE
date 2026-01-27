<template>
  <div class="user-management">
    <!-- 리스트 뷰 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="management-header">
        <h2>👥 사용자 관리</h2>
      </div>

      <!-- 검색 및 정렬 영역 -->
      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="사용자명 또는 이메일로 검색..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-btn">🔍 검색</button>
          <button @click="clearSearch" class="clear-btn">초기화</button>
        </div>

        <!-- 정렬 옵션 -->
        <div class="sort-section">
          <div class="sort-controls">
            <label for="sortBy">정렬 기준:</label>
            <select id="sortBy" v-model="sortBy" @change="handleSortChange" class="sort-select">
              <option value="createdAt">가입일</option>
              <option value="name">이름</option>
              <option value="email">이메일</option>
              <option value="id">ID</option>
            </select>

            <label for="sortDirection">정렬 방향:</label>
            <select
              id="sortDirection"
              v-model="sortDirection"
              @change="handleSortChange"
              class="sort-select"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>

            <button @click="refreshUsers" class="refresh-btn">🔄 새로고침</button>
          </div>
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
                  <button @click="viewUserDetail(user)" class="detail-btn">📋 상세보기</button>
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
    </div>

    <!-- 상세 뷰 -->
    <div v-if="viewMode === 'detail'" class="detail-view">
      <div class="detail-header">
        <div class="header-left">
          <button @click="closeDetail" class="btn-back">◀ 뒤로가기</button>
          <h2>👤 사용자 상세 정보</h2>
        </div>
      </div>

      <div class="detail-content">
        <div class="user-info-section">
          <div class="info-row">
            <span class="info-label">사용자 ID</span>
            <span class="info-value">{{ selectedUser.id }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">사용자명</span>
            <span class="info-value user-id-value">@{{ selectedUser.userId }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">이름</span>
            <span class="info-value name-value">{{ selectedUser.name }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">이메일</span>
            <span class="info-value email-value">{{ selectedUser.email }}</span>
          </div>
        </div>

        <div class="timestamp-section">
          <div class="info-row">
            <span class="info-label">가입일</span>
            <span class="info-value">{{ formatDateTime(selectedUser.createdAt) }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">마지막 수정</span>
            <span class="info-value">{{ formatDateTime(selectedUser.updatedAt) }}</span>
          </div>
        </div>

        <div class="additional-info">
          <div class="section-title">📊 계정 정보</div>
          <div class="info-grid">
            <div class="info-card">
              <div class="card-title">가입 경과</div>
              <div class="card-value">{{ getJoinedDaysAgo(selectedUser.createdAt) }}일</div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-actions">
        <button @click="closeDetail" class="btn-close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllUsers } from '@/services/adminService'

// 뷰 모드
const viewMode = ref('list')

// 반응형 데이터
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchKeyword = ref('')
const selectedUser = ref(null)
const sortBy = ref('createdAt')
const sortDirection = ref('desc')

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value

  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.userId.toLowerCase().includes(keyword),
  )
})

// 사용자 목록 가져오기
const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await getAllUsers(sortBy.value, sortDirection.value)
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
  console.log('검색 키워드:', searchKeyword.value)
}

// 검색 초기화
const clearSearch = () => {
  searchKeyword.value = ''
}

// 날짜 포맷팅 (짧은 형식)
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 날짜 포맷팅 (상세 형식)
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 가입 경과일 계산
const getJoinedDaysAgo = (createdAt) => {
  const now = new Date()
  const joinDate = new Date(createdAt)
  const diffTime = Math.abs(now - joinDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 사용자 상세보기
const viewUserDetail = (user) => {
  selectedUser.value = user
  viewMode.value = 'detail'
}

// 상세 뷰 닫기
const closeDetail = () => {
  viewMode.value = 'list'
  selectedUser.value = null
}

// 정렬 변경 처리
const handleSortChange = () => {
  console.log(`정렬 변경: ${sortBy.value} ${sortDirection.value}`)
  fetchUsers()
}

// 새로고침
const refreshUsers = () => {
  fetchUsers()
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  min-height: 600px;
}

/* 공통 헤더 */
.management-header,
.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e8ed;
}

.management-header {
  text-align: center;
}

.management-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.detail-header h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

/* 버튼 */
.btn-back,
.btn-close {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  background-color: #6c757d;
  color: white;
}

.btn-back:hover,
.btn-close:hover {
  background-color: #5a6268;
}

/* 리스트 뷰 */
.list-view {
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto 20px;
}

.sort-section {
  display: flex;
  justify-content: center;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e8ed;
}

.sort-controls label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #3498db;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.refresh-btn:hover {
  background-color: #219a52;
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

.search-btn,
.clear-btn {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* 상세 뷰 */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-content {
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.user-info-section {
  margin-bottom: 20px;
}

.timestamp-section {
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #dee2e6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #5d6d7e;
  font-size: 14px;
  min-width: 120px;
}

.info-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.info-value.user-id-value {
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  width: fit-content;
  margin-left: auto;
}

.info-value.name-value {
  color: #2c3e50;
  font-weight: 600;
}

.info-value.email-value {
  color: #3498db;
  font-weight: 500;
}

.additional-info {
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 300px;
}

.info-card {
  background-color: #f8f9fa;
  border: 1px solid #e1e8ed;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.card-title {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .user-management {
    padding: 20px;
  }

  .search-bar {
    flex-direction: column;
  }

  .sort-controls {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
  }

  .sort-select {
    padding: 6px 10px;
    font-size: 13px;
  }

  .refresh-btn {
    padding: 6px 12px;
    font-size: 13px;
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

  .detail-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;
  }

  .info-label {
    min-width: auto;
  }

  .info-value {
    text-align: left;
  }

  .info-value.user-id-value {
    margin-left: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
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

  .detail-header h2 {
    font-size: 18px;
  }

  .info-value {
    font-size: 14px;
  }

  .card-value {
    font-size: 18px;
  }
}
</style>
