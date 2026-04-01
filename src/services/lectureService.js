import axiosInstance from '@/utils/axiosInstance'

export const getLectureList = async ({
  pageNo = 0,
  size = 20,
  criteria = 'createdAt',
  keyword = '',
} = {}) => {
  const params = {
    pageNo,
    size,
    criteria,
  }

  if (keyword) {
    params.keyword = keyword
  }

  const response = await axiosInstance.get('/v1/curriculum/lectures', { params })
  return response.data
}

export const getLectureById = async (lectureId) => {
  const response = await axiosInstance.get(`/v1/curriculum/lectures/${lectureId}`)
  return response.data
}

export default {
  getLectureList,
  getLectureById,
}
