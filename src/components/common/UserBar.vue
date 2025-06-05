<template>
  <div class="user-bar-wrapper" ref="userBarContainerRef">
    <div class="user-info-container">
      <template v-if="userStore.isLoggedIn">
        <div class="user-name-wrapper" @click="toggleUserDropdown">
          <span class="user-name">{{ userStore.name }}님</span>
        </div>
        <div v-if="showUserDropdown" class="user-dropdown">
          <div class="dropdown-item user-info-header">
            <div>
              <span class="user-info-name">{{ userStore.name }}</span>
              <div class="user-info-actions">
                <a href="#" @click.prevent="showProfile">프로필 보기</a>
                <a href="#" @click.prevent="logout">로그아웃</a>
              </div>
            </div>
          </div>
          <div class="dropdown-section">
            <div class="dropdown-item">수강 중 강좌</div>
            <div class="dropdown-item notification-item">
              알림 <span class="notification-badge">0</span>
            </div>
            <div class="dropdown-item">설정</div>
          </div>
        </div>
      </template>
      <template v-else>
        <button @click="openLoginModal" class="login-button">로그인</button>
      </template>
    </div>

    <div class="cart-container" @click="toggleCartDropdown">
      <span>장바구니</span>
      <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
    </div>
    <div v-if="showCartDropdown" class="cart-dropdown">
      <template v-if="cartStore.itemCount > 0">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img
            :src="item.image || 'https://placehold.co/50x50/cccccc/333333?text=상품'"
            alt="상품 이미지"
            class="cart-item-image"
          />
          <div class="item-details">
            <span class="item-name">{{ item.title }}</span>
            <span class="item-qty-price"
              >{{ item.quantity }} × {{ item.price.toLocaleString() }}₩</span
            >
          </div>
          <button class="remove-item-btn" @click="removeCartItem(item.id)">×</button>
        </div>
        <div class="cart-summary">
          <span class="summary-label">총계:</span>
          <span class="summary-total">{{ cartStore.totalPrice.toLocaleString() }}₩</span>
        </div>
        <div class="cart-actions">
          <router-link to="/cart" class="btn-cart-view">장바구니 보기</router-link>
          <button class="btn-checkout">결제</button>
        </div>
      </template>
      <template v-else>
        <div class="empty-cart-message">장바구니가 비어있습니다.</div>
      </template>
    </div>

    <LoginModal v-if="isLoginModalOpen" @close="closeLoginModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import axiosInstance from '@/utils/axiosInstance'
import LoginModal from '@/components/modals/LoginModal.vue'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// 드롭다운 상태
const showUserDropdown = ref(false)
const showCartDropdown = ref(false)

// 로그인 모달 상태
const isLoginModalOpen = ref(false)

// UserBar 컴포넌트의 최상위 컨테이너 ref (외부 클릭 감지용)
const userBarContainerRef = ref(null)

// 사용자 드롭다운 토글
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  // 다른 드롭다운은 닫기
  if (showUserDropdown.value) {
    showCartDropdown.value = false
  }
}

// 장바구니 드롭다운 토글
const toggleCartDropdown = async () => {
  showCartDropdown.value = !showCartDropdown.value
  // 다른 드롭다운은 닫기
  if (showCartDropdown.value) {
    showUserDropdown.value = false
    // 장바구니가 열릴 때만 백엔드에서 정보 로드
    // userStore.id가 null이 아닌 경우에만 로드 시도
    if (userStore.isLoggedIn && userStore.id !== null) {
      // 🚩 로그인 상태 및 id 유효성 확인 추가
      try {
        // userStore의 id를 URL에 포함하여 요청
        const response = await axiosInstance.get(`/v1/shopping-cart/${userStore.id}`)
        // 백엔드 응답 구조에 맞춰 response.data.data.lectureList 사용
        const loadedItems = response.data.data.lectureList.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1, // 백엔드에서 quantity를 주지 않는 경우 기본값 1 설정
          image: item.image || null, // 이미지가 있다면 추가, 없다면 null
        }))
        cartStore.setCart(loadedItems)
      } catch (error) {
        console.error('장바구니 정보 로드 실패:', error)
      }
    }
  }
}

// 로그인 모달 열기/닫기
const openLoginModal = () => {
  isLoginModalOpen.value = true
}
const closeLoginModal = () => {
  isLoginModalOpen.value = false
  userStore.checkLoginStatus()
}

// 로그아웃 처리
const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout')
    userStore.logout()
    showUserDropdown.value = false
    alert('로그아웃 되었습니다.')
    router.push('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
    alert('로그아웃에 실패했습니다.')
  }
}

// 프로필 보기 (임시)
const showProfile = () => {
  alert('프로필 페이지로 이동합니다.')
  showUserDropdown.value = false
}

// 장바구니 아이템 삭제 (예시)
const removeCartItem = (itemId) => {
  cartStore.removeItem(itemId)
}

// 드롭다운 외부 클릭 시 닫기
const handleClickOutside = (event) => {
  if (userBarContainerRef.value && !userBarContainerRef.value.contains(event.target)) {
    showUserDropdown.value = false
    showCartDropdown.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await userStore.checkLoginStatus()
  cartStore.loadCartFromBackend()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* User Bar Wrapper (전체 User Bar 컨테이너) */
.user-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

/* 로그인 버튼 */
.login-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}
.login-button:hover {
  background-color: #0056b3;
}

/* 사용자 이름 영역 (로그인 시) */
.user-info-container {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 100;
}

.user-name-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #555;
  font-size: 18px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}
.user-name-wrapper:hover {
  background-color: #e9ecef;
}

/* 사용자 드롭다운 메뉴 스타일 */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 1000;
  overflow: hidden;
  padding: 0;
}

.user-dropdown .user-info-header {
  background-color: #333;
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  font-weight: bold;
}
.user-info-header .user-info-name {
  font-size: 18px;
  display: block;
}
.user-info-header .user-info-actions {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}
.user-info-header .user-info-actions a {
  color: #a0a0a0;
  font-size: 13px;
  text-decoration: none;
}
.user-info-header .user-info-actions a:hover {
  text-decoration: underline;
}

.user-dropdown .dropdown-section {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.user-dropdown .dropdown-section:last-child {
  border-bottom: none;
}

.user-dropdown .dropdown-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-dropdown .dropdown-item:hover {
  background-color: #f5f5f5;
}

.user-dropdown .notification-item {
  justify-content: space-between;
}
.user-dropdown .notification-badge {
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  padding: 2px 7px;
  border-radius: 50%;
  margin-left: 10px;
}

/* 장바구니 영역 */
.cart-container {
  position: relative;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  z-index: 100;
}
.cart-container:hover {
  background-color: #e9ecef;
}
.cart-badge {
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(30%, -30%);
  padding: 0 5px;
}

/* 장바구니 드롭다운 메뉴 스타일 */
.cart-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  padding: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  gap: 10px;
}
.cart-item:last-child {
  border-bottom: none;
}
.cart-item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}
.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.item-name {
  font-weight: 500;
  color: #333;
}
.item-qty-price {
  color: #777;
  font-size: 14px;
  margin-top: 2px;
}
.remove-item-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
  line-height: 1;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  padding: 15px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
}
.empty-cart-message {
  text-align: center;
  padding: 20px;
  color: #777;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
}

.btn-cart-view,
.btn-checkout {
  flex-grow: 1;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.btn-cart-view {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  transition: background-color 0.2s ease;
}
.btn-cart-view:hover {
  background-color: #e0e0e0;
}

.btn-checkout {
  background-color: #28a745;
  color: white;
  border: none;
  transition: background-color 0.2s ease;
}
.btn-checkout:hover {
  background-color: #218838;
}
</style>
