<template>
  <div class="upload-course-container">
    <div class="upload-course-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDescription }}</p>
    </div>

    <div v-if="isInitializing" class="loading-state">강의 정보를 불러오는 중입니다...</div>

    <form v-else @submit.prevent="handleSubmit" class="upload-form">
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
          <label for="thumbnail">{{ isEditMode ? '썸네일 이미지' : '썸네일 이미지 *' }}</label>
          <input
            type="file"
            id="thumbnail"
            @change="handleThumbnailChange"
            accept="image/*"
            :disabled="thumbnailUploading"
            :required="!isEditMode && !courseData.thumbnailUrl"
          />
          <div class="form-helper">
            <small>
              {{
                isEditMode
                  ? '새 파일을 업로드하지 않으면 기존 썸네일을 유지합니다.'
                  : '썸네일을 먼저 업로드한 뒤 저장할 수 있습니다.'
              }}
            </small>
          </div>
          <div v-if="thumbnailUploading" class="upload-status">업로드 중...</div>
          <div v-if="thumbnailPreview" class="thumbnail-preview">
            <img :src="thumbnailPreview" alt="썸네일 미리보기" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <h2>강의 비디오</h2>
          <button type="button" @click="addVideo" class="add-video-btn">+ 비디오 추가</button>
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
              <label :for="`video-file-${video.id}`">
                {{ video.videoUrl ? '비디오 파일 변경' : '비디오 파일 *' }}
              </label>
              <input
                type="file"
                :id="`video-file-${video.id}`"
                @change="(event) => handleVideoFileChange(event, video.id)"
                accept="video/*"
                :disabled="videoUploading[video.id]"
                :required="!video.videoUrl"
              />
              <div v-if="videoUploading[video.id]" class="upload-status">업로드 중...</div>
              <div v-else-if="video.fileName" class="file-info">
                선택된 파일: {{ video.fileName }}
              </div>
              <div v-else-if="video.isExisting && video.originalVideoUrl" class="file-info">
                기존 비디오 유지 중
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

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="cancel-btn">
          {{ isEditMode ? '강의로 돌아가기' : '취소' }}
        </button>
        <button type="submit" :disabled="isSubmitting || isInitializing" class="submit-btn">
          {{ submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { validateImageFile } from '@/services/homeService'
import axiosInstance, { getFileUrl } from '@/utils/axiosInstance'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => Boolean(route.params.lectureId))
const lectureId = computed(() => route.params.lectureId)
const pageTitle = computed(() => (isEditMode.value ? '강의 수정' : '강의 업로드'))
const pageDescription = computed(() =>
  isEditMode.value ? '기존 강의 정보를 수정하세요.' : '새로운 강의를 업로드하세요.',
)
const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return isEditMode.value ? '수정 중...' : '업로드 중...'
  }

  return isEditMode.value ? '강의 수정 저장' : '강의 업로드'
})

const courseData = reactive({
  title: '',
  description: '',
  price: 0,
  thumbnail: null,
  thumbnailUrl: null,
})

const videos = ref([])
const thumbnailPreview = ref(null)
const isSubmitting = ref(false)
const isInitializing = ref(false)
const thumbnailUploading = ref(false)
const videoUploading = ref({})

let videoCounter = 0

const createVideoItem = (overrides = {}) => ({
  id: ++videoCounter,
  videoId: null,
  file: null,
  fileName: '',
  title: '',
  videoUrl: null,
  originalVideoUrl: null,
  isExisting: false,
  ...overrides,
})

const setThumbnailPreview = (thumbnailUrl) => {
  thumbnailPreview.value = getFileUrl(thumbnailUrl) || null
}

const resetFormState = () => {
  courseData.title = ''
  courseData.description = ''
  courseData.price = 0
  courseData.thumbnail = null
  courseData.thumbnailUrl = null
  thumbnailPreview.value = null
  videos.value = []
  videoUploading.value = {}
  videoCounter = 0

  const thumbnailInput = document.getElementById('thumbnail')
  if (thumbnailInput) {
    thumbnailInput.value = ''
  }
}

const addVideo = () => {
  videos.value.push(createVideoItem())
}

const populateForm = (lecture) => {
  resetFormState()

  courseData.title = lecture.title || ''
  courseData.description = lecture.description || ''
  courseData.price = lecture.price ?? 0
  courseData.thumbnailUrl = lecture.thumbnailUrl || null
  setThumbnailPreview(lecture.thumbnailUrl)

  const existingVideos = Array.isArray(lecture.videos) ? lecture.videos : []
  videos.value = existingVideos.map((video) =>
    createVideoItem({
      videoId: video.id ?? null,
      title: video.title || '',
      videoUrl: video.link || null,
      originalVideoUrl: video.link || null,
      isExisting: true,
    }),
  )

  if (videos.value.length === 0) {
    addVideo()
  }
}

const fetchLectureForEdit = async () => {
  if (!lectureId.value) {
    return
  }

  const response = await axiosInstance.get(`/v1/curriculum/lectures/${lectureId.value}`)
  populateForm(response.data?.data || {})
}

const initializeForm = async () => {
  if (!isEditMode.value) {
    resetFormState()
    addVideo()
    return
  }

  isInitializing.value = true

  try {
    await fetchLectureForEdit()
  } catch (error) {
    console.error('강의 수정 데이터 로드 실패:', error)
    alert('수정할 강의 정보를 불러오지 못했습니다.')
    router.push('/courses')
  } finally {
    isInitializing.value = false
  }
}

const uploadThumbnail = async (file) => {
  thumbnailUploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosInstance.post('/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('썸네일 업로드 성공:', response.data)
    return response.data.data.fileUrl
  } catch (error) {
    console.error('썸네일 업로드 실패:', error)
    const errorMessage = error.response?.data?.message || '썸네일 업로드에 실패했습니다.'
    alert(errorMessage)
    return null
  } finally {
    thumbnailUploading.value = false
  }
}

const handleThumbnailChange = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  const validation = validateImageFile(file)
  if (!validation.isValid) {
    alert(validation.error)
    event.target.value = ''
    return
  }

  const previousThumbnailUrl = courseData.thumbnailUrl
  courseData.thumbnail = file

  const reader = new FileReader()
  reader.onload = (loadEvent) => {
    thumbnailPreview.value = loadEvent.target.result
  }
  reader.readAsDataURL(file)

  const uploadedUrl = await uploadThumbnail(file)
  if (uploadedUrl) {
    courseData.thumbnailUrl = uploadedUrl
    return
  }

  courseData.thumbnail = null
  courseData.thumbnailUrl = previousThumbnailUrl
  setThumbnailPreview(previousThumbnailUrl)
  event.target.value = ''
}

const findVideoIndexById = (videoId) => videos.value.findIndex((video) => video.id === videoId)

const uploadVideo = async (file, localVideoId) => {
  videoUploading.value[localVideoId] = true

  try {
    const fileName = encodeURIComponent(file.name)
    const response = await axiosInstance.post(`/upload/video?fileName=${fileName}`, file, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })

    console.log('비디오 업로드 성공:', response.data)
    return response.data.data.fileUrl
  } catch (error) {
    console.error('비디오 업로드 실패:', error)
    const errorMessage = error.response?.data?.message || '비디오 업로드에 실패했습니다.'
    alert(errorMessage)
    return null
  } finally {
    delete videoUploading.value[localVideoId]
  }
}

const handleVideoFileChange = async (event, localVideoId) => {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  const videoIndex = findVideoIndexById(localVideoId)
  if (videoIndex === -1) {
    return
  }

  const targetVideo = videos.value[videoIndex]
  const previousVideoUrl = targetVideo.videoUrl

  targetVideo.file = file
  targetVideo.fileName = file.name

  const uploadedUrl = await uploadVideo(file, localVideoId)
  if (uploadedUrl) {
    targetVideo.videoUrl = uploadedUrl
    return
  }

  targetVideo.file = null
  targetVideo.fileName = ''
  targetVideo.videoUrl = previousVideoUrl
  event.target.value = ''
}

const removeVideo = (index) => {
  const [removedVideo] = videos.value.splice(index, 1)
  if (removedVideo) {
    delete videoUploading.value[removedVideo.id]
  }
}

const buildRequestData = () => ({
  title: courseData.title.trim(),
  thumbnailUrl: courseData.thumbnailUrl,
  description: courseData.description.trim(),
  price: Number(courseData.price) || 0,
  videos: videos.value.map((video) => ({
    ...(video.videoId ? { id: video.videoId } : {}),
    title: video.title.trim(),
    link: video.videoUrl,
  })),
})

const hasPendingVideoUploads = () => Object.values(videoUploading.value).some(Boolean)

const validateBeforeSubmit = () => {
  if (thumbnailUploading.value) {
    alert('썸네일 업로드가 아직 진행 중입니다.')
    return false
  }

  if (hasPendingVideoUploads()) {
    alert('비디오 업로드가 아직 진행 중입니다.')
    return false
  }

  if (!courseData.thumbnailUrl) {
    alert('썸네일 업로드가 완료되지 않았습니다.')
    return false
  }

  if (videos.value.length === 0) {
    alert('최소 1개 이상의 비디오를 등록해주세요.')
    return false
  }

  const invalidVideo = videos.value.find((video) => !video.title.trim() || !video.videoUrl)
  if (invalidVideo) {
    alert('모든 비디오의 제목과 업로드 상태를 확인해주세요.')
    return false
  }

  return true
}

const updateLecture = async (requestData) => {
  const primaryEndpoint = `/v1/curriculum/lectures/${lectureId.value}`
  const fallbackEndpoint = `/v1/curriculum/lecture/${lectureId.value}`

  try {
    return await axiosInstance.put(primaryEndpoint, requestData)
  } catch (error) {
    const status = error.response?.status
    if (status === 404 || status === 405) {
      return axiosInstance.put(fallbackEndpoint, requestData)
    }

    throw error
  }
}

const handleSubmit = async () => {
  if (!validateBeforeSubmit()) {
    return
  }

  isSubmitting.value = true

  try {
    const requestData = buildRequestData()
    console.log('Sending course data:', requestData)

    if (isEditMode.value) {
      await updateLecture(requestData)
      alert('강의 수정이 완료되었습니다!')
      router.push(`/lectures/${lectureId.value}`)
      return
    }

    await axiosInstance.post('/v1/curriculum/lecture', requestData)
    alert('강의 업로드가 완료되었습니다!')
    router.push('/courses')
  } catch (error) {
    console.error('강의 저장 실패:', error)
    const errorMessage = error.response?.data?.message || '강의 저장에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (isEditMode.value && lectureId.value) {
    router.push(`/lectures/${lectureId.value}`)
    return
  }

  resetFormState()
  addVideo()
}

watch(
  () => route.params.lectureId,
  async () => {
    await initializeForm()
  },
  { immediate: true },
)
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

.loading-state {
  text-align: center;
  padding: 48px 20px;
  font-size: 1rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.upload-form {
  background: transparent;
  padding: 0;
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

.form-helper {
  margin-top: 6px;
}

.form-helper small,
.price-info small {
  color: #666;
  font-size: 12px;
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
