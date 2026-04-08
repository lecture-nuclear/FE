<!-- src/components/admin/home/SectionTypeModal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>섹션 타입 선택</h3>
          <button @click="$emit('close')" class="close-btn">×</button>
        </div>

        <div class="section-types">
        <div
          v-for="type in sectionTypes"
          :key="type.key"
          class="type-card"
          @click="selectType(type.key)"
        >
            <div class="type-icon">
              <component :is="type.icon" :size="34" weight="duotone" />
            </div>
            <h4>{{ type.name }}</h4>
            <p>{{ type.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {
  PhBookOpenText,
  PhCursorClick,
  PhImageSquare,
  PhSlideshow,
  PhTextT,
} from '@phosphor-icons/vue'

const emit = defineEmits(['select', 'close'])

const sectionTypes = [
  {
    key: 'image',
    name: '배너 이미지',
    icon: PhImageSquare,
    description: '배경 이미지와 텍스트가 있는 배너 섹션',
  },
  {
    key: 'carousel',
    name: '이미지 캐러셀',
    icon: PhSlideshow,
    description: '자동으로 넘어가는 이미지 슬라이드',
  },
  {
    key: 'markdown',
    name: '마크다운 텍스트',
    icon: PhTextT,
    description: '마크다운으로 작성된 텍스트 콘텐츠',
  },
  {
    key: 'lectures',
    name: '추천 강의',
    icon: PhBookOpenText,
    description: '선택된 강의들을 카드 형태로 표시',
  },
  {
    key: 'button',
    name: '액션 버튼',
    icon: PhCursorClick,
    description: '특정 페이지로 이동하는 버튼',
  },
]

const selectType = (type) => {
  emit('select', type)
}
</script>

<style>
/* Teleport 사용 시 scoped 제거 필요 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.section-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  padding: 30px;
}

.type-card {
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.type-card:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  margin-bottom: 15px;
}

.type-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.type-card p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .section-types {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 12px;
  }

  .type-card {
    padding: 15px;
  }

  .type-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }
}
</style>
