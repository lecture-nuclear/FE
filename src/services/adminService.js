// src/services/adminService.js
import axiosInstance from '@/utils/axiosInstance'

/**
 * 관리자 페이지 관련 API 서비스
 */

/**
 * 모든 사용자 목록 조회 (관리자용)
 * @returns {Promise} API 응답
 */
export const getAllUsers = async () => {
  try {
    console.log('📤 모든 사용자 목록 조회 API 호출')
    const response = await axiosInstance.get('/v1/member')
    console.log('✅ 사용자 목록 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 사용자 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사용자 상세 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const getUserById = async (userId) => {
  try {
    console.log(`📤 사용자 상세 조회 API 호출 - userId: ${userId}`)
    const response = await axiosInstance.get(`/v1/member/${userId}`)
    console.log('✅ 사용자 상세 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ 사용자 상세 조회 실패 - userId: ${userId}`, error)
    throw error
  }
}

/**
 * 사용자 정보 수정 (향후 구현 예정)
 * @param {number} userId - 사용자 ID
 * @param {Object} userData - 수정할 사용자 데이터
 * @returns {Promise} API 응답
 */
export const updateUser = async (userId, userData) => {
  try {
    console.log(`📤 사용자 정보 수정 API 호출 - userId: ${userId}`, userData)
    const response = await axiosInstance.put(`/v1/member/${userId}`, userData)
    console.log('✅ 사용자 정보 수정 성공:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ 사용자 정보 수정 실패 - userId: ${userId}`, error)
    throw error
  }
}

/**
 * 사용자 삭제 (향후 구현 예정)
 * @param {number} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const deleteUser = async (userId) => {
  try {
    console.log(`📤 사용자 삭제 API 호출 - userId: ${userId}`)
    const response = await axiosInstance.delete(`/v1/member/${userId}`)
    console.log('✅ 사용자 삭제 성공:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ 사용자 삭제 실패 - userId: ${userId}`, error)
    throw error
  }
}

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
}