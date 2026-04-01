<!-- src/components/admin/home/SectionEditor.vue -->
<template>
  <div class="section-editor">
    <div class="section-header">
      <div class="section-info">
        <span class="section-type">{{ getSectionTypeName(section.type) }}</span>
        <span class="section-index">#{{ index + 1 }}</span>
      </div>
      <div class="section-actions">
        <button 
          @click="$emit('move-up', index)" 
          :disabled="index === 0"
          class="btn-action"
          title="위로 이동"
        >
          ↑
        </button>
        <button 
          @click="$emit('move-down', index)" 
          class="btn-action"
          title="아래로 이동"
        >
          ↓
        </button>
        <button 
          @click="$emit('delete', index)" 
          class="btn-action btn-delete"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div class="section-content">
      <!-- 이미지 타입 편집 -->
      <div v-if="section.type === 'image'" class="editor-fields">
        <div class="field-group">
          <label>이미지 URL</label>
          <div class="image-input-group">
            <input 
              v-model="localSection.img" 
              type="text" 
              placeholder="이미지 URL을 입력하세요"
              @input="updateSection"
            />
            <button @click="uploadImage" class="btn-upload">업로드</button>
          </div>
          <div v-if="localSection.img" class="image-preview">
            <img :src="previewImageUrl" alt="미리보기" />
          </div>
        </div>
        
        <div class="field-group">
          <label>텍스트</label>
          <input 
            v-model="localSection.text" 
            type="text" 
            placeholder="배너에 표시할 텍스트"
            @input="updateSection"
          />
        </div>
        
        <div class="field-group">
          <label>링크</label>
          <input 
            v-model="localSection.link" 
            type="text" 
            placeholder="클릭 시 이동할 경로 (예: /courses)"
            @input="updateSection"
          />
        </div>
      </div>
      
      <!-- 캐러셀 타입 편집 -->
      <div v-else-if="section.type === 'carousel'" class="editor-fields">
        <div class="field-group">
          <label>자동 넘김 시간 (초)</label>
          <input 
            v-model.number="localSection.time" 
            type="number" 
            min="1" 
            max="60"
            @input="updateSection"
          />
        </div>
        
        <div class="field-group">
          <label>이미지 목록</label>
          <div 
            v-for="(img, imgIndex) in localSection.imgs" 
            :key="imgIndex"
            class="carousel-item-editor"
          >
            <div class="carousel-item-header">
              <span>슬라이드 {{ imgIndex + 1 }}</span>
              <button 
                @click="removeCarouselImage(imgIndex)"
                class="btn-remove"
              >
                삭제
              </button>
            </div>
            
            <div class="carousel-fields">
              <div class="field">
                <label>이미지 URL</label>
                <div class="image-input-group">
                  <input 
                    v-model="img.img" 
                    type="text" 
                    placeholder="이미지 URL"
                    @input="updateSection"
                  />
                  <button @click="uploadCarouselImage(imgIndex)" class="btn-upload">업로드</button>
                </div>
                <div v-if="img.img" class="image-preview">
                  <img :src="getCarouselImageUrl(img.img)" alt="미리보기" />
                </div>
              </div>
              
              <div class="field">
                <label>텍스트</label>
                <input 
                  v-model="img.text" 
                  type="text" 
                  placeholder="슬라이드 텍스트"
                  @input="updateSection"
                />
              </div>
              
              <div class="field">
                <label>링크</label>
                <input 
                  v-model="img.link" 
                  type="text" 
                  placeholder="클릭 시 이동할 경로"
                  @input="updateSection"
                />
              </div>
            </div>
          </div>
          
          <button @click="addCarouselImage" class="btn-add-item">
            + 슬라이드 추가
          </button>
        </div>
      </div>
      
      <!-- 마크다운 타입 편집 -->
      <div v-else-if="section.type === 'markdown'" class="editor-fields">
        <div class="field-group">
          <label>마크다운 텍스트</label>
          <textarea 
            v-model="localSection.text" 
            rows="10"
            placeholder="마크다운 형식으로 내용을 작성하세요..."
            @input="updateSection"
          ></textarea>
          <div class="markdown-help">
            <small>
              마크다운 문법: **굵게**, *기울임*, # 제목, [링크](URL), ![이미지](URL)
            </small>
          </div>
        </div>
      </div>
      
      <!-- 강의 타입 편집 -->
      <div v-else-if="section.type === 'lectures'" class="editor-fields">
        <div class="field-group">
          <label>표시할 대표 강의 선택</label>
          <div class="lecture-selector">
            <div class="lecture-search">
              <div class="lecture-search-controls">
                <input
                  v-model.trim="lectureSearchKeyword"
                  type="text"
                  placeholder="강의 제목으로 검색"
                  @keyup.enter="searchLectures"
                />
                <button type="button" @click="searchLectures" class="btn-add-lecture">
                  검색
                </button>
                <button
                  v-if="lectureSearchKeyword"
                  type="button"
                  @click="clearLectureSearch"
                  class="btn-reset-search"
                >
                  초기화
                </button>
              </div>
              <p class="lecture-search-help">검색 결과에서 강의를 선택하면 대표 강의 목록에 추가됩니다.</p>
            </div>

            <div v-if="lectureSearchError" class="lecture-feedback lecture-feedback-error">
              {{ lectureSearchError }}
            </div>
            <div v-else-if="lectureSearchLoading" class="lecture-feedback">
              강의 목록을 불러오는 중입니다...
            </div>
            <div v-else-if="lectureOptions.length === 0" class="lecture-feedback">
              검색 결과가 없습니다.
            </div>
            <div v-else class="lecture-search-results">
              <button
                v-for="lecture in lectureOptions"
                :key="lecture.id"
                type="button"
                class="lecture-option"
                :class="{ selected: isLectureSelected(lecture.id) }"
                :disabled="isLectureSelected(lecture.id)"
                @click="addLecture(lecture)"
              >
                <img
                  :src="getLectureThumbnail(lecture)"
                  :alt="lecture.title || `강의 ${lecture.id}`"
                  class="lecture-option-thumbnail"
                />
                <div class="lecture-option-content">
                  <strong>{{ lecture.title || `강의 #${lecture.id}` }}</strong>
                  <span>강의 ID: {{ lecture.id }}</span>
                  <p>{{ lecture.description || '설명 없음' }}</p>
                </div>
                <span class="lecture-option-action">
                  {{ isLectureSelected(lecture.id) ? '선택됨' : '추가' }}
                </span>
              </button>
            </div>

            <div v-if="selectedLectures.length === 0" class="lecture-feedback">
              아직 선택된 대표 강의가 없습니다.
            </div>
            <div v-else class="selected-lectures">
              <div 
                v-for="(lecture, lecIndex) in selectedLectures"
                :key="`${lecture.id}-${lecIndex}`"
                class="selected-lecture"
              >
                <img
                  :src="getLectureThumbnail(lecture)"
                  :alt="lecture.title || `강의 ${lecture.id}`"
                  class="selected-lecture-thumbnail"
                />
                <div class="selected-lecture-info">
                  <strong>{{ lecture.title || `강의 #${lecture.id}` }}</strong>
                  <span>강의 ID: {{ lecture.id }}</span>
                </div>
                <button 
                  @click="removeLecture(lecIndex)"
                  class="btn-remove-small"
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 버튼 타입 편집 -->
      <div v-else-if="section.type === 'button'" class="editor-fields">
        <div class="field-group">
          <label>버튼 텍스트</label>
          <input 
            v-model="localSection.text" 
            type="text" 
            placeholder="버튼에 표시할 텍스트"
            @input="updateSection"
          />
        </div>
        
        <div class="field-group">
          <label>링크</label>
          <input 
            v-model="localSection.link" 
            type="text" 
            placeholder="클릭 시 이동할 경로"
            @input="updateSection"
          />
        </div>
        
        <div class="field-group">
          <label>스타일</label>
          <select v-model="localSection.style" @change="updateSection">
            <option value="primary">Primary (파란색)</option>
            <option value="secondary">Secondary (회색)</option>
            <option value="success">Success (초록색)</option>
            <option value="warning">Warning (주황색)</option>
            <option value="danger">Danger (빨간색)</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>크기</label>
          <select v-model="localSection.size" @change="updateSection">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 파일 업로드 input (숨김) -->
    <input 
      :id="`file-input-${index}`"
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { uploadHomeImage, validateImageFile } from '@/services/homeService'
import { getLectureById, getLectureList } from '@/services/lectureService'
import { getFileUrl } from '@/utils/axiosInstance'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update', 'delete', 'move-up', 'move-down'])

// 로컬 섹션 데이터 (편집용)
const localSection = reactive({ ...props.section })
const fileInput = ref(null)
const currentCarouselImageIndex = ref(null)
const lectureSearchKeyword = ref('')
const lectureSearchLoading = ref(false)
const lectureSearchError = ref('')
const lectureOptions = ref([])
const selectedLectureDetails = ref({})

// 이미지 미리보기 URL (상대경로 → 절대경로 변환)
const previewImageUrl = computed(() => getFileUrl(localSection.img))

// 캐러셀 이미지 미리보기 URL
const getCarouselImageUrl = (imgPath) => getFileUrl(imgPath)

const syncLocalSection = (newSection) => {
  Object.keys(localSection).forEach((key) => {
    if (!(key in newSection)) {
      delete localSection[key]
    }
  })

  Object.assign(localSection, newSection)

  if (!Array.isArray(localSection.lectures)) {
    localSection.lectures = []
  }
}

// 섹션 타입명 반환
const getSectionTypeName = (type) => {
  const typeNames = {
    image: '배너 이미지',
    carousel: '이미지 캐러셀',
    markdown: '마크다운 텍스트',
    lectures: '대표 강의',
    button: '액션 버튼'
  }
  return typeNames[type] || type
}

// 섹션 업데이트
const updateSection = () => {
  emit('update', props.index, { ...localSection })
}

// 배너 이미지 업로드
const uploadImage = async () => {
  currentCarouselImageIndex.value = null
  await nextTick()
  
  if (fileInput.value) {
    fileInput.value.click()
    return
  }
  
  const input = document.getElementById(`file-input-${props.index}`)
  if (input) {
    console.log('ref는 없지만 getElementById로 input 찾음')
    input.click()
  } else {
    console.error('파일 input을 찾을 수 없습니다. fileInput.value:', fileInput.value, 'index:', props.index)
    alert('파일 업로드 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.')
  }
}

// 캐러셀 이미지 업로드
const uploadCarouselImage = async (imgIndex) => {
  currentCarouselImageIndex.value = imgIndex
  await nextTick()
  
  if (fileInput.value) {
    fileInput.value.click()
    return
  }
  
  const input = document.getElementById(`file-input-${props.index}`)
  if (input) {
    input.click()
  } else {
    console.error('파일 input을 찾을 수 없습니다.')
    alert('파일 업로드 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.')
  }
}

// 파일 업로드 처리
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    alert(validation.error)
    return
  }
  
  try {
    const imageUrl = await uploadHomeImage(file)
    
    if (currentCarouselImageIndex.value !== null) {
      localSection.imgs[currentCarouselImageIndex.value].img = imageUrl
      currentCarouselImageIndex.value = null
    } else {
      localSection.img = imageUrl
    }
    
    updateSection()
    event.target.value = ''
  } catch (error) {
    console.error('이미지 업로드 실패:', error)
    alert('이미지 업로드에 실패했습니다.')
  }
}

// 캐러셀 이미지 추가
const addCarouselImage = () => {
  if (!localSection.imgs) {
    localSection.imgs = []
  }
  
  localSection.imgs.push({
    img: '/home/images/default-banner.jpg',
    text: '',
    link: ''
  })
  
  updateSection()
}

// 캐러셀 이미지 제거
const removeCarouselImage = (index) => {
  localSection.imgs.splice(index, 1)
  updateSection()
}

const selectedLectures = computed(() => {
  const lectureIds = Array.isArray(localSection.lectures) ? localSection.lectures : []

  return lectureIds.map((lectureId) => {
    return (
      selectedLectureDetails.value[lectureId] || {
        id: lectureId,
        title: `강의 #${lectureId}`,
        description: '',
        thumbnailUrl: '',
      }
    )
  })
})

const isLectureSelected = (lectureId) => {
  return Array.isArray(localSection.lectures) && localSection.lectures.includes(lectureId)
}

const getLectureThumbnail = (lecture) => {
  return (
    getFileUrl(lecture?.thumbnailUrl) ||
    'https://placehold.co/120x80/DBEAFE/1D4ED8?text=Lecture'
  )
}

const searchLectures = async () => {
  try {
    lectureSearchLoading.value = true
    lectureSearchError.value = ''

    const response = await getLectureList({
      pageNo: 0,
      size: 50,
      criteria: 'createdAt',
      keyword: lectureSearchKeyword.value,
    })

    lectureOptions.value = response?.data?.lectures || []
  } catch (error) {
    console.error('강의 검색 실패:', error)
    lectureOptions.value = []
    lectureSearchError.value = '강의 목록을 불러오지 못했습니다.'
  } finally {
    lectureSearchLoading.value = false
  }
}

const clearLectureSearch = () => {
  lectureSearchKeyword.value = ''
  searchLectures()
}

const loadSelectedLectureDetails = async () => {
  const lectureIds = Array.isArray(localSection.lectures) ? localSection.lectures : []
  const missingLectureIds = lectureIds.filter((lectureId) => !selectedLectureDetails.value[lectureId])

  if (missingLectureIds.length === 0) {
    return
  }

  try {
    const lectureResponses = await Promise.all(
      missingLectureIds.map(async (lectureId) => {
        try {
          const response = await getLectureById(lectureId)
          return response?.data || { id: lectureId, title: `강의 #${lectureId}` }
        } catch (error) {
          console.warn(`강의 정보 로드 실패 - lectureId: ${lectureId}`, error)
          return { id: lectureId, title: `강의 #${lectureId}` }
        }
      }),
    )

    const lectureDetailMap = lectureResponses.reduce((acc, lecture) => {
      acc[lecture.id] = lecture
      return acc
    }, {})

    selectedLectureDetails.value = {
      ...selectedLectureDetails.value,
      ...lectureDetailMap,
    }
  } catch (error) {
    console.error('선택된 강의 정보 로드 실패:', error)
  }
}

// props 변경 시 로컬 데이터 동기화
watch(() => props.section, (newSection) => {
  syncLocalSection(newSection)

  if (newSection.type === 'lectures' && lectureOptions.value.length === 0) {
    searchLectures()
  }
}, { deep: true, immediate: true })

watch(
  () => localSection.lectures,
  () => {
    if (props.section.type === 'lectures') {
      loadSelectedLectureDetails()
    }
  },
  { deep: true, immediate: true },
)

// 강의 추가
const addLecture = (lecture) => {
  if (!lecture?.id) {
    return
  }

  if (!Array.isArray(localSection.lectures)) {
    localSection.lectures = []
  }

  if (localSection.lectures.includes(lecture.id)) {
    return
  }

  localSection.lectures.push(lecture.id)
  selectedLectureDetails.value = {
    ...selectedLectureDetails.value,
    [lecture.id]: lecture,
  }
  updateSection()
}

// 강의 제거
const removeLecture = (index) => {
  localSection.lectures.splice(index, 1)
  updateSection()
}
</script>

<style scoped>
.section-editor {
  background-color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-type {
  font-weight: 600;
  color: #2c3e50;
}

.section-index {
  background-color: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 5px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: #ecf0f1;
  color: #2c3e50;
}

.btn-action:hover:not(:disabled) {
  background-color: #d5dbdb;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.section-content {
  padding: 20px;
}

.editor-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.field-group input,
.field-group select,
.field-group textarea {
  padding: 10px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.image-input-group {
  display: flex;
  gap: 10px;
}

.image-input-group input {
  flex: 1;
}

.btn-upload {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-upload:hover {
  background-color: #2980b9;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 200px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}

.carousel-item-editor {
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.carousel-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.btn-remove {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.carousel-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.carousel-fields .field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carousel-fields .field label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.carousel-fields .field input {
  padding: 10px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.carousel-fields .field input:focus {
  outline: none;
  border-color: #3498db;
}

.btn-add-item {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.btn-add-item:hover {
  background-color: #219a52;
}

.markdown-help {
  margin-top: 5px;
}

.markdown-help small {
  color: #7f8c8d;
  font-style: italic;
}

.lecture-selector {
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 15px;
}

.lecture-search {
  margin-bottom: 16px;
}

.lecture-search-controls {
  display: flex;
  gap: 10px;
}

.lecture-search-controls input {
  flex: 1;
}

.lecture-search-help {
  margin: 8px 0 0;
  color: #7f8c8d;
  font-size: 13px;
}

.lecture-feedback {
  padding: 12px 14px;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #475569;
  margin-bottom: 16px;
  font-size: 14px;
}

.lecture-feedback-error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.lecture-search-results {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
  max-height: 320px;
  overflow-y: auto;
}

.lecture-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 1px solid #dbe4ee;
  border-radius: 10px;
  background-color: white;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.lecture-option:hover:not(:disabled) {
  border-color: #3498db;
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.12);
}

.lecture-option:disabled {
  cursor: default;
}

.lecture-option.selected {
  border-color: #93c5fd;
  background-color: #eff6ff;
}

.lecture-option-thumbnail {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.lecture-option-content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.lecture-option-content strong,
.selected-lecture-info strong {
  color: #1e293b;
  font-size: 14px;
}

.lecture-option-content span,
.selected-lecture-info span {
  color: #64748b;
  font-size: 12px;
}

.lecture-option-content p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lecture-option-action {
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.selected-lectures {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 32px;
}

.selected-lecture {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f8fafc;
  color: #0f172a;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #dbe4ee;
}

.selected-lecture-thumbnail {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.selected-lecture-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.btn-remove-small {
  background-color: #fee2e2;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 8px;
}

.btn-add-lecture {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-add-lecture:hover {
  background-color: #219a52;
}

.btn-reset-search {
  background-color: #e2e8f0;
  color: #334155;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-reset-search:hover {
  background-color: #cbd5e1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .section-header {
    padding: 12px 15px;
  }
  
  .section-content {
    padding: 15px;
  }
  
  .carousel-fields {
    grid-template-columns: 1fr;
  }
  
  .image-input-group {
    flex-direction: column;
    gap: 5px;
  }

  .lecture-search-controls,
  .lecture-option,
  .selected-lecture {
    flex-direction: column;
    align-items: stretch;
  }
}</style>
