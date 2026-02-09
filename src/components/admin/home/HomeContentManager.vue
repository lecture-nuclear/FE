<!-- src/components/admin/home/HomeContentManager.vue -->
<template>
  <div class="home-content-manager">
    <div class="manager-header">
      <div class="header-title">
        <h2>🏠 홈화면 관리</h2>
        <div v-if="hasUnsavedChanges" class="unsaved-indicator">
          <span class="unsaved-dot">●</span>
          <span class="unsaved-text">저장되지 않은 변경사항</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="addSection" class="btn-add">+ 섹션 추가</button>
        <button @click="togglePreview" class="btn-preview">
          {{ previewMode ? '편집 모드' : '미리보기' }}
        </button>
        <button
          @click="saveContent"
          class="btn-save"
          :disabled="saving"
          :class="{ 'has-changes': hasUnsavedChanges }"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <div class="manager-content">
      <!-- 편집 모드 -->
      <div v-if="!previewMode" class="edit-mode">
        <div class="sections-list">
          <div
            v-for="(section, index) in homeContent.home"
            :key="`section-${index}`"
            class="section-editor"
          >
            <SectionEditor
              :section="section"
              :index="index"
              @update="updateSection"
              @delete="deleteSection"
              @move-up="moveSectionUp"
              @move-down="moveSectionDown"
            />
          </div>
        </div>

        <div v-if="homeContent.home.length === 0" class="empty-sections">
          <p>아직 추가된 섹션이 없습니다.</p>
          <button @click="addSection" class="btn-add-first">첫 번째 섹션 추가</button>
        </div>
      </div>

      <!-- 미리보기 모드 -->
      <div v-else class="preview-mode">
        <div class="preview-header">
          <h3>미리보기</h3>
          <p>실제 홈페이지에서 보이는 모습입니다</p>
        </div>
        <div class="preview-content">
          <component
            v-for="item in renderedContent"
            :key="item.key"
            :is="item.component"
            v-bind="item.props"
            @navigate="handlePreviewNavigation"
          />
        </div>
      </div>
    </div>

    <!-- 섹션 타입 선택 모달 -->
    <SectionTypeModal
      v-if="showTypeModal"
      @select="addSectionOfType"
      @close="showTypeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { getHomeContentForAdmin, updateHomeContent } from '@/services/homeService'
import { renderHomeContent, validateHomeData, calculateDataSize } from '@/utils/homeRenderer'
import SectionEditor from './SectionEditor.vue'
import SectionTypeModal from './SectionTypeModal.vue'

// 반응형 데이터
const previewMode = ref(false)
const saving = ref(false)
const showTypeModal = ref(false)
const hasUnsavedChanges = ref(false)
const originalContent = ref(null)
const homeContent = reactive({
  home: [],
})

// 미리보기용 렌더링된 콘텐츠
const renderedContent = computed(() => {
  return renderHomeContent(homeContent)
})

// 홈 콘텐츠 로드
const loadHomeContent = async () => {
  try {
    const response = await getHomeContentForAdmin()

    // 서버 응답 파싱
    // BE에서 @JsonRawValue로 반환하므로 response.data.home은 객체일 수 있음
    // 구조: { data: { home: { home: [...] }, version: "1.0" } }
    let homeArray = []

    const homeData = response.data.home
    if (typeof homeData === 'string') {
      // JSON 문자열인 경우
      const parsed = JSON.parse(homeData)
      homeArray = Array.isArray(parsed) ? parsed : parsed.home || []
    } else if (homeData && typeof homeData === 'object') {
      // 객체인 경우 (중첩 구조 처리)
      homeArray = Array.isArray(homeData) ? homeData : homeData.home || []
    }

    homeContent.home = homeArray

    // 원본 콘텐츠 저장 (변경 사항 감지용)
    originalContent.value = JSON.stringify(homeContent.home)
    hasUnsavedChanges.value = false

    console.log('관리자용 홈 콘텐츠 로드 완료:', homeContent.home)
  } catch (error) {
    console.error('홈 콘텐츠 로드 실패:', error)
    alert('홈 콘텐츠를 불러오는데 실패했습니다.')
  }
}

// 홈 콘텐츠 저장
const saveContent = async () => {
  try {
    // 데이터 검증
    const validation = validateHomeData(homeContent)
    if (!validation.isValid) {
      alert('데이터 검증 실패:\\n' + validation.errors.join('\\n'))
      return
    }

    // 크기 검증
    const sizeInfo = calculateDataSize(homeContent)
    if (parseFloat(sizeInfo.mb) > 10) {
      alert(`데이터 크기가 너무 큽니다 (${sizeInfo.mb}MB). 10MB 이하로 줄여주세요.`)
      return
    }

    saving.value = true

    await updateHomeContent(homeContent.home, '1.0')

    // 저장 성공 시 원본 콘텐츠 업데이트
    originalContent.value = JSON.stringify(homeContent.home)
    hasUnsavedChanges.value = false

    alert('홈페이지 콘텐츠가 성공적으로 저장되었습니다!')
  } catch (error) {
    console.error('홈 콘텐츠 저장 실패:', error)
    alert('홈 콘텐츠 저장에 실패했습니다: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// 미리보기 모드 토글
const togglePreview = () => {
  previewMode.value = !previewMode.value
}

// 변경사항 감지
const checkForChanges = () => {
  const currentContent = JSON.stringify(homeContent.home)
  hasUnsavedChanges.value = originalContent.value !== currentContent
}

// 섹션 추가
const addSection = () => {
  showTypeModal.value = true
}

// 특정 타입의 섹션 추가
const addSectionOfType = (type) => {
  const newSection = createDefaultSection(type)
  homeContent.home.push(newSection)
  showTypeModal.value = false
  checkForChanges()
}

// 기본 섹션 생성
const createDefaultSection = (type) => {
  const defaults = {
    image: {
      type: 'image',
      img: '/home/images/default-banner.jpg',
      text: '새로운 배너 이미지',
      link: '',
    },
    carousel: {
      type: 'carousel',
      imgs: [
        {
          img: '/home/images/default-banner.jpg',
          text: '첫 번째 슬라이드',
          link: '',
        },
      ],
      time: 5,
    },
    markdown: {
      type: 'markdown',
      text: '## 새로운 마크다운 섹션\\n\\n여기에 내용을 작성하세요.',
    },
    lectures: {
      type: 'lectures',
      lectures: [],
    },
    button: {
      type: 'button',
      text: '버튼 텍스트',
      link: '',
      style: 'primary',
      size: 'medium',
    },
  }

  return defaults[type] || {}
}

// 섹션 업데이트
const updateSection = (index, updatedSection) => {
  homeContent.home[index] = { ...updatedSection }
  checkForChanges()
}

// 섹션 삭제
const deleteSection = (index) => {
  if (confirm('이 섹션을 삭제하시겠습니까?')) {
    homeContent.home.splice(index, 1)
    checkForChanges()
  }
}

// 섹션 위로 이동
const moveSectionUp = (index) => {
  if (index > 0) {
    const section = homeContent.home.splice(index, 1)[0]
    homeContent.home.splice(index - 1, 0, section)
    checkForChanges()
  }
}

// 섹션 아래로 이동
const moveSectionDown = (index) => {
  if (index < homeContent.home.length - 1) {
    const section = homeContent.home.splice(index, 1)[0]
    homeContent.home.splice(index + 1, 0, section)
    checkForChanges()
  }
}

// 미리보기 네비게이션 처리 (실제 네비게이션 방지)
const handlePreviewNavigation = (link) => {
  alert(`미리보기 모드에서는 네비게이션이 비활성화됩니다.\\n링크: ${link}`)
}

// 페이지 떠날 때 경고
const confirmLeave = () => {
  if (hasUnsavedChanges.value) {
    return '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?'
  }
  return true
}

// 브라우저 새로고침/탭 닫기 시 경고
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    const message = '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?'
    event.preventDefault()
    event.returnValue = message
    return message
  }
}

// Vue Router 네비게이션 가드
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm(
      '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 떠나시겠습니까?',
    )
    if (!answer) return false
  }
})

// 컴포넌트 마운트 시 데이터 로드 및 이벤트 리스너 등록
onMounted(() => {
  loadHomeContent()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.home-content-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e8ed;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.manager-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #856404;
}

.unsaved-dot {
  color: #f39c12;
  font-size: 14px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.unsaved-text {
  font-weight: 600;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-add,
.btn-preview,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-add {
  background-color: #27ae60;
  color: white;
}

.btn-add:hover {
  background-color: #219a52;
}

.btn-preview {
  background-color: #3498db;
  color: white;
}

.btn-preview:hover {
  background-color: #2980b9;
}

.btn-save {
  background-color: #e74c3c;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-save:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-save.has-changes {
  background-color: #f39c12;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
  animation: subtle-pulse 2s infinite;
}

.btn-save.has-changes:hover:not(:disabled) {
  background-color: #e67e22;
}

@keyframes subtle-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.manager-content {
  background-color: transparent;
  min-height: 600px;
}

/* 편집 모드 */
.edit-mode {
  padding: 30px;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-editor {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
}

.empty-sections {
  text-align: center;
  padding: 80px 20px;
  color: #7f8c8d;
}

.empty-sections p {
  font-size: 18px;
  margin-bottom: 20px;
}

.btn-add-first {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-add-first:hover {
  background-color: #2980b9;
}

/* 미리보기 모드 */
.preview-mode {
  padding: 0;
}

.preview-header {
  background-color: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
  text-align: center;
}

.preview-header h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.preview-header p {
  color: #7f8c8d;
  margin: 0;
}

.preview-content {
  padding: 0;
  overflow-x: hidden;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .home-content-manager {
    padding: 15px;
  }

  .manager-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-title {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .unsaved-indicator {
    font-size: 11px;
    padding: 3px 8px;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-add,
  .btn-preview,
  .btn-save {
    flex: 1;
    min-width: 100px;
  }

  .edit-mode {
    padding: 20px;
  }

  .preview-header {
    padding: 15px 20px;
  }
}
</style>
