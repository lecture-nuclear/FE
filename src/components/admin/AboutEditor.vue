<template>
  <div class="about-editor">
    <!-- 리스트 뷰 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="editor-header">
        <h2 class="title-with-icon">
          <PhFileText :size="26" weight="duotone" />
          <span>서비스 소개 관리</span>
        </h2>
        <div class="header-actions">
          <button @click="openEditor('create')" class="btn-create btn-icon-only" title="새로 생성">
            <PhPlus :size="18" weight="bold" />
          </button>
          <button @click="openEditor('edit')" class="btn-edit" :disabled="!selectedAbout">
            수정
          </button>
          <button
            @click="deleteAbout"
            class="btn-delete"
            :disabled="!selectedAbout || isSelectedDefault"
          >
            삭제
          </button>
          <button
            @click="setAsDefault"
            class="btn-set-default"
            :disabled="!selectedAbout || isSelectedDefault"
          >
            기본으로 선택
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-message status-message">
        <PhSpinnerGap class="spin" :size="18" weight="bold" />
        <span>로딩 중...</span>
      </div>

      <div v-else-if="errorMessage" class="error-message status-message">
        <PhXCircle :size="18" weight="fill" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-else class="about-list">
        <div
          v-for="about in aboutList"
          :key="about.id"
          :class="[
            'about-item',
            { 'is-default': about.isDefault },
            { 'is-selected': selectedAbout === about.id },
          ]"
          @click="toggleSelection(about.id)"
        >
          <div class="about-content" v-html="about.content"></div>
          <div class="about-meta">
            <span>생성: {{ formatDate(about.createdAt) }}</span>
            <span>수정: {{ formatDate(about.updatedAt) }}</span>
            <span v-if="about.isDefault" class="default-badge">기본</span>
          </div>
        </div>

        <div v-if="aboutList.length === 0" class="empty-message status-message">
          <PhTray :size="18" weight="duotone" />
          <span>등록된 About이 없습니다.</span>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="btn-page btn-with-icon"
        >
          <PhCaretLeft :size="14" weight="bold" />
          <span>이전</span>
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="btn-page btn-with-icon"
        >
          <span>다음</span>
          <PhCaretRight :size="14" weight="bold" />
        </button>
      </div>
    </div>

    <!-- 에디터 뷰 -->
    <div v-if="viewMode === 'editor'" class="editor-view">
      <div class="editor-header">
        <div class="header-left">
          <button @click="closeEditor" class="btn-back btn-with-icon">
            <PhCaretLeft :size="16" weight="bold" />
            <span>뒤로가기</span>
          </button>
          <h2 class="title-with-icon">
            <component
              :is="editorMode === 'create' ? PhPlusCircle : PhPencilSimpleLine"
              :size="24"
              weight="duotone"
            />
            <span>{{ editorMode === 'create' ? 'About 생성' : 'About 편집' }}</span>
          </h2>
        </div>
      </div>

      <div class="editor-container">
        <div class="editor-section">
          <label for="content-editor">내용 (HTML 지원)</label>
          <textarea
            id="content-editor"
            v-model="editorContent"
            rows="20"
            placeholder="서비스 소개 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
          ></textarea>
          <div class="editor-help">
            <small>
              <span class="help-with-icon">
                <PhLightbulbFilament :size="16" weight="duotone" />
                <span>
                  HTML 태그 사용 가능: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;, &lt;em&gt;,
                  &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt; 등
                </span>
              </span>
            </small>
          </div>
        </div>

        <div class="preview-section">
          <h3>미리보기</h3>
          <div class="preview-content" v-html="editorContent"></div>
        </div>
      </div>

      <div class="editor-actions">
        <button
          @click="saveAndSetDefault"
          class="btn-save"
          :disabled="saving || !editorContent.trim()"
        >
          {{ saving ? '처리 중...' : '기본으로 설정' }}
        </button>
        <button @click="closeEditor" class="btn-cancel" :disabled="saving">취소</button>
      </div>

      <div v-if="errorMessage" class="error-message status-message">
        <PhXCircle :size="18" weight="fill" />
        <span>{{ errorMessage }}</span>
      </div>
      <div v-if="successMessage" class="success-message status-message">
        <PhCheckCircle :size="18" weight="fill" />
        <span>{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  PhCaretLeft,
  PhCaretRight,
  PhCheckCircle,
  PhFileText,
  PhLightbulbFilament,
  PhPencilSimpleLine,
  PhPlus,
  PhPlusCircle,
  PhSpinnerGap,
  PhTray,
  PhXCircle,
} from '@phosphor-icons/vue'
import axiosInstance from '@/utils/axiosInstance'

// 뷰 모드
const viewMode = ref('list')
const editorMode = ref('create')

// 리스트 관련
const aboutList = ref([])
const selectedAbout = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const pageSize = ref(10)

// 에디터 관련
const editorContent = ref('')

// 상태
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed
const isSelectedDefault = computed(() => {
  if (!selectedAbout.value) return false
  const selected = aboutList.value.find((item) => item.id === selectedAbout.value)
  return selected?.isDefault || false
})

// 리스트 조회
const loadAboutList = async (page = 0) => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axiosInstance.get('/v1/about/list', {
      params: {
        page,
        size: pageSize.value,
        sort: 'createdAt,DESC',
      },
    })

    if (response.data && response.data.data) {
      aboutList.value = response.data.data.content || []
      currentPage.value = response.data.data.number || 0
      totalPages.value = response.data.data.totalPages || 0
      totalElements.value = response.data.data.totalElements || 0
    }
  } catch (error) {
    console.error('About 목록 조회 실패:', error)
    errorMessage.value = 'About 목록을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 페이지 이동
const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    loadAboutList(page)
  }
}

// 선택 토글
const toggleSelection = (id) => {
  if (selectedAbout.value === id) {
    selectedAbout.value = null
  } else {
    selectedAbout.value = id
  }
}

// 에디터 열기
const openEditor = (mode) => {
  editorMode.value = mode
  viewMode.value = 'editor'
  errorMessage.value = ''
  successMessage.value = ''

  if (mode === 'create') {
    editorContent.value = ''
  } else if (mode === 'edit' && selectedAbout.value) {
    const selected = aboutList.value.find((item) => item.id === selectedAbout.value)
    if (selected) {
      editorContent.value = selected.content
    }
  }
}

// 에디터 닫기
const closeEditor = () => {
  viewMode.value = 'list'
  editorContent.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

// 저장 및 기본 설정
const saveAndSetDefault = async () => {
  if (!editorContent.value.trim()) {
    errorMessage.value = '내용을 입력해주세요.'
    return
  }

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // 1. About 생성
    const createResponse = await axiosInstance.post('/v1/about', {
      content: editorContent.value,
    })

    if (createResponse.data && createResponse.data.data) {
      const newAboutId = createResponse.data.data.id

      // 2. 기본으로 설정
      await axiosInstance.post(`/v1/about/${newAboutId}/set-default`)

      successMessage.value = 'About이 생성되고 기본으로 설정되었습니다!'

      // 3. 리스트 새로고침 및 뷰 전환
      setTimeout(async () => {
        await loadAboutList(0)
        closeEditor()
      }, 1000)
    }
  } catch (error) {
    console.error('About 저장 실패:', error)
    errorMessage.value = 'About 저장에 실패했습니다.'
  } finally {
    saving.value = false
  }
}

// 기본으로 설정
const setAsDefault = async () => {
  if (!selectedAbout.value) return

  try {
    await axiosInstance.post(`/v1/about/${selectedAbout.value}/set-default`)
    successMessage.value = '기본 About으로 설정되었습니다!'

    setTimeout(() => {
      successMessage.value = ''
      loadAboutList(currentPage.value)
    }, 1500)
  } catch (error) {
    console.error('기본 설정 실패:', error)
    errorMessage.value = '기본 설정에 실패했습니다.'
  }
}

// 삭제
const deleteAbout = async () => {
  if (!selectedAbout.value || isSelectedDefault.value) return

  if (!confirm('정말 이 About을 삭제하시겠습니까?')) {
    return
  }

  try {
    await axiosInstance.delete(`/v1/about/${selectedAbout.value}`)
    successMessage.value = 'About이 삭제되었습니다!'

    selectedAbout.value = null

    setTimeout(() => {
      successMessage.value = ''
      loadAboutList(currentPage.value)
    }, 1500)
  } catch (error) {
    console.error('About 삭제 실패:', error)
    if (error.response?.status === 400) {
      errorMessage.value = '기본 About는 삭제할 수 없습니다.'
    } else {
      errorMessage.value = 'About 삭제에 실패했습니다.'
    }
  }
}

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadAboutList(0)
})
</script>

<style scoped>
.about-editor {
  padding: 0;
  background-color: transparent;
  min-height: 600px;
}

/* 헤더 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e8ed;
}

.editor-header h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.title-with-icon,
.btn-with-icon,
.status-message,
.help-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 버튼 공통 */
button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-create {
  background-color: #3498db;
  color: white;
}

.btn-icon-only {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
}

.btn-create:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-edit {
  background-color: #f39c12;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-set-default {
  background-color: #27ae60;
  color: white;
}

.btn-set-default:hover:not(:disabled) {
  background-color: #229954;
}

.btn-back {
  background-color: #6c757d;
  color: white;
}

.btn-back:hover {
  background-color: #5a6268;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #5a6268;
}

/* 리스트 뷰 */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.about-item {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.about-item:hover {
  background-color: #e9ecef;
}

.about-item.is-default {
  border-color: #28a745;
}

.about-item.is-selected {
  box-shadow: inset 0 0 0 2px #dc3545;
}

.about-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
}

.about-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #7f8c8d;
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
}

.default-badge {
  background-color: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-page {
  background-color: #3498db;
  color: white;
}

.btn-page:hover:not(:disabled) {
  background-color: #2980b9;
}

.page-info {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 에디터 뷰 */
.editor-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.editor-section,
.preview-section {
  display: flex;
  flex-direction: column;
}

.editor-section label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #3498db;
}

.editor-help {
  margin-top: 10px;
  color: #7f8c8d;
  font-size: 12px;
}

.preview-section h3 {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
}

.preview-content {
  background-color: #f8f9fa;
  padding: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  min-height: 400px;
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.preview-content:empty::before {
  content: '미리보기가 여기에 표시됩니다...';
  color: #adb5bd;
  font-style: italic;
}

.editor-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 메시지 */
.loading-message,
.empty-message {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 16px;
}

.error-message,
.success-message {
  padding: 12px 15px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

/* 반응형 */
@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .about-editor {
    padding: 20px;
  }

  .editor-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .header-actions button {
    flex: 1;
    min-width: 100px;
  }

  .about-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
