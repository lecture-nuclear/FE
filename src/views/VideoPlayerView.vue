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
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import axiosInstance from '@/utils/axiosInstance'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const errorMessage = ref('')
const player = ref(null)

// 시간 추적 변수들
const sessionStartTime = ref(null)
const totalWatchTime = ref(0)
const lastUpdateTime = ref(null)
const currentPosition = ref(0)
const isPlaying = ref(false)
const watchTimeInterval = ref(null)
const backupInterval = ref(null)
const isSendingData = ref(false)

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

// 시간 추적 함수들
const startWatchTimeTracking = () => {
  sessionStartTime.value = Date.now()
  lastUpdateTime.value = Date.now()
  console.log('📊 시청 시간 추적 시작')
}

const updateWatchTime = () => {
  if (isPlaying.value && lastUpdateTime.value) {
    const now = Date.now()
    const timeDiff = now - lastUpdateTime.value
    totalWatchTime.value += timeDiff
    lastUpdateTime.value = now
  }
}

const startWatchTimeInterval = () => {
  if (watchTimeInterval.value) {
    clearInterval(watchTimeInterval.value)
  }
  watchTimeInterval.value = setInterval(() => {
    updateWatchTime()
    if (player.value && typeof player.value.currentTime === 'number') {
      currentPosition.value = Math.floor(player.value.currentTime * 1000)
    }
  }, 1000)
}

const startBackupInterval = () => {
  if (backupInterval.value) {
    clearInterval(backupInterval.value)
  }
  backupInterval.value = setInterval(() => {
    console.log('📊 주기적 백업 전송')
    sendWatchTimeData()
  }, 30000) // 30초마다
}

const stopBackupInterval = () => {
  if (backupInterval.value) {
    clearInterval(backupInterval.value)
    backupInterval.value = null
  }
}


const stopWatchTimeInterval = () => {
  if (watchTimeInterval.value) {
    clearInterval(watchTimeInterval.value)
    watchTimeInterval.value = null
  }
  updateWatchTime()
}

const sendWatchTimeData = async () => {
  if (isSendingData.value) {
    console.log('📊 이미 전송 중 - 스킵')
    return
  }

  if (!userStore.getMemberId || !route.params.videoId) {
    console.warn('⚠️ 사용자 ID 또는 비디오 ID가 없습니다.')
    return
  }

  isSendingData.value = true

  try {
    updateWatchTime()
    
    if (totalWatchTime.value > 0) {
      const requestData = {
        watchTimeMillis: totalWatchTime.value,
        lastTimeMillis: currentPosition.value,
        memberId: userStore.getMemberId,
        videoId: parseInt(route.params.videoId)
      }
      
      console.log('📊 시청 시간 전송:', requestData)
      
      await axiosInstance.put('/v1/last-view', requestData)
      console.log('✅ 시청 시간 전송 완료')
      
      // 전송 후 리셋
      totalWatchTime.value = 0
      sessionStartTime.value = Date.now()
      lastUpdateTime.value = Date.now()
    }
  } catch (error) {
    console.error('❌ 시청 시간 전송 실패:', error)
  } finally {
    isSendingData.value = false
  }
}

const initializePlayer = async () => {
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
        startWatchTimeTracking()
        startBackupInterval()
      })

      player.value.on('play', () => {
        console.log('영상 재생 시작')
        isPlaying.value = true
        lastUpdateTime.value = Date.now()
        startWatchTimeInterval()
      })

      player.value.on('pause', () => {
        console.log('영상 일시정지')
        isPlaying.value = false
        stopWatchTimeInterval()
      })

      player.value.on('seeking', () => {
        updateWatchTime()
        if (player.value && typeof player.value.currentTime === 'number') {
          currentPosition.value = Math.floor(player.value.currentTime * 1000)
        }
      })
    }, 100)

  } catch (error) {
    console.error('플레이어 초기화 실패:', error)
    errorMessage.value = '영상 플레이어를 초기화하는데 실패했습니다.'
    loading.value = false
  }
}

// 이벤트 리스너 등록
const handleVisibilityChange = () => {
  if (document.hidden) {
    console.log('📊 페이지가 숨겨짐 - 시청 시간 전송')
    sendWatchTimeData()
  } else {
    console.log('📊 페이지가 다시 보임 - 시청 시간 추적 재시작')
    lastUpdateTime.value = Date.now()
  }
}

const handleBeforeUnload = () => {
  console.log('📊 페이지 떠남 - 시청 시간 전송')
  sendWatchTimeData()
}

onMounted(() => {
  initializePlayer()
  
  // 이벤트 리스너 등록
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  stopWatchTimeInterval()
  stopBackupInterval()
  sendWatchTimeData()
  
  if (player.value) {
    player.value.destroy()
  }
  
  // 이벤트 리스너 제거
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  sendWatchTimeData()
})

onBeforeRouteLeave(async (to, from, next) => {
  await sendWatchTimeData()
  next()
})

onBeforeRouteUpdate(async (to, from, next) => {
  // 다른 비디오로 이동할 때 현재 비디오의 시간 전송
  if (to.params.videoId !== from.params.videoId) {
    await sendWatchTimeData()
  }
  next()
})

// videoId 변경 감지
watch(
  () => route.params.videoId,
  async (newVideoId, oldVideoId) => {
    if (oldVideoId && newVideoId !== oldVideoId) {
      console.log('📊 비디오 변경 감지 - 이전 비디오 시간 전송')
      await sendWatchTimeData()
      // 새 비디오 시간 추적 시작
      startWatchTimeTracking()
    }
  }
)
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