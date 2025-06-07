<template>
  <div class="flex min-h-screen font-sans">
    <main class="flex-1 bg-gray-50 p-10">
      <h2 class="text-xl font-semibold text-purple-800 mb-6 underline">전체 직원 명부</h2>

      <!-- Filters -->
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
        <input
          v-model="filters.name"
          placeholder="이름 검색"
          class="border rounded-md px-3 py-2 text-sm w-52"
        />
        <input
          v-model="filters.department"
          placeholder="부서 검색"
          class="border rounded-md px-3 py-2 text-sm w-52"
        />
        <input
          v-model="filters.position"
          placeholder="직책 검색"
          class="border rounded-md px-3 py-2 text-sm w-52"
        />
      </div>

      <!-- Employee Table -->
      <table class="w-full text-sm text-left border">
        <thead class="bg-purple-200 cursor-pointer">
          <tr>
            <th class="p-2 border" @click="sortBy('employeeId')">직원 ID</th>
            <th class="p-2 border" @click="sortBy('employeeName')">이름</th>
            <th class="p-2 border" @click="sortBy('employeeDepartment')">부서</th>
            <th class="p-2 border" @click="sortBy('employeePosition')">직책</th>
            <th class="p-2 border" @click="sortBy('employeeEmail')">이메일</th>
            <th class="p-2 border" @click="sortBy('employeePhoneNumber')">전화번호</th>
            <th class="p-2 border" @click="sortBy('employeeDateOfJoin')">입사일</th>
            <th class="p-2 border">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="employee in employees"
            :key="employee.employeeId"
            class="hover:bg-gray-100"
          >
            <!-- 직원 ID (읽기 전용) -->
            <td class="p-2 border">{{ employee.employeeId }}</td>

            <!-- 이름 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeeName"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeeName }}
              </template>
            </td>

            <!-- 부서 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeeDepartment"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeeDepartment }}
              </template>
            </td>

            <!-- 직책 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeePosition"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeePosition }}
              </template>
            </td>

            <!-- 이메일 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeeEmail"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeeEmail }}
              </template>
            </td>

            <!-- 전화번호 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeePhoneNumber"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeePhoneNumber }}
              </template>
            </td>

            <!-- 입사일 -->
            <td class="p-2 border">
              <template v-if="editingId === employee.employeeId">
                <input
                  v-model="editedEmployee.employeeDateOfJoin"
                  type="date"
                  class="border px-1 py-1 w-full"
                />
              </template>
              <template v-else>
                {{ employee.employeeDateOfJoin }}
              </template>
            </td>

            <!-- 관리 버튼 -->
            <td class="p-2 border space-x-1">
              <template v-if="editingId === employee.employeeId">
                <!-- 저장 -->
                <button
                  @click="saveEdit"
                  class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  저장
                </button>
                <!-- 취소 -->
                <button
                  @click="cancelEdit"
                  class="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                >
                  취소
                </button>
                <!-- 삭제 -->
                <button
                  @click="confirmDelete(employee.employeeId)"
                  class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </template>
              <template v-else>
                <!-- 편집 시작 -->
                <button
                  @click="startEdit(employee)"
                  class="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                >
                  편집
                </button>
              </template>
            </td>
          </tr>

          <!-- 데이터 없을 때 -->
          <tr v-if="employees.length === 0">
            <td class="p-2 border text-center" colspan="8">직원 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="mt-4 flex justify-center space-x-2 items-center">
        <button
          @click="prevPage"
          :disabled="currentPage <= 1"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const filters = ref({ name: '', department: '', position: '' })


const sortField = ref('employeeId')
const sortAsc = ref(true)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = ref(1)


const employees = ref([])


const editingId = ref(null)
const editedEmployee = ref({})


async function fetchEmployees() {
  try {
    const { data } = await axios.get('http://localhost:8001/api/employees', {
      params: {
        name: filters.value.name,
        department: filters.value.department,
        position: filters.value.position,
        sortField: sortField.value,
        sortDir: sortAsc.value ? 'asc' : 'desc',
        page: currentPage.value,
        size: itemsPerPage.value
      }
    })
    employees.value = data.employees
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('직원 목록 로드 실패:', err)
  }
}


onMounted(fetchEmployees)
watch([filters, sortField, sortAsc, currentPage], fetchEmployees, { deep: true })


function sortBy(field) {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = field
    sortAsc.value = true
  }
  currentPage.value = 1
}


function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function startEdit(emp) {
  editingId.value = emp.employeeId
  editedEmployee.value = { ...emp }
}


function cancelEdit() {
  editingId.value = null
  editedEmployee.value = {}
}


async function saveEdit() {
  try {
    await axios.put(`http://localhost:8001/api/employees/${editedEmployee.value.employeeId}`, editedEmployee.value)
    cancelEdit()
    fetchEmployees()
  } catch (err) {
    console.error('저장 실패:', err)
  }
}


function confirmDelete(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    axios
      .delete(`http://localhost:8001/api/employees/${id}`)
      .then(fetchEmployees)
      .catch(err => console.error('삭제 실패:', err))
  }
}
</script>

<style scoped>
body {
  font-family: 'Noto Sans KR', sans-serif;
}
</style>
