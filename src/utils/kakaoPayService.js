import axiosInstance from '@/utils/axiosInstance'

export class KakaoPayService {
  constructor() {
    this.baseURL = '/v1/payments'
  }

  /**
   * 카카오페이 결제 준비 요청
   * @param {Object} paymentData - 결제 정보
   * @param {number} paymentData.memberId - 회원 ID
   * @param {Array} paymentData.lectureIds - 강의 ID 배열
   * @param {string} paymentData.itemName - 상품명
   * @param {number} paymentData.totalAmount - 총 결제 금액
   * @returns {Promise<Object>} 카카오페이 결제 준비 응답
   */
  async preparePayment(paymentData) {
    try {
      const { memberId, lectureIds, itemName, totalAmount } = paymentData

      const response = await axiosInstance.post(`${this.baseURL}/ready`, {
        memberId,
        lectureIds,
        partnerOrderId: this.generateOrderId(),
        partnerUserId: memberId.toString(),
        itemName,
        totalAmount,
      })

      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        throw new Error('결제 준비 응답 데이터가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('카카오페이 결제 준비 실패:', error)
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || '결제 준비 중 오류가 발생했습니다.',
      }
    }
  }

  /**
   * 카카오페이 결제 승인 요청
   * @param {string} paymentId - 결제 ID
   * @param {string} pgToken - 카카오페이 결제 토큰
   * @returns {Promise<Object>} 카카오페이 결제 승인 응답
   */
  async approvePayment(paymentId, pgToken) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/approve`, {
        paymentId,
        pgToken,
      })

      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        throw new Error('결제 승인 응답 데이터가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('카카오페이 결제 승인 실패:', error)
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || '결제 승인 중 오류가 발생했습니다.',
      }
    }
  }

  /**
   * 카카오페이 결제 취소 요청
   * @param {string} paymentId - 결제 ID
   * @returns {Promise<Object>} 결제 취소 응답
   */
  async cancelPayment(paymentId) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${paymentId}/cancel`)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('카카오페이 결제 취소 실패:', error)
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || '결제 취소 중 오류가 발생했습니다.',
      }
    }
  }

  /**
   * 카카오페이 결제창을 팝업으로 열기
   * @param {string} redirectUrl - 카카오페이 결제 URL
   * @returns {Window} 팝업 윈도우 객체
   */
  openKakaoPayPopup(redirectUrl) {
    if (!redirectUrl) {
      throw new Error('결제 URL이 제공되지 않았습니다.')
    }

    // 팝업 창 설정
    const popupWidth = 500
    const popupHeight = 700
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    const popupOptions = [
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=no',
      'scrollbars=yes',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'status=no'
    ].join(',')

    // 현재 결제 정보를 세션 스토리지에 저장 (결제 완료 후 사용)
    const currentUrl = window.location.href
    sessionStorage.setItem('kakao_pay_return_url', currentUrl)

    // 카카오페이 결제창 팝업 열기
    const popup = window.open(redirectUrl, 'kakaoPayPopup', popupOptions)

    if (!popup) {
      throw new Error('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.')
    }

    // 팝업에 포커스
    popup.focus()

    return popup
  }

  /**
   * 팝업 상태 모니터링
   * @param {Window} popup - 팝업 윈도우 객체
   * @param {Function} onClose - 팝업 닫힘 콜백
   * @param {Function} onMessage - 메시지 수신 콜백
   */
  monitorPopup(popup, onClose, onMessage) {
    // 팝업 닫힘 감지
    const checkClosed = () => {
      if (popup.closed) {
        onClose && onClose()
        return
      }
      setTimeout(checkClosed, 1000)
    }
    
    checkClosed()

    // 메시지 수신 리스너
    const messageHandler = (event) => {
      // 보안: 카카오페이 도메인에서 온 메시지만 처리
      if (event.origin !== window.location.origin) {
        return
      }
      
      onMessage && onMessage(event.data)
      
      // 메시지 수신 후 리스너 제거
      window.removeEventListener('message', messageHandler)
    }

    window.addEventListener('message', messageHandler)

    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }

  /**
   * 주문 ID 생성
   * @returns {string} 고유한 주문 ID
   */
  generateOrderId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `ORDER_${timestamp}_${random}`
  }

  /**
   * 가격 포맷팅
   * @param {number} price - 가격
   * @returns {string} 포맷된 가격 문자열
   */
  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  /**
   * 결제 데이터 유효성 검사
   * @param {Object} paymentData - 결제 데이터
   * @returns {boolean} 유효성 검사 결과
   */
  validatePaymentData(paymentData) {
    const required = ['memberId', 'lectureIds', 'itemName', 'totalAmount']
    const missing = required.filter((field) => !paymentData[field])

    if (missing.length > 0) {
      throw new Error(`필수 결제 정보가 누락되었습니다: ${missing.join(', ')}`)
    }

    if (paymentData.totalAmount <= 0) {
      throw new Error('결제 금액은 0보다 커야 합니다.')
    }

    if (!Array.isArray(paymentData.lectureIds) || paymentData.lectureIds.length === 0) {
      throw new Error('결제할 강의를 선택해주세요.')
    }

    return true
  }

  /**
   * URL에서 쿼리 파라미터 추출
   * @param {string} url - URL
   * @param {string} param - 파라미터 이름
   * @returns {string|null} 파라미터 값
   */
  getUrlParameter(url, param) {
    const urlObj = new URL(url)
    return urlObj.searchParams.get(param)
  }

  /**
   * 결제 상태별 메시지 생성
   * @param {string} status - 결제 상태
   * @returns {Object} 상태 메시지 객체
   */
  getStatusMessage(status) {
    const messages = {
      success: {
        title: '결제 완료',
        message: '결제가 성공적으로 완료되었습니다.',
        type: 'success',
      },
      cancelled: {
        title: '결제 취소',
        message: '결제가 취소되었습니다.',
        type: 'warning',
      },
      failed: {
        title: '결제 실패',
        message: '결제 처리 중 오류가 발생했습니다.',
        type: 'error',
      },
    }

    return messages[status] || messages.failed
  }
}

export const kakaoPayService = new KakaoPayService()
export default kakaoPayService
