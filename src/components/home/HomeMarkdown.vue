<!-- src/components/home/HomeMarkdown.vue -->
<template>
  <div class="home-markdown">
    <div class="markdown-content" v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  text: { 
    type: String, 
    required: true 
  },
  sectionIndex: {
    type: Number,
    default: 0
  }
})

// 마크다운 렌더링 설정
const renderer = new marked.Renderer()

// 링크에 target="_blank" 추가
renderer.link = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  renderer: renderer,
  breaks: true, // 줄바꿈을 <br>로 변환
  gfm: true, // GitHub Flavored Markdown 지원
})

// 마크다운을 HTML로 변환하고 XSS 방지
const renderedMarkdown = computed(() => {
  if (!props.text) return ''
  
  try {
    const rawHtml = marked(props.text)
    // DOMPurify로 XSS 공격 방지
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'span', 'div',
        'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'class', 'id'
      ]
    })
  } catch (error) {
    console.error('마크다운 렌더링 오류:', error)
    return '<p>마크다운을 렌더링할 수 없습니다.</p>'
  }
})
</script>

<style scoped>
.home-markdown {
  width: 100%;
  margin-bottom: 0;
  padding: 0 20px;
}

.markdown-content {
  max-width: 1000px;
  margin: 0 auto;
  line-height: 1.7;
  color: #333;
}

/* 마크다운 스타일링 */
.markdown-content :deep(h1) {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 30px 0 20px 0;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
}

.markdown-content :deep(h2) {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 25px 0 15px 0;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 8px;
}

.markdown-content :deep(h3) {
  font-size: 1.6rem;
  font-weight: 600;
  color: #34495e;
  margin: 20px 0 12px 0;
}

.markdown-content :deep(h4) {
  font-size: 1.3rem;
  font-weight: 600;
  color: #34495e;
  margin: 18px 0 10px 0;
}

.markdown-content :deep(h5), 
.markdown-content :deep(h6) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34495e;
  margin: 15px 0 8px 0;
}

.markdown-content :deep(p) {
  font-size: 1rem;
  margin: 15px 0;
  color: #555;
}

.markdown-content :deep(a) {
  color: #3498db;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.markdown-content :deep(a:hover) {
  color: #2980b9;
  border-bottom-color: #2980b9;
}

.markdown-content :deep(strong), 
.markdown-content :deep(b) {
  font-weight: 700;
  color: #2c3e50;
}

.markdown-content :deep(em), 
.markdown-content :deep(i) {
  font-style: italic;
  color: #555;
}

.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  margin: 15px 0;
  padding-left: 30px;
}

.markdown-content :deep(li) {
  margin: 8px 0;
  color: #555;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  background-color: #f8f9fa;
  padding: 15px 20px;
  margin: 20px 0;
  font-style: italic;
  color: #666;
}

.markdown-content :deep(code) {
  background-color: #f1f2f6;
  color: #e74c3c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 15px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(th), 
.markdown-content :deep(td) {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.markdown-content :deep(th) {
  background-color: #34495e;
  color: white;
  font-weight: 600;
}

.markdown-content :deep(tr:last-child td) {
  border-bottom: none;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .home-markdown {
    padding: 0 15px;
    margin-bottom: 0;
  }
  
  .markdown-content :deep(h1) {
    font-size: 2rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.6rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.4rem;
  }
  
  .markdown-content :deep(ul), 
  .markdown-content :deep(ol) {
    padding-left: 20px;
  }
  
  .markdown-content :deep(blockquote) {
    padding: 12px 15px;
  }
  
  .markdown-content :deep(pre) {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .home-markdown {
    padding: 0 10px;
    margin-bottom: 0;
  }
  
  .markdown-content :deep(h1) {
    font-size: 1.8rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.4rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.9rem;
  }
  
  .markdown-content :deep(th), 
  .markdown-content :deep(td) {
    padding: 8px 10px;
  }
}</style>