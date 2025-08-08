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
   * 카카오페이 결제창 팝업 열기
   * @param {string} redirectUrl - 카카오페이 결제 URL
   * @returns {Window} 팝업 창 객체
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

    const popupFeatures = `
      width=${popupWidth},
      height=${popupHeight},
      left=${left},
      top=${top},
      scrollbars=yes,
      resizable=yes,
      status=no,
      menubar=no,
      toolbar=no,
      location=no
    `.replace(/\s/g, '')

    try {
      const popup = window.open(redirectUrl, 'kakaoPayPopup', popupFeatures)
      
      // 팝업 차단 확인
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      }

      return popup
    } catch (error) {
      console.error('팝업 열기 실패:', error)
      throw error
    }
  }

  /**
   * 팝업 창 모니터링
   * @param {Window} popup - 모니터링할 팝업 창
   * @param {Function} onClosed - 팝업 닫힘 콜백
   * @param {Function} onMessage - 메시지 수신 콜백
   * @returns {Function} 모니터링 정리 함수
   */
  monitorPopup(popup, onClosed, onMessage) {
    let checkInterval
    let messageListener

    // 팝업 창 닫힘 감지
    checkInterval = setInterval(() => {
      if (popup.closed) {
        this.cleanup()
        if (onClosed) onClosed()
      }
    }, 1000)

    // 메시지 리스너 등록
    messageListener = (event) => {
      console.log('KakaoPayService - 메시지 수신:', { origin: event.origin, data: event.data })
      
      // 보안을 위해 origin 검증 (필요에 따라 수정)
      if (event.origin !== window.location.origin) {
        console.log('KakaoPayService - Origin 불일치, 메시지 무시:', event.origin)
        return
      }

      if (event.data && event.data.type && event.data.type.startsWith('PAYMENT_')) {
        console.log('KakaoPayService - 결제 메시지 처리:', event.data)
        if (onMessage) onMessage(event.data)
      } else {
        console.log('KakaoPayService - 결제 메시지가 아님, 무시')
      }
    }
    
    console.log('KakaoPayService - 메시지 리스너 등록')
    window.addEventListener('message', messageListener)

    // 정리 함수 반환
    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
      if (messageListener) {
        window.removeEventListener('message', messageListener)
        messageListener = null
      }
    }

    this.cleanup = cleanup
    return cleanup
  }

  /**
   * 카카오페이 결제창으로 리다이렉트 (레거시 지원)
   * @param {string} redirectUrl - 카카오페이 결제 URL
   */
  redirectToKakaoPay(redirectUrl) {
    if (!redirectUrl) {
      throw new Error('결제 URL이 제공되지 않았습니다.')
    }

    // 현재 결제 정보를 세션 스토리지에 저장 (결제 완료 후 사용)
    const currentUrl = window.location.href
    sessionStorage.setItem('kakao_pay_return_url', currentUrl)

    // 카카오페이 결제창으로 이동
    window.location.href = redirectUrl
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

  /**
   * 팝업 결제 성공 처리 (팝업 창에서 호출)
   * @param {Object} paymentData - 결제 결과 데이터
   */
  handlePaymentSuccess(paymentData) {
    try {
      // 부모 창으로 결제 성공 메시지 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'PAYMENT_SUCCESS',
          result: paymentData,
          paymentId: paymentData.paymentId
        }, window.location.origin)
      }
      
      // 팝업 창 닫기
      window.close()
    } catch (error) {
      console.error('결제 성공 처리 오류:', error)
    }
  }

  /**
   * 팝업 결제 실패 처리 (팝업 창에서 호출)
   * @param {string} error - 에러 메시지
   */
  handlePaymentFailure(error) {
    try {
      // 부모 창으로 결제 실패 메시지 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'PAYMENT_FAILED',
          error: error || '결제 처리 중 오류가 발생했습니다.'
        }, window.location.origin)
      }
      
      // 팝업 창 닫기
      window.close()
    } catch (error) {
      console.error('결제 실패 처리 오류:', error)
    }
  }

  /**
   * 팝업 결제 취소 처리 (팝업 창에서 호출)
   */
  handlePaymentCancel() {
    try {
      // 부모 창으로 결제 취소 메시지 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'PAYMENT_CANCELLED',
          message: '사용자가 결제를 취소했습니다.'
        }, window.location.origin)
      }
      
      // 팝업 창 닫기
      window.close()
    } catch (error) {
      console.error('결제 취소 처리 오류:', error)
    }
  }

  /**
   * URL 쿼리 파라미터에서 결제 결과 추출
   * @returns {Object|null} 결제 결과 객체
   */
  extractPaymentResult() {
    const urlParams = new URLSearchParams(window.location.search)
    const pgToken = urlParams.get('pg_token')
    const paymentId = urlParams.get('payment_id') || 
                     sessionStorage.getItem('current_payment_id')

    if (pgToken && paymentId) {
      return {
        pgToken,
        paymentId,
        status: 'success'
      }
    }

    // 실패나 취소의 경우
    const errorCode = urlParams.get('error_code')
    const errorMsg = urlParams.get('error_msg')
    
    if (errorCode) {
      return {
        status: 'failed',
        error: errorMsg || '결제 처리 중 오류가 발생했습니다.',
        errorCode
      }
    }

    return null
  }
}

export const kakaoPayService = new KakaoPayService()
export default kakaoPayService
