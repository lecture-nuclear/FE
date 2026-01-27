<template>
  <div class="about-editor">
    <div class="editor-header">
      <h2>📄 서비스 소개 편집</h2>
      <div class="header-actions">
        <button @click="loadAbout" class="btn-refresh" :disabled="loading">
          🔄 새로고침
        </button>
        <button @click="saveAbout" class="btn-save" :disabled="saving || !hasChanges">
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <div v-if="hasChanges" class="unsaved-warning">
      ⚠️ 저장되지 않은 변경사항이 있습니다
    </div>

    <div class="editor-container">
      <div class="editor-section">
        <label for="content-editor">내용 (HTML 지원)</label>
        <textarea
          id="content-editor"
          v-model="localContent"
          rows="20"
          placeholder="서비스 소개 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
          @input="markChanged"
        ></textarea>
        <div class="editor-help">
          <small>
            💡 HTML 태그 사용 가능: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt; 등
          </small>
        </div>
      </div>

      <div class="preview-section">
        <h3>미리보기</h3>
        <div class="preview-content" v-html="localContent"></div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      ❌ {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success-message">
      ✅ {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axiosInstance from '@/utils/axiosInstance'

const localContent = ref('')
const originalContent = ref('')
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const hasChanges = computed(() => localContent.value !== originalContent.value)

const loadAbout = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axiosInstance.get('/v1/about')
    
    if (response.data && response.data.data && response.data.data.content) {
      localContent.value = response.data.data.content
      originalContent.value = response.data.data.content
    } else {
      errorMessage.value = '서비스 소개 내용을 불러올 수 없습니다.'
    }
  } catch (error) {
    console.error('About 내용 로드 실패:', error)
    errorMessage.value = '서비스 소개를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const saveAbout = async () => {
  if (!hasChanges.value) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await axiosInstance.post('/v1/about', {
      content: localContent.value
    })

    originalContent.value = localContent.value
    successMessage.value = '서비스 소개가 성공적으로 저장되었습니다!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('About 내용 저장 실패:', error)
    errorMessage.value = '서비스 소개 저장에 실패했습니다.'
  } finally {
    saving.value = false
  }
}

const markChanged = () => {
  successMessage.value = ''
}

const handleBeforeUnload = (event) => {
  if (hasChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  loadAbout()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.about-editor {
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

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

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-refresh,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-refresh {
  background-color: #6c757d;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #218838;
}

.btn-refresh:disabled,
.btn-save:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.unsaved-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
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
    flex-direction: column;
  }

  .btn-refresh,
  .btn-save {
    width: 100%;
  }
}
</style>
