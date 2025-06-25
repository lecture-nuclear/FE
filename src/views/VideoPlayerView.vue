<template>
  <div class="video-player-container">
    <div v-if="loading" class="loading-message">영상을 불러오는 중입니다...</div>
    
    <div v-else-if="errorMessage" class="error-message">
      오류: {{ errorMessage }}
      <router-link :to="`/lectures/${lectureId}`" class="back-to-lecture">강의로 돌아가기</router-link>
    </div>

    <div v-else class="player-wrapper">
      <div class="video-header">
        <router-link :to="`/lectures/${lectureId}`" class="back-button">
          ← 강의로 돌아가기
        </router-link>
        <h1 class="video-title">{{ videoTitle }}</h1>
      </div>

      <div class="video-container">
        <!-- YouTube 영상인 경우 -->
        <div v-if="isYouTubeVideo" class="plyr__video-embed" id="player">
          <iframe
            :src="`https://www.youtube.com/embed/${youtubeId}?origin=https://plyr.io&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`"
            allowfullscreen
            allowtransparency
            allow="autoplay"
          ></iframe>
        </div>

        <!-- 일반 비디오 파일인 경우 -->
        <video v-else id="player" playsinline controls :data-poster="posterImage">
          <source :src="videoUrl" :type="videoType" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div class="video-info">
        <h2>{{ lectureTitle }}</h2>
        <div class="video-description" v-if="videoDescription">
          {{ videoDescription }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const player = ref(null)

const lectureId = ref(route.params.lectureId)
const videoIndex = ref(parseInt(route.params.videoIndex))
const videoUrl = ref(route.query.url)
const videoTitle = ref(route.query.title || '영상')
const lectureTitle = ref(route.query.lectureTitle || '강의')
const videoDescription = ref('')
const posterImage = ref('')

const isYouTubeVideo = ref(false)
const youtubeId = ref('')
const videoType = ref('video/mp4')

const initializePlayer = () => {
  try {
    if (!videoUrl.value) {
      errorMessage.value = '영상 URL이 없습니다.'
      loading.value = false
      return
    }

    // YouTube 링크 체크
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = videoUrl.value.match(youtubeRegex)
    
    if (youtubeMatch) {
      isYouTubeVideo.value = true
      youtubeId.value = youtubeMatch[1]
    } else {
      isYouTubeVideo.value = false
      // 파일 확장자로 비디오 타입 결정
      if (videoUrl.value.includes('.webm')) {
        videoType.value = 'video/webm'
      } else if (videoUrl.value.includes('.ogg')) {
        videoType.value = 'video/ogg'
      } else {
        videoType.value = 'video/mp4'
      }
    }

    loading.value = false

    // DOM이 업데이트된 후 플레이어 초기화
    setTimeout(() => {
      player.value = new Plyr('#player', {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'fullscreen'
        ],
        settings: ['quality', 'speed'],
        quality: {
          default: 720,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        }
      })

      // 플레이어 이벤트 리스너
      player.value.on('ready', () => {
        console.log('플레이어가 준비되었습니다.')
      })

      player.value.on('play', () => {
        console.log('영상 재생 시작')
      })

      player.value.on('pause', () => {
        console.log('영상 일시정지')
      })
    }, 100)

  } catch (error) {
    console.error('플레이어 초기화 실패:', error)
    errorMessage.value = '영상 플레이어를 초기화하는데 실패했습니다.'
    loading.value = false
  }
}

onMounted(() => {
  initializePlayer()
})

onUnmounted(() => {
  if (player.value) {
    player.value.destroy()
  }
})
</script>

<style scoped>
.video-player-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  padding: 20px;
}

.loading-message,
.error-message {
  text-align: center;
  font-size: 18px;
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.error-message {
  color: #e74c3c;
}

.back-to-lecture {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.back-to-lecture:hover {
  background-color: #0056b3;
}

.player-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.video-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.back-button {
  color: #007bff;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: rgba(0, 123, 255, 0.2);
}

.video-title {
  font-size: 24px;
  margin: 0;
  flex-grow: 1;
}

.video-container {
  position: relative;
  width: 100%;
  margin-bottom: 30px;
}

.video-info {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.video-info h2 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.video-description {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
}

/* Plyr 커스터마이징 */
:deep(.plyr) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.plyr__video-embed iframe) {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .video-player-container {
    padding: 10px;
  }
  
  .video-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .video-title {
    font-size: 20px;
  }
  
  .video-info {
    padding: 15px;
  }
}
</style>