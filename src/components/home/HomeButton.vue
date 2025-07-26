<!-- src/components/home/HomeButton.vue -->
<template>
  <div class="home-button">
    <button 
      class="action-button"
      :class="buttonClass"
      @click="handleClick"
    >
      {{ text }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { 
    type: String, 
    required: true 
  },
  link: { 
    type: String, 
    default: '' 
  },
  style: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  sectionIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['navigate'])

const buttonClass = computed(() => {
  return [
    `button-${props.style}`,
    `button-${props.size}`
  ]
})

const handleClick = () => {
  // 페이지 맨 위로 스크롤
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  
  if (props.link) {
    emit('navigate', props.link)
  }
}
</script>

<style scoped>
.home-button {
  width: 100%;
  text-align: center;
  margin: 40px 0;
  padding: 0 20px;
}

.action-button {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 스타일 변형 */
.button-primary {
  background-color: #3498db;
  color: white;
}

.button-primary:hover {
  background-color: #2980b9;
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.button-secondary {
  background-color: #95a5a6;
  color: white;
}

.button-secondary:hover {
  background-color: #7f8c8d;
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.3);
}

.button-success {
  background-color: #27ae60;
  color: white;
}

.button-success:hover {
  background-color: #219a52;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

.button-warning {
  background-color: #f39c12;
  color: white;
}

.button-warning:hover {
  background-color: #d68910;
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.3);
}

.button-danger {
  background-color: #e74c3c;
  color: white;
}

.button-danger:hover {
  background-color: #c0392b;
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

/* 크기 변형 */
.button-small {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.button-medium {
  padding: 12px 24px;
  font-size: 1rem;
}

.button-large {
  padding: 16px 32px;
  font-size: 1.2rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .home-button {
    margin: 30px 0;
    padding: 0 15px;
  }
  
  .button-large {
    padding: 14px 28px;
    font-size: 1.1rem;
  }
  
  .button-medium {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
  
  .button-small {
    padding: 6px 14px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .home-button {
    margin: 20px 0;
    padding: 0 10px;
  }
  
  .action-button {
    width: 100%;
    max-width: 300px;
  }
  
  .button-large {
    padding: 12px 24px;
    font-size: 1rem;
  }
  
  .button-medium {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .button-small {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
}</style>