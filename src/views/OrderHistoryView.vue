<template>
  <div class="order-history-page">
    <div class="order-history-header">
      <h1>주문 내역</h1>
      <p>결제한 주문 목록입니다.</p>
    </div>

    <div v-if="orderStore.isLoading" class="loading-message">
      주문 내역을 불러오는 중입니다...
    </div>

    <div v-else-if="orderStore.getError" class="error-message">
      오류: {{ orderStore.getError }}
    </div>

    <div v-else>
      <div v-if="orderStore.getOrders.length > 0" class="order-list">
        <div v-for="order in orderStore.getOrders" :key="order.orderId" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">주문번호: {{ order.orderId }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <span :class="['order-status', getStatusClass(order.status)]">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <div class="order-name">{{ order.orderName }}</div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.lectureId" class="order-item">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-price">{{ item.totalPrice?.toLocaleString() || item.price?.toLocaleString() }}₩</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">총 결제금액:</span>
              <span class="total-amount">{{ order.totalAmount?.toLocaleString() }}₩</span>
            </div>
            <button
              v-if="canCancel(order.status)"
              @click="handleCancelOrder(order.orderId)"
              class="btn-cancel-order"
            >
              주문 취소
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-orders-message">
        주문 내역이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useUserStore } from '@/stores/userStore'

const orderStore = useOrderStore()
const userStore = useUserStore()

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '결제 대기',
    'COMPLETED': '결제 완료',
    'CANCELLED': '취소됨'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    'PENDING': 'status-pending',
    'COMPLETED': 'status-completed',
    'CANCELLED': 'status-cancelled'
  }
  return classMap[status] || ''
}

const canCancel = (status) => {
  return status === 'PENDING' || status === 'COMPLETED'
}

const handleCancelOrder = async (orderId) => {
  if (!confirm('정말로 이 주문을 취소하시겠습니까?')) return

  try {
    await orderStore.cancelOrder(orderId)
    alert('주문이 취소되었습니다.')
  } catch (error) {
    alert('주문 취소에 실패했습니다: ' + (error.response?.data?.message || error.message))
  }
}

onMounted(async () => {
  await userStore.checkLoginStatus()
  if (userStore.getMemberId) {
    await orderStore.fetchOrderHistory(userStore.getMemberId)
  }
})
</script>

<style scoped>
.order-history-page {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
}

.order-history-header {
  text-align: center;
  margin-bottom: 40px;
}

.order-history-header h1 {
  font-size: 38px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 800;
}

.order-history-header p {
  font-size: 18px;
  color: #7f8c8d;
}

.loading-message,
.error-message,
.no-orders-message {
  text-align: center;
  font-size: 20px;
  color: #666;
  padding: 50px 0;
}

.error-message {
  color: #e74c3c;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-id {
  font-size: 14px;
  color: #888;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 15px;
  color: #333;
}

.item-price {
  font-size: 15px;
  color: #666;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-label {
  font-size: 16px;
  color: #666;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #007bff;
}

.btn-cancel-order {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-cancel-order:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .order-history-page {
    padding: 15px;
  }

  .order-history-header h1 {
    font-size: 30px;
  }

  .order-history-header p {
    font-size: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .order-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .order-total {
    justify-content: space-between;
  }

  .btn-cancel-order {
    width: 100%;
  }
}
</style>
