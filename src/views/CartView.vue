<template>
  <div class="cart-page">
    <div class="container">
      <div class="cart-header">
        <h1>장바구니</h1>
        <p v-if="cartStore.itemCount > 0">{{ cartStore.itemCount }}개의 강의가 담겨있습니다.</p>
      </div>

      <div v-if="cartStore.itemCount > 0" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img
              :src="getFileUrl(item.image) || 'https://placehold.co/300x200/4CAF50/FFFFFF?text=Lecture'"
              alt="강의 썸네일"
              class="item-image"
            />
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-price">{{ item.price.toLocaleString() }}원</p>
            </div>
            <div class="item-actions">
              <button @click="removeItem(item.id)" class="remove-btn">삭제</button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-content">
            <div class="summary-row">
              <span>강의 개수:</span>
              <span>{{ cartStore.itemCount }}개</span>
            </div>
            <div class="summary-row total">
              <span>총 결제금액:</span>
              <span class="total-price">{{ cartStore.totalPrice.toLocaleString() }}원</span>
            </div>
            <button @click="purchaseAllItems" class="purchase-all-btn">전체 구매하기</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-cart">
        <div class="empty-cart-content">
          <h2>장바구니가 비어있습니다</h2>
          <p>원하는 강의를 담아보세요!</p>
          <router-link to="/courses" class="browse-courses-btn">강의 둘러보기</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import axiosInstance, { getFileUrl } from '@/utils/axiosInstance'

const cartStore = useCartStore()
const userStore = useUserStore()

const removeItem = (itemId) => {
  cartStore.removeItem(itemId)
}

const purchaseAllItems = async () => {
  if (!userStore.isLoggedIn) {
    alert('로그인이 필요합니다.')
    return
  }

  if (cartStore.itemCount === 0) {
    alert('장바구니에 강의가 없습니다.')
    return
  }

  const confirmPurchase = confirm(
    `장바구니의 모든 강의를 구매하시겠습니까?\n\n총 ${cartStore.itemCount}개 강의\n총 금액: ${cartStore.totalPrice.toLocaleString()}원`
  )
  
  if (!confirmPurchase) {
    return
  }

  try {
    const purchasePromises = cartStore.items.map(item => 
      axiosInstance.post('/v1/enroll', {
        memberId: userStore.getMemberId,
        lectureId: item.id,
      })
    )

    const results = await Promise.allSettled(purchasePromises)
    
    let successCount = 0
    let failCount = 0
    const failedItems = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && (result.value.status === 201 || result.value.status === 200)) {
        successCount++
      } else {
        failCount++
        failedItems.push(cartStore.items[index].title)
      }
    })

    if (successCount > 0) {
      alert(`${successCount}개 강의 구매가 완료되었습니다!${failCount > 0 ? `\n실패: ${failCount}개` : ''}`)
      
      // 성공한 항목들을 장바구니에서 제거
      cartStore.clearCart()
      cartStore.loadCartFromBackend() // 최신 장바구니 상태 로드
    } else {
      alert('모든 강의 구매에 실패했습니다.')
      console.error('Purchase failures:', failedItems)
    }
    
  } catch (error) {
    console.error('일괄 구매 중 오류:', error)
    alert('구매 처리 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  cartStore.loadCartFromBackend()
})
</script>

<style scoped>
.cart-page {
  min-height: 80vh;
  padding: 40px 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-header {
  margin-bottom: 40px;
  text-align: center;
}

.cart-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.cart-header p {
  color: #666;
  font-size: 1.1rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.item-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #007bff;
  margin: 0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.remove-btn {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background-color: #c82333;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 2px solid #333;
  font-size: 1.2rem;
  font-weight: 700;
}

.total-price {
  color: #007bff;
  font-size: 1.4rem;
}

.purchase-all-btn {
  width: 100%;
  padding: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.purchase-all-btn:hover {
  background-color: #218838;
}


.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-cart-content {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-cart-content h2 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #333;
}

.empty-cart-content p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.browse-courses-btn {
  display: inline-block;
  padding: 16px 32px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.browse-courses-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-image {
    width: 100%;
    height: 160px;
  }
  
  .cart-summary {
    position: static;
  }
}
</style>