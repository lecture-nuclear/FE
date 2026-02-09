<template>
  <div class="flex items-center gap-5 relative" ref="userBarContainerRef">
    <div class="relative flex items-center z-[100]">
      <template v-if="userStore.isLoggedIn">
        <div
          @click="toggleUserDropdown"
          class="flex items-center cursor-pointer text-gray-600 text-lg px-2.5 py-1.5 rounded-md transition-colors duration-200 whitespace-nowrap hover:bg-gray-100"
        >
          <span>{{ userStore.name }}님</span>
        </div>
        <div
          v-if="showUserDropdown"
          class="absolute top-[calc(100%+10px)] right-0 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[220px] z-[1000] overflow-hidden p-0"
        >
          <div class="px-5 py-3 cursor-pointer text-base text-gray-800 flex items-center gap-2.5">
            <div class="flex justify-between items-center w-full">
              <span class="text-lg text-gray-800 font-semibold">{{ userStore.name }}</span>
              <button
                @click="logout"
                title="로그아웃"
                class="bg-transparent border-0 cursor-pointer p-1 rounded transition-all duration-200 flex items-center justify-center hover:bg-gray-100"
              >
                <img
                  src="@/assets/logout-svgrepo-com.svg"
                  alt="로그아웃"
                  class="w-4 h-4 transition-[filter] duration-200 hover:brightness-0 hover:saturate-100 hover:invert-[27%] hover:sepia-[93%] hover:saturate-[1352%] hover:hue-rotate-[336deg] hover:brightness-[93%] hover:contrast-[96%]"
                />
              </button>
            </div>
          </div>
          <div class="py-2.5 border-b border-gray-200 last:border-b-0">
            <div
              class="px-5 py-3 cursor-pointer text-base text-gray-800 flex items-center gap-2.5 justify-between hover:bg-gray-100"
            >
              알림
              <span class="bg-red-600 text-white text-xs py-0.5 px-1.5 rounded-full ml-2.5">0</span>
            </div>
            <div
              @click="showOrders"
              class="px-5 py-3 cursor-pointer text-base text-gray-800 flex items-center gap-2.5 hover:bg-gray-100"
            >
              주문 내역
            </div>
            <div
              @click="showSettings"
              class="px-5 py-3 cursor-pointer text-base text-gray-800 flex items-center gap-2.5 hover:bg-gray-100"
            >
              설정
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <button
          @click="openLoginModal"
          class="bg-blue-600 text-white border-0 px-4 py-2 rounded-md cursor-pointer text-base transition-colors duration-300 whitespace-nowrap hover:bg-blue-700"
        >
          로그인
        </button>
      </template>
    </div>

    <div
      @click="toggleCartDropdown"
      class="relative cursor-pointer text-gray-600 flex items-center px-2.5 py-1.5 rounded-md transition-colors duration-200 z-[100] hover:bg-gray-100"
    >
      <span>장바구니</span>
      <span
        v-if="cartStore.itemCount > 0"
        class="bg-red-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full absolute top-0 right-0 translate-x-[30%] -translate-y-[30%] px-1.5"
        >{{ cartStore.itemCount }}</span
      >
    </div>
    <div
      v-if="showCartDropdown"
      class="absolute top-[calc(100%+10px)] right-0 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[320px] max-h-[400px] overflow-y-auto z-[1000] p-4"
    >
      <template v-if="cartStore.itemCount > 0">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex items-center py-2.5 border-b border-gray-200 text-[15px] gap-2.5 last:border-b-0"
        >
          <img
            :src="
              getFileUrl(item.image) || 'https://placehold.co/300x200/4CAF50/FFFFFF?text=Lecture'
            "
            alt="상품 이미지"
            class="w-[50px] h-[50px] rounded object-cover"
          />
          <div class="flex-grow flex flex-col">
            <span class="font-medium text-gray-800">{{ item.title }}</span>
            <span class="text-gray-500 text-sm mt-0.5 font-semibold"
              >{{ item.price.toLocaleString() }}₩</span
            >
          </div>
          <button
            @click="removeCartItem(item.id)"
            class="bg-transparent border-0 text-red-600 text-xl cursor-pointer ml-2.5 leading-none"
          >
            ×
          </button>
        </div>
        <div class="flex justify-between text-lg font-bold py-4 border-t border-gray-200 mt-2.5">
          <span>총계:</span>
          <span>{{ cartStore.totalPrice.toLocaleString() }}₩</span>
        </div>
        <div class="flex justify-between gap-2.5 mt-4">
          <router-link
            to="/cart"
            class="flex-grow py-2.5 px-4 rounded-md cursor-pointer text-[15px] text-center no-underline whitespace-nowrap bg-gray-100 text-gray-800 border border-gray-300 transition-colors duration-200 hover:bg-gray-200"
            >장바구니 보기</router-link
          >
        </div>
      </template>
      <template v-else>
        <div class="text-center py-5 text-gray-500">장바구니가 비어있습니다.</div>
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
import axiosInstance, { getFileUrl } from '@/utils/axiosInstance'
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
    if (userStore.isLoggedIn && userStore.getMemberId) {
      // getMemberId getter 사용
      try {
        // userStore의 id를 URL에 포함하여 요청
        const response = await axiosInstance.get(`/v1/shopping-cart/${userStore.getMemberId}`) // getMemberId getter 사용
        // 백엔드 응답 구조에 맞춰 response.data.data.lectureList 사용
        const loadedItems = response.data.data.lectureList.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price || 0, // null인 경우 0으로 처리
          image: item.thumbnailUrl || null, // 썸네일 URL 사용
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
    // 먼저 로컬 상태를 정리 (토큰이 만료되어도 로그아웃은 성공해야 함)
    userStore.logout()
    showUserDropdown.value = false

    // 백엔드에 로그아웃 요청 (실패해도 로그아웃 진행)
    try {
      await axiosInstance.post('/auth/logout')
      console.log('서버 로그아웃 완료')
    } catch (logoutError) {
      // 토큰 만료 등의 이유로 로그아웃 API가 실패해도 무시
      console.warn('서버 로그아웃 API 실패 (무시됨):', logoutError.message)
    }

    alert('로그아웃 되었습니다.')
    router.push('/')
  } catch (error) {
    // 예상치 못한 에러 발생 시에도 로그아웃 진행
    console.error('로그아웃 처리 중 예상치 못한 에러:', error)
    userStore.logout()
    showUserDropdown.value = false
    alert('로그아웃 되었습니다.')
    router.push('/')
  }
}

// 설정 페이지로 이동
const showSettings = () => {
  showUserDropdown.value = false
  router.push('/settings')
}

// 주문 내역 페이지로 이동
const showOrders = () => {
  showUserDropdown.value = false
  router.push('/orders')
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
