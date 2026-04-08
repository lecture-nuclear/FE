<template>
  <div class="p-0 min-h-[600px]">
    <!-- 리스트 뷰 -->
    <div v-if="viewMode === 'list'" class="flex flex-col">
      <div class="mb-7 pb-5 border-b-2 border-[#e1e8ed] text-center">
        <h2 class="m-0 inline-flex items-center gap-3 text-3xl text-gray-800">
          <PhUsersThree :size="30" weight="duotone" />
          <span>사용자 관리</span>
        </h2>
      </div>

      <!-- 검색 및 정렬 영역 -->
      <div class="mb-7">
        <div class="flex gap-2.5 max-w-[600px] mx-auto mb-5">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="사용자명 또는 이메일로 검색..."
            class="flex-1 py-3 px-4 border-2 border-[#e1e8ed] rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:border-blue-500"
            @keyup.enter="handleSearch"
          />
          <button
            @click="handleSearch"
            class="inline-flex items-center gap-2 py-3 px-5 border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600"
          >
            <PhMagnifyingGlass :size="16" weight="bold" />
            <span>검색</span>
          </button>
          <button
            @click="clearSearch"
            class="py-3 px-5 border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-gray-400 text-white hover:bg-gray-500"
          >
            초기화
          </button>
        </div>

        <!-- 정렬 옵션 -->
        <div class="flex justify-center">
          <div
            class="flex items-center gap-3 bg-white py-4 px-5 rounded-xl shadow-sm border border-[#e1e8ed]"
          >
            <label for="sortBy" class="text-sm font-semibold text-gray-800 whitespace-nowrap"
              >정렬 기준:</label
            >
            <select
              id="sortBy"
              v-model="sortBy"
              @change="handleSortChange"
              class="py-2 px-3 border border-[#e1e8ed] rounded-md text-sm bg-gray-50 cursor-pointer transition-colors duration-200 focus:outline-none focus:border-blue-500"
            >
              <option value="createdAt">가입일</option>
              <option value="name">이름</option>
              <option value="email">이메일</option>
              <option value="id">ID</option>
            </select>

            <label for="sortDirection" class="text-sm font-semibold text-gray-800 whitespace-nowrap"
              >정렬 방향:</label
            >
            <select
              id="sortDirection"
              v-model="sortDirection"
              @change="handleSortChange"
              class="py-2 px-3 border border-[#e1e8ed] rounded-md text-sm bg-gray-50 cursor-pointer transition-colors duration-200 focus:outline-none focus:border-blue-500"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>

            <button
              @click="refreshUsers"
              class="inline-flex items-center gap-2 py-2 px-4 bg-green-600 text-white border-0 rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-green-700"
            >
              <PhArrowsClockwise :size="16" weight="bold" />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="text-center py-15">
        <div
          class="w-10 h-10 border-4 border-[#e1e8ed] border-t-blue-500 rounded-full animate-spin mx-auto mb-5"
        ></div>
        <p>사용자 목록을 불러오는 중...</p>
      </div>

      <!-- 오류 상태 -->
      <div v-else-if="error" class="text-center py-15 text-red-600">
        <p class="inline-flex items-center gap-2">
          <PhXCircle :size="18" weight="fill" />
          <span>{{ error }}</span>
        </p>
        <button
          @click="fetchUsers"
          class="py-2.5 px-5 bg-red-600 text-white border-0 rounded-md cursor-pointer mt-2.5 hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>

      <!-- 사용자 목록 테이블 -->
      <div
        v-else-if="filteredUsers.length > 0"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div class="p-5 bg-gray-50 border-b border-[#e1e8ed]">
          <span class="font-semibold text-gray-800">총 {{ filteredUsers.length }}명의 사용자</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  ID
                </th>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  사용자명
                </th>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  이메일
                </th>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  가입일
                </th>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  마지막 수정
                </th>
                <th class="bg-[#34495e] text-white py-4 px-3 text-left font-semibold text-sm">
                  상세
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm font-semibold text-gray-500">
                  {{ user.id }}
                </td>
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm">
                  <div class="flex flex-col gap-1">
                    <span class="font-semibold text-gray-800">{{ user.name }}</span>
                    <span class="text-xs text-gray-500 bg-gray-100 py-0.5 px-1.5 rounded w-fit"
                      >@{{ user.userId }}</span
                    >
                  </div>
                </td>
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm text-blue-500">
                  {{ user.email }}
                </td>
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm text-gray-500 text-[13px]">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm text-gray-500 text-[13px]">
                  {{ formatDate(user.updatedAt) }}
                </td>
                <td class="py-4 px-3 border-b border-[#e1e8ed] text-sm">
                  <button
                    @click="viewUserDetail(user)"
                    class="inline-flex items-center gap-1.5 py-1.5 px-3 bg-blue-500 text-white border-0 rounded-md cursor-pointer text-xs transition-colors duration-200 hover:bg-blue-600"
                  >
                    <PhClipboardText :size="14" weight="duotone" />
                    <span>상세보기</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 사용자 없음 상태 -->
      <div v-else class="text-center py-20 text-gray-500">
        <div class="mb-5 flex justify-center text-blue-500">
          <PhUsersThree :size="52" weight="duotone" />
        </div>
        <h3 class="text-2xl mb-2.5 text-gray-800">사용자가 없습니다</h3>
        <p v-if="searchKeyword" class="text-base">검색 조건에 맞는 사용자를 찾을 수 없습니다.</p>
        <p v-else class="text-base">등록된 사용자가 없습니다.</p>
      </div>
    </div>

    <!-- 상세 뷰 -->
    <div v-if="viewMode === 'detail'" class="flex flex-col gap-5">
      <div class="mb-7 pb-5 border-b-2 border-[#e1e8ed] flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button
            @click="closeDetail"
            class="inline-flex items-center gap-2 py-2.5 px-5 border-0 rounded-md cursor-pointer text-sm font-semibold transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600"
          >
            <PhCaretLeft :size="14" weight="bold" />
            <span>뒤로가기</span>
          </button>
          <h2 class="m-0 inline-flex items-center gap-3 text-2xl text-gray-800">
            <PhUserCircle :size="26" weight="duotone" />
            <span>사용자 상세 정보</span>
          </h2>
        </div>
      </div>

      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="mb-5">
          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">사용자 ID</span>
            <span class="text-base text-gray-800 font-medium text-right flex-1">{{
              selectedUser.id
            }}</span>
          </div>

          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">사용자명</span>
            <span class="text-gray-500 bg-gray-200 py-1 px-2 rounded-md text-sm w-fit ml-auto"
              >@{{ selectedUser.userId }}</span
            >
          </div>

          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">이름</span>
            <span class="text-base text-gray-800 font-semibold text-right flex-1">{{
              selectedUser.name
            }}</span>
          </div>

          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">이메일</span>
            <span class="text-base text-blue-500 font-medium text-right flex-1">{{
              selectedUser.email
            }}</span>
          </div>
        </div>

        <div class="mb-5 pt-5 border-t border-[#e1e8ed]">
          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">가입일</span>
            <span class="text-base text-gray-800 font-medium text-right flex-1">{{
              formatDateTime(selectedUser.createdAt)
            }}</span>
          </div>

          <div
            class="flex justify-between items-center py-4 border-b border-gray-300 last:border-b-0"
          >
            <span class="font-semibold text-gray-600 text-sm min-w-[120px]">마지막 수정</span>
            <span class="text-base text-gray-800 font-medium text-right flex-1">{{
              formatDateTime(selectedUser.updatedAt)
            }}</span>
          </div>
        </div>

        <div class="pt-5 border-t border-[#e1e8ed]">
          <div class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
            <PhChartBar :size="18" weight="duotone" />
            <span>계정 정보</span>
          </div>
          <div class="grid grid-cols-1 gap-4 max-w-[300px]">
            <div class="bg-gray-50 border border-[#e1e8ed] p-5 rounded-lg text-center">
              <div class="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                가입 경과
              </div>
              <div class="text-2xl font-bold text-gray-800">
                {{ getJoinedDaysAgo(selectedUser.createdAt) }}일
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2.5">
        <button
          @click="closeDetail"
          class="py-2.5 px-5 border-0 rounded-md cursor-pointer text-sm font-semibold transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  PhArrowsClockwise,
  PhCaretLeft,
  PhChartBar,
  PhClipboardText,
  PhMagnifyingGlass,
  PhUserCircle,
  PhUsersThree,
  PhXCircle,
} from '@phosphor-icons/vue'
import { getAllUsers } from '@/services/adminService'

// 뷰 모드
const viewMode = ref('list')

// 반응형 데이터
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchKeyword = ref('')
const selectedUser = ref(null)
const sortBy = ref('createdAt')
const sortDirection = ref('desc')

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value

  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.userId.toLowerCase().includes(keyword),
  )
})

// 사용자 목록 가져오기
const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await getAllUsers(sortBy.value, sortDirection.value)
    users.value = response.data
  } catch (err) {
    console.error('사용자 목록 조회 실패:', err)
    error.value = err.response?.data?.message || '사용자 목록을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 검색 처리
const handleSearch = () => {
  console.log('검색 키워드:', searchKeyword.value)
}

// 검색 초기화
const clearSearch = () => {
  searchKeyword.value = ''
}

// 날짜 포맷팅 (짧은 형식)
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 날짜 포맷팅 (상세 형식)
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 가입 경과일 계산
const getJoinedDaysAgo = (createdAt) => {
  const now = new Date()
  const joinDate = new Date(createdAt)
  const diffTime = Math.abs(now - joinDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 사용자 상세보기
const viewUserDetail = (user) => {
  selectedUser.value = user
  viewMode.value = 'detail'
}

// 상세 뷰 닫기
const closeDetail = () => {
  viewMode.value = 'list'
  selectedUser.value = null
}

// 정렬 변경 처리
const handleSortChange = () => {
  console.log(`정렬 변경: ${sortBy.value} ${sortDirection.value}`)
  fetchUsers()
}

// 새로고침
const refreshUsers = () => {
  fetchUsers()
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchUsers()
})
</script>
