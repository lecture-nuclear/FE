// src/services/homeService.js
import axiosInstance from '@/utils/axiosInstance'

/**
 * 홈페이지 관련 API 서비스
 */

/**
 * 홈페이지 콘텐츠 조회 (일반 사용자용)
 * @returns {Promise} API 응답
 */
export const getHomeContent = async () => {
  try {
    console.log('📤 홈페이지 콘텐츠 조회 API 호출')
    const response = await axiosInstance.get('/v1/home')
    console.log('✅ 홈페이지 콘텐츠 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 홈페이지 콘텐츠 조회 실패:', error)
    throw error
  }
}

/**
 * 관리자용 홈페이지 콘텐츠 조회
 * @returns {Promise} API 응답
 */
export const getHomeContentForAdmin = async () => {
  try {
    console.log('📤 관리자용 홈페이지 콘텐츠 조회 API 호출')
    const response = await axiosInstance.get('/v1/admin/home')
    console.log('✅ 관리자용 홈페이지 콘텐츠 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 관리자용 홈페이지 콘텐츠 조회 실패:', error)
    throw error
  }
}

/**
 * 홈페이지 콘텐츠 업데이트
 * @param {Object} homeData - 업데이트할 홈페이지 데이터
 * @param {string} version - 버전 정보 (옵션)
 * @returns {Promise} API 응답
 */
export const updateHomeContent = async (homeData, version = '1.0') => {
  try {
    console.log('📤 홈페이지 콘텐츠 업데이트 API 호출', { homeData, version })
    
    const requestData = {
      home: homeData,
      version: version
    }
    
    const response = await axiosInstance.put('/v1/admin/home', requestData)
    console.log('✅ 홈페이지 콘텐츠 업데이트 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 홈페이지 콘텐츠 업데이트 실패:', error)
    throw error
  }
}

/**
 * 홈페이지 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export const uploadHomeImage = async (file) => {
  try {
    console.log('📤 홈페이지 이미지 업로드 API 호출:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post('/v1/admin/home/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    console.log('✅ 홈페이지 이미지 업로드 성공:', response.data)
    // FileUploadResponse에서 fileUrl 필드 반환
    return response.data.data.fileUrl
  } catch (error) {
    console.error('❌ 홈페이지 이미지 업로드 실패:', error)
    throw error
  }
}

/**
 * 이미지 파일 검증
 * @param {File} file - 검증할 파일
 * @returns {Object} 검증 결과 { isValid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' }
  }
  
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 허용)' 
    }
  }
  
  // 파일 크기 검증 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: '파일 크기는 10MB 이하여야 합니다.' 
    }
  }
  
  return { isValid: true }
}

/**
 * 이미지 미리보기 URL 생성
 * @param {File} file - 미리보기할 파일
 * @returns {string} 미리보기 URL
 */
export const createImagePreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

/**
 * 이미지 미리보기 URL 해제
 * @param {string} url - 해제할 URL
 */
export const revokeImagePreviewUrl = (url) => {
  URL.revokeObjectURL(url)
}

export default {
  getHomeContent,
  getHomeContentForAdmin,
  updateHomeContent,
  uploadHomeImage,
  validateImageFile,
  createImagePreviewUrl,
  revokeImagePreviewUrl
}