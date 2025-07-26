// src/utils/homeRenderer.js
import { defineAsyncComponent } from 'vue'

/**
 * JSON 데이터를 Vue 컴포넌트 배열로 변환
 * @param {Object} homeData - 서버에서 받은 홈페이지 데이터
 * @returns {Array} 렌더링할 컴포넌트 배열
 */
export const renderHomeContent = (homeData) => {
  if (!homeData || !homeData.home || !Array.isArray(homeData.home)) {
    console.warn('Invalid home data format:', homeData)
    return []
  }
  
  return homeData.home.map((item, index) => {
    const componentInfo = getComponentByType(item.type)
    
    if (!componentInfo) {
      console.warn(`Unknown component type: ${item.type}`)
      return null
    }
    
    return {
      component: componentInfo.component,
      props: { 
        ...item, 
        sectionIndex: index,
        key: `${item.type}-${index}`
      },
      key: `${item.type}-${index}`
    }
  }).filter(Boolean) // null 값 제거
}

/**
 * 타입별 컴포넌트 매핑
 * @param {string} type - 섹션 타입
 * @returns {Object|null} 컴포넌트 정보
 */
const getComponentByType = (type) => {
  const componentMap = {
    'image': {
      component: defineAsyncComponent(() => import('@/components/home/HomeBannerImage.vue')),
      name: 'HomeBannerImage'
    },
    'carousel': {
      component: defineAsyncComponent(() => import('@/components/home/HomeCarousel.vue')),
      name: 'HomeCarousel'
    },
    'markdown': {
      component: defineAsyncComponent(() => import('@/components/home/HomeMarkdown.vue')),
      name: 'HomeMarkdown'
    },
    'lectures': {
      component: defineAsyncComponent(() => import('@/components/home/HomeLectures.vue')),
      name: 'HomeLectures'
    },
    'button': {
      component: defineAsyncComponent(() => import('@/components/home/HomeButton.vue')),
      name: 'HomeButton'
    }
  }
  
  return componentMap[type] || null
}

/**
 * 홈페이지 데이터 검증
 * @param {Object} data - 검증할 데이터
 * @returns {Object} 검증 결과 { isValid: boolean, errors: string[] }
 */
export const validateHomeData = (data) => {
  const errors = []
  
  if (!data || typeof data !== 'object') {
    errors.push('데이터가 유효하지 않습니다')
    return { isValid: false, errors }
  }
  
  if (!data.home || !Array.isArray(data.home)) {
    errors.push('home 배열이 필요합니다')
    return { isValid: false, errors }
  }
  
  data.home.forEach((item, index) => {
    if (!item.type) {
      errors.push(`섹션 ${index + 1}: type이 필요합니다`)
    } else {
      const validationResult = validateSectionByType(item, index + 1)
      errors.push(...validationResult)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 타입별 섹션 데이터 검증
 * @param {Object} section - 검증할 섹션
 * @param {number} sectionNum - 섹션 번호 (에러 메시지용)
 * @returns {string[]} 에러 메시지 배열
 */
const validateSectionByType = (section, sectionNum) => {
  const errors = []
  
  switch (section.type) {
    case 'image':
      if (!section.img) {
        errors.push(`섹션 ${sectionNum}: 이미지 URL이 필요합니다`)
      }
      break
      
    case 'carousel':
      if (!section.imgs || !Array.isArray(section.imgs) || section.imgs.length === 0) {
        errors.push(`섹션 ${sectionNum}: 이미지 배열이 필요합니다`)
      } else {
        section.imgs.forEach((img, imgIndex) => {
          if (!img.img) {
            errors.push(`섹션 ${sectionNum}, 이미지 ${imgIndex + 1}: 이미지 URL이 필요합니다`)
          }
        })
      }
      break
      
    case 'markdown':
      if (!section.text) {
        errors.push(`섹션 ${sectionNum}: 마크다운 텍스트가 필요합니다`)
      }
      break
      
    case 'lectures':
      if (!section.lectures || !Array.isArray(section.lectures) || section.lectures.length === 0) {
        errors.push(`섹션 ${sectionNum}: 강의 ID 배열이 필요합니다`)
      }
      break
      
    case 'button':
      if (!section.text) {
        errors.push(`섹션 ${sectionNum}: 버튼 텍스트가 필요합니다`)
      }
      break
      
    default:
      errors.push(`섹션 ${sectionNum}: 알 수 없는 타입 '${section.type}'`)
  }
  
  return errors
}

/**
 * 기본 홈페이지 데이터 생성
 * @returns {Object} 기본 홈페이지 데이터
 */
export const getDefaultHomeData = () => {
  return {
    home: [
      {
        type: 'image',
        img: '/home/images/default-banner.jpg',
        link: '/courses',
        text: '환영합니다! 새로운 강의를 시작해보세요'
      },
      {
        type: 'markdown',
        text: '## 🎓 온라인 강의 플랫폼\n\n여러분의 학습 여정을 함께 하겠습니다.'
      }
    ]
  }
}

/**
 * 홈페이지 데이터의 JSON 크기 계산
 * @param {Object} data - 계산할 데이터
 * @returns {Object} 크기 정보 { bytes, kb, mb }
 */
export const calculateDataSize = (data) => {
  const jsonString = JSON.stringify(data)
  const bytes = new Blob([jsonString]).size
  
  return {
    bytes,
    kb: (bytes / 1024).toFixed(2),
    mb: (bytes / (1024 * 1024)).toFixed(2)
  }
}