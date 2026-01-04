<template>
  <div class="upload-course-container">
    <div class="upload-course-header">
      <h1>강의 업로드</h1>
      <p>새로운 강의를 업로드하세요.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="upload-form">
      <!-- 기본 정보 섹션 -->
      <div class="form-section">
        <h2>기본 정보</h2>
        
        <div class="form-group">
          <label for="title">강의 제목 *</label>
          <input
            type="text"
            id="title"
            v-model="courseData.title"
            placeholder="강의 제목을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">강의 설명 *</label>
          <textarea
            id="description"
            v-model="courseData.description"
            placeholder="강의 설명을 입력하세요"
            rows="5"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="price">강의 가격 *</label>
          <input
            type="number"
            id="price"
            v-model.number="courseData.price"
            placeholder="강의 가격을 입력하세요 (원)"
            min="0"
            step="1000"
            required
          />
          <div class="price-info">
            <small>0원으로 설정하면 무료 강의가 됩니다.</small>
          </div>
        </div>

        <div class="form-group">
          <label for="thumbnail">썸네일 이미지 *</label>
          <input
            type="file"
            id="thumbnail"
            @change="handleThumbnailChange"
            accept="image/*"
            :disabled="thumbnailUploading"
            required
          />
          <div v-if="thumbnailUploading" class="upload-status">
            업로드 중...
          </div>
          <div v-if="thumbnailPreview" class="thumbnail-preview">
            <img :src="thumbnailPreview" alt="썸네일 미리보기" />
          </div>
        </div>
      </div>

      <!-- 비디오 섹션 -->
      <div class="form-section">
        <div class="section-header">
          <h2>강의 비디오</h2>
          <button type="button" @click="addVideo" class="add-video-btn">
            + 비디오 추가
          </button>
        </div>

        <div v-if="videos.length === 0" class="no-videos">
          <p>아직 추가된 비디오가 없습니다. 비디오를 추가해주세요.</p>
        </div>

        <div v-for="(video, index) in videos" :key="video.id" class="video-item">
          <div class="video-header">
            <h3>비디오 {{ index + 1 }}</h3>
            <button type="button" @click="removeVideo(index)" class="remove-video-btn">
              - 제거
            </button>
          </div>

          <div class="video-form">
            <div class="form-group">
              <label :for="`video-file-${video.id}`">비디오 파일 *</label>
              <input
                type="file"
                :id="`video-file-${video.id}`"
                @change="(event) => handleVideoFileChange(event, index)"
                accept="video/*"
                :disabled="videoUploading[index]"
                required
              />
              <div v-if="videoUploading[index]" class="upload-status">
                업로드 중...
              </div>
              <div v-if="video.fileName" class="file-info">
                선택된 파일: {{ video.fileName }}
              </div>
            </div>

            <div class="form-group">
              <label :for="`video-title-${video.id}`">비디오 제목 *</label>
              <input
                type="text"
                :id="`video-title-${video.id}`"
                v-model="video.title"
                placeholder="비디오 제목을 입력하세요"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="cancel-btn">
          취소
        </button>
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? '업로드 중...' : '강의 업로드' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { validateImageFile } from '@/services/homeService'
import axiosInstance from '@/utils/axiosInstance'

const router = useRouter()

// 폼 데이터
const courseData = reactive({
  title: '',
  description: '',
  price: 0,
  thumbnail: null,
  thumbnailUrl: null
})

const videos = ref([])
const thumbnailPreview = ref(null)
const isSubmitting = ref(false)
const thumbnailUploading = ref(false)
const videoUploading = ref({})

// 비디오 아이템 카운터 (고유 ID 생성용)
let videoCounter = 0

// 썸네일 파일 변경 처리
const handleThumbnailChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    // 파일 검증
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      alert(validation.error)
      event.target.value = '' // 파일 입력 초기화
      return
    }
    
    courseData.thumbnail = file
    
    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
    
    // 썸네일 업로드
    await uploadThumbnail(file)
  }
}

// 썸네일 업로드 함수
const uploadThumbnail = async (file) => {
  thumbnailUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post('/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    courseData.thumbnailUrl = response.data.data.fileUrl
    
    console.log('썸네일 업로드 성공:', response.data)
  } catch (error) {
    console.error('썸네일 업로드 실패:', error)
    const errorMessage = error.response?.data?.message || '썸네일 업로드에 실패했습니다.'
    alert(errorMessage)
  } finally {
    thumbnailUploading.value = false
  }
}

// 비디오 추가
const addVideo = () => {
  videos.value.push({
    id: ++videoCounter,
    file: null,
    fileName: '',
    title: '',
    videoUrl: null
  })
}

// 비디오 제거
const removeVideo = (index) => {
  videos.value.splice(index, 1)
}

// 비디오 파일 변경 처리
const handleVideoFileChange = async (event, index) => {
  const file = event.target.files[0]
  if (file) {
    videos.value[index].file = file
    videos.value[index].fileName = file.name
    
    // 비디오 업로드
    await uploadVideo(file, index)
  }
}

// 비디오 업로드 함수
const uploadVideo = async (file, index) => {
  videoUploading.value[index] = true
  
  try {
    const fileName = encodeURIComponent(file.name)
    
    const response = await axiosInstance.post(`/upload/video?fileName=${fileName}`, file, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
    
    videos.value[index].videoUrl = response.data.data.fileUrl
    
    console.log('비디오 업로드 성공:', response.data)
  } catch (error) {
    console.error('비디오 업로드 실패:', error)
    const errorMessage = error.response?.data?.message || '비디오 업로드에 실패했습니다.'
    alert(errorMessage)
  } finally {
    videoUploading.value[index] = false
  }
}

// 폼 제출 처리
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // 썸네일 URL이 없으면 업로드 실패
    if (!courseData.thumbnailUrl) {
      alert('썸네일 업로드가 완료되지 않았습니다.')
      return
    }
    
    // 비디오 업로드가 완료되지 않은 것이 있는지 확인
    const unuploadedVideos = videos.value.filter(video => !video.videoUrl)
    if (unuploadedVideos.length > 0) {
      alert('모든 비디오 업로드가 완료되지 않았습니다.')
      return
    }
    
    // API 요청 데이터 구성
    const requestData = {
      title: courseData.title,
      thumbnailUrl: courseData.thumbnailUrl,
      description: courseData.description,
      price: courseData.price,
      videos: videos.value.map(video => ({
        title: video.title,
        link: video.videoUrl
      }))
    }
    
    console.log('Sending course data:', requestData)
    
    // 강의 업로드 API 호출
    const response = await axiosInstance.post('/v1/curriculum/lecture', requestData)
    
    console.log('강의 업로드 성공:', response.data)
    
    alert('강의 업로드가 완료되었습니다!')
    
    // 업로드 완료 후 강의 목록으로 이동
    router.push('/courses')
  } catch (error) {
    console.error('업로드 실패:', error)
    alert('업로드에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 폼 초기화
const resetForm = () => {
  courseData.title = ''
  courseData.description = ''
  courseData.price = 0
  courseData.thumbnail = null
  courseData.thumbnailUrl = null
  thumbnailPreview.value = null
  videos.value = []
  
  // 파일 input 초기화
  const thumbnailInput = document.getElementById('thumbnail')
  if (thumbnailInput) thumbnailInput.value = ''
}

// 초기 비디오 하나 추가
addVideo()
</script>

<style scoped>
.upload-course-container {
  width: 90%;
  max-width: none;
  margin: 0 auto;
  padding: 20px;
}

.upload-course-header {
  text-align: center;
  margin-bottom: 40px;
}

.upload-course-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.upload-course-header p {
  font-size: 1.1rem;
  color: #666;
}

.upload-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-video-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.add-video-btn:hover {
  background-color: #218838;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.thumbnail-preview {
  margin-top: 10px;
}

.thumbnail-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.upload-status {
  margin-top: 5px;
  font-size: 14px;
  color: #007bff;
  font-style: italic;
}

.no-videos {
  text-align: center;
  padding: 40px;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.video-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.video-header h3 {
  margin: 0;
  color: #333;
}

.remove-video-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.remove-video-btn:hover {
  background-color: #c82333;
}

.video-form {
  display: grid;
  gap: 15px;
}

.file-info {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.price-info {
  margin-top: 5px;
}

.price-info small {
  color: #666;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #007bff;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .upload-course-container {
    padding: 10px;
  }
  
  .upload-form {
    padding: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>