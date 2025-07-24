// PortOne SDK는 CDN 방식으로 로드됨
// <script src="https://cdn.portone.io/v2/browser-sdk.js"></script>

export class PaymentService {
  constructor() {
    this.storeId = import.meta.env.VITE_PORTONE_STORE_ID
    this.channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY
    
    if (!this.storeId || !this.channelKey) {
      console.warn('PortOne 설정이 누락되었습니다. 환경변수를 확인해주세요.')
    }
  }

  async requestPayment(paymentData) {
    const {
      orderId,
      orderName,
      totalAmount,
      currency = 'KRW',
      customer,
      products
    } = paymentData

    try {
      // PortOne SDK가 로드되었는지 확인
      if (typeof window.PortOne === 'undefined') {
        throw new Error('PortOne SDK가 로드되지 않았습니다.')
      }

      const response = await window.PortOne.requestPayment({
        storeId: this.storeId,
        channelKey: this.channelKey,
        paymentId: orderId,
        orderName,
        totalAmount,
        currency,
        payMethod: 'CARD',
        customer: {
          customerId: customer.id,
          fullName: customer.name,
          phoneNumber: customer.phone,
          email: customer.email
        },
        products: products?.map(product => ({
          id: product.id,
          name: product.name,
          amount: product.price,
          quantity: product.quantity || 1
        })),
        redirectUrl: `${window.location.origin}/payment/callback`
      })

      if (response.code !== undefined) {
        throw new Error(response.message || '결제가 취소되었습니다.')
      }

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('결제 요청 중 오류 발생:', error)
      return {
        success: false,
        error: error.message || '결제 처리 중 오류가 발생했습니다.'
      }
    }
  }

  async loadPaymentUI() {
    try {
      if (typeof window.PortOne === 'undefined') {
        throw new Error('PortOne SDK가 로드되지 않았습니다.')
      }

      await window.PortOne.loadPaymentUI({
        paymentId: 'payment-ui',
        storeId: this.storeId
      })
    } catch (error) {
      console.error('결제 UI 로드 중 오류 발생:', error)
      throw error
    }
  }

  generateOrderId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    return `order_${timestamp}_${random}`
  }

  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  validatePaymentData(paymentData) {
    const required = ['orderId', 'orderName', 'totalAmount', 'customer']
    const missing = required.filter(field => !paymentData[field])
    
    if (missing.length > 0) {
      throw new Error(`필수 결제 정보가 누락되었습니다: ${missing.join(', ')}`)
    }

    if (paymentData.totalAmount <= 0) {
      throw new Error('결제 금액은 0보다 커야 합니다.')
    }

    if (!paymentData.customer.email || !paymentData.customer.name) {
      throw new Error('고객 정보(이메일, 이름)는 필수입니다.')
    }

    return true
  }
}

export const paymentService = new PaymentService()
export default paymentService