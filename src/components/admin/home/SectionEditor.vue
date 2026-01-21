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
                <input 
                  v-model="img.img" 
                  type="text" 
                  placeholder="이미지 URL"
                  @input="updateSection"
                />
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
          <label>표시할 강의 선택</label>
          <div class="lecture-selector">
            <div class="selected-lectures">
              <div 
                v-for="(lectureId, lecIndex) in localSection.lectures" 
                :key="lecIndex"
                class="selected-lecture"
              >
                <span>강의 ID: {{ lectureId }}</span>
                <button 
                  @click="removeLecture(lecIndex)"
                  class="btn-remove-small"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="add-lecture">
              <input 
                v-model.number="newLectureId" 
                type="number" 
                placeholder="강의 ID 입력"
                @keyup.enter="addLecture"
              />
              <button @click="addLecture" class="btn-add-lecture">추가</button>
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
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { uploadHomeImage, validateImageFile } from '@/services/homeService'
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
const newLectureId = ref('')
const fileInput = ref(null)

// 이미지 미리보기 URL (상대경로 → 절대경로 변환)
const previewImageUrl = computed(() => getFileUrl(localSection.img))

// props 변경 시 로컬 데이터 동기화
watch(() => props.section, (newSection) => {
  Object.assign(localSection, newSection)
}, { deep: true })

// 섹션 타입명 반환
const getSectionTypeName = (type) => {
  const typeNames = {
    image: '배너 이미지',
    carousel: '이미지 캐러셀',
    markdown: '마크다운 텍스트',
    lectures: '추천 강의',
    button: '액션 버튼'
  }
  return typeNames[type] || type
}

// 섹션 업데이트
const updateSection = () => {
  emit('update', props.index, { ...localSection })
}

// 이미지 업로드
const uploadImage = () => {
  fileInput.value?.click()
}

// 파일 업로드 처리
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 파일 검증
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    alert(validation.error)
    return
  }
  
  try {
    const imageUrl = await uploadHomeImage(file)
    localSection.img = imageUrl
    updateSection()
    
    // 파일 input 초기화
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

// 강의 추가
const addLecture = () => {
  if (!newLectureId.value || isNaN(newLectureId.value)) {
    alert('유효한 강의 ID를 입력하세요.')
    return
  }
  
  if (!localSection.lectures) {
    localSection.lectures = []
  }
  
  if (!localSection.lectures.includes(newLectureId.value)) {
    localSection.lectures.push(newLectureId.value)
    updateSection()
  }
  
  newLectureId.value = ''
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
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

.selected-lectures {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  min-height: 32px;
}

.selected-lecture {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #3498db;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.btn-remove-small {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin-left: 5px;
}

.add-lecture {
  display: flex;
  gap: 10px;
}

.add-lecture input {
  flex: 1;
  margin: 0;
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
  
  .add-lecture {
    flex-direction: column;
  }
}</style>