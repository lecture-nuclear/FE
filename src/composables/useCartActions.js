// src/composables/useCartActions.js
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import axiosInstance from '@/utils/axiosInstance'

/**
 * 장바구니 관련 액션을 위한 컴포저블 함수.
 * 강의를 장바구니에 추가하는 로직을 제공합니다.
 *
 * @returns {Object} 장바구니 추가 액션을 포함하는 객체
 */
export function useCartActions() {
  const cartStore = useCartStore()
  const userStore = useUserStore()

  /**
   * 강의를 장바구니에 추가하는 비동기 함수.
   * 사용자 로그인 상태를 확인하고, 백엔드에 PUT 요청을 보낸 후 Pinia 스토어를 업데이트합니다.
   *
   * @param {Object} lecture - 장바구니에 추가할 강의 객체. id, title, price, thumbnailUrl 속성을 포함해야 합니다.
   */
  const handleAddToCart = async (lecture) => {
    // 1. 로그인 여부 확인
    if (!userStore.isLoggedIn) {
      alert('장바구니에 담으려면 로그인해야 합니다.')
      return
    }

    // 2. 강의 정보 유효성 검사
    if (!lecture || !lecture.id) {
      alert('장바구니에 담을 강의 정보가 유효하지 않습니다.')
      console.error('유효하지 않은 강의 정보:', lecture)
      return
    }

    try {
      // 3. 백엔드 PUT 요청: /api/v1/shopping-cart
      // 이 요청은 로그인된 사용자의 memberId와 lectureId를 전달합니다.
      const response = await axiosInstance.put('/v1/shopping-cart', {
        memberId: userStore.id, // 현재 로그인된 사용자의 ID
        lectureId: lecture.id, // 추가할 강의의 ID
      })

      // 4. 백엔드 응답 처리
      if (response.status === 201) {
        alert(`${lecture.title} 강의가 장바구니에 담겼습니다!`)

        // 5. Pinia 장바구니 스토어 업데이트
        // 백엔드에서 최신 장바구니 데이터를 반환한다면, 그걸로 setCart(response.data.cartItems) 하는 것이 가장 좋지만,
        // 현재는 단순히 추가된 항목을 스토어에 반영합니다.
        cartStore.addItem({
          id: lecture.id,
          title: lecture.title,
          price: lecture.price,
          quantity: 1, // 장바구니 추가 시 기본 수량
          image: lecture.thumbnailUrl, // 썸네일 URL (LectureDetailsView에서 넘어옴)
        })
      } else {
        // 예상치 못한 성공 응답 (예: 204 No Content)
        alert('장바구니 추가에 실패했습니다. 다시 시도해주세요. (예상치 못한 서버 응답)')
        console.warn('장바구니 추가 응답 상태:', response.status, response.data)
      }
    } catch (error) {
      // 6. 오류 처리
      console.error('장바구니 추가 실패:', error)
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict: 이미 장바구니에 있는 경우 등
          alert('이미 장바구니에 있는 강의입니다.')
        } else if (error.response.status === 400) {
          // Bad Request: 유효하지 않은 요청 등
          alert(`장바구니 추가 실패: ${error.response.data.message || '요청이 잘못되었습니다.'}`)
        } else if (error.response.status === 401 || error.response.status === 418) {
          // Unauthorized (토큰 만료 등은 axiosInstance 인터셉터에서 처리)
          // 인터셉터가 로그인 페이지로 리디렉션하므로 여기서는 추가 메시지 필요 없음
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.')
        } else {
          alert(
            `장바구니 추가 중 오류가 발생했습니다: ${error.response.status} - ${error.response.statusText || '서버 오류'}`,
          )
        }
      } else if (error.request) {
        alert('네트워크 오류: 서버에 연결할 수 없습니다.')
      } else {
        alert('알 수 없는 오류가 발생했습니다.')
      }
    }
  }

  return {
    handleAddToCart,
  }
}
