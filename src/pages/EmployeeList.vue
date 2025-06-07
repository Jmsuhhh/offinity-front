<template>
  <div class="flex min-h-screen font-sans">
    <main class="flex-1 bg-gray-50 p-10">
      <h2 class="text-xl font-semibold text-purple-800 mb-6 underline">전체 직원 명부</h2>

      <!-- Filters -->
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
        <input v-model="filters.name" placeholder="이름 검색" class="border rounded-md px-3 py-2 text-sm w-52" />
        <input v-model="filters.department" placeholder="부서 검색" class="border rounded-md px-3 py-2 text-sm w-52" />
        <input v-model="filters.position" placeholder="직책 검색" class="border rounded-md px-3 py-2 text-sm w-52" />
      </div>

      <!-- Employee Table -->
      <table class="w-full text-sm text-left border">
        <thead class="bg-purple-200 cursor-pointer">
          <tr>
            <!-- sortBy 로 정렬 필드를 변경 -->
            <th class="p-2 border" @click="sortBy('employeeId')">직원 ID</th>
            <th class="p-2 border" @click="sortBy('employeeName')">이름</th>
            <th class="p-2 border" @click="sortBy('employeeDepartment')">부서</th>
            <th class="p-2 border" @click="sortBy('employeePostion')">직책</th>
            <th class="p-2 border" @click="sortBy('employeeEmail')">이메일</th>
            <th class="p-2 border" @click="sortBy('employeePhoneNumber')">전화번호</th>
            <th class="p-2 border" @click="sortBy('employeeDateOfJoin')">입사일</th>
            <th class="p-2 border">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.employeeId">
            <td class="p-2 border">{{ employee.employeeId }}</td>
            <td class="p-2 border">{{ employee.employeeName }}</td>
            <td class="p-2 border">{{ employee.employeeDepartment }}</td>
            <td class="p-2 border">{{ employee.employeePostion }}</td>
            <td class="p-2 border">{{ employee.employeeEmail }}</td>
            <td class="p-2 border">{{ employee.employeePhoneNumber }}</td>
            <td class="p-2 border">{{ employee.employeeDateOfJoin }}</td>
            <td class="p-2 border">
              <button @click="startEdit(employee)" class="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600">
                편집
              </button>
            </td>
          </tr>
          <tr v-if="employees.length === 0">
            <td class="p-2 border text-center" colspan="8">직원 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="mt-4 flex justify-center space-x-2 items-center">
        <button @click="prevPage" :disabled="currentPage <= 1" class="px-3 py-1 border rounded disabled:opacity-50">이전</button>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">다음</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import axios from 'axios';

// Filters 상태
const filters = ref({ name: '', department: '', position: '' });

// Sorting 상태
const sortField = ref('employeeId');
const sortAsc = ref(true);

// Pagination 상태
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = ref(1);

// 직원 데이터 배열
const employees = ref([]);

// 직원 목록 로드 함수
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
        size: itemsPerPage
      }
    });
    employees.value = data.employees;
    totalPages.value = data.totalPages;
  } catch (error) {
    console.error('직원 목록 로드 오류:', error);
  }
}

// 컴포넌트 마운트 및 필터/페이지/정렬 변경 시 재호출
onMounted(fetchEmployees);
watchEffect(fetchEmployees);

// 정렬 함수: 필드 토글
function sortBy(field) {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortField.value = field;
    sortAsc.value = true;
  }
  currentPage.value = 1;
  fetchEmployees();
}

// 페이지 이동 함수
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

// 편집 시작 더미
function startEdit(employee) {
  console.log('편집 시작:', employee);
}
</script>

<style scoped>
body { font-family: 'Noto Sans KR', sans-serif; }
</style>
