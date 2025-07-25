<!-- src/components/admin/UserDetailModal.vue -->
<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>👤 사용자 상세 정보</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-content">
        <div class="user-info-section">
          <div class="info-row">
            <span class="info-label">사용자 ID</span>
            <span class="info-value">{{ user.id }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">사용자명</span>
            <span class="info-value user-id">@{{ user.userId }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">이름</span>
            <span class="info-value name">{{ user.name }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">이메일</span>
            <span class="info-value email">{{ user.email }}</span>
          </div>
        </div>

        <div class="timestamp-section">
          <div class="info-row">
            <span class="info-label">가입일</span>
            <span class="info-value">{{ formatDateTime(user.createdAt) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">마지막 수정</span>
            <span class="info-value">{{ formatDateTime(user.updatedAt) }}</span>
          </div>
        </div>

        <!-- 추가 정보 섹션 (향후 확장 가능) -->
        <div class="additional-info">
          <div class="section-title">📊 계정 정보</div>
          <div class="info-grid">
            <div class="info-card">
              <div class="card-title">가입 경과</div>
              <div class="card-value">{{ getJoinedDaysAgo(user.createdAt) }}일</div>
            </div>
            <div class="info-card">
              <div class="card-title">계정 상태</div>
              <div class="card-value status-active">활성</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="close-modal-btn">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props 정의
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Events 정의
const emit = defineEmits(['close'])

// 오버레이 클릭 시 모달 닫기
const handleOverlayClick = () => {
  emit('close')
}

// 날짜/시간 포맷팅
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e1e8ed;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.modal-content {
  padding: 0 24px;
}

.user-info-section,
.timestamp-section {
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f3f4;
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

.info-value.user-id {
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  width: fit-content;
  margin-left: auto;
}

.info-value.name {
  color: #2c3e50;
  font-weight: 600;
}

.info-value.email {
  color: #3498db;
  font-weight: 500;
}

.additional-info {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.card-title {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.card-value.status-active {
  color: #27ae60;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
}

.close-modal-btn {
  padding: 12px 24px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-modal-btn:hover {
  background-color: #7f8c8d;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 20px 20px 0;
  }
  
  .modal-header h3 {
    font-size: 20px;
  }
  
  .modal-content {
    padding: 0 20px;
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
  
  .info-value.user-id {
    margin-left: 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .modal-header h3 {
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