<template>
    <div class="flex min-h-screen font-sans">
      <!-- Sidebar -->
      <aside class="w-60 bg-purple-100 text-purple-800 p-6">
        <h1 class="text-xl font-bold mb-8">Admin Portal</h1>
        <nav>
          <ul>
            <li class="mb-4"><a href="#" class="hover:underline">전체 직원 관리</a></li>
            <li><a href="#" class="hover:underline">신규 직원 등록</a></li>
          </ul>
        </nav>
      </aside>
  
      <!-- Main Content -->
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
  
        <!-- Table -->
        <table class="w-full text-sm text-left border">
          <thead class="bg-purple-200 cursor-pointer">
            <tr>
              <th class="p-2 border" @click="sortBy('employee_id')">직원 ID</th>
              <th class="p-2 border" @click="sortBy('name')">이름</th>
              <th class="p-2 border" @click="sortBy('department')">부서</th>
              <th class="p-2 border" @click="sortBy('position')">직책</th>
              <th class="p-2 border" @click="sortBy('email')">이메일</th>
              <th class="p-2 border" @click="sortBy('phone_number')">전화번호</th>
              <th class="p-2 border" @click="sortBy('created_at')">등록일자</th>
              <th class="p-2 border">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in paginatedEmployees" :key="employee.employee_id">
              <td class="p-2 border">{{ employee.employee_id }}</td>
              <td class="p-2 border">{{ employee.name }}</td>
              <td class="p-2 border">{{ employee.department }}</td>
              <td class="p-2 border">{{ employee.position }}</td>
              <td class="p-2 border">{{ employee.email }}</td>
              <td class="p-2 border">{{ employee.phone_number }}</td>
              <td class="p-2 border">{{ employee.created_at }}</td>
              <td class="p-2 border">
                <button class="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600">편집</button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <!-- Pagination -->
        <div class="mt-4 flex justify-center space-x-2">
          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            이전
          </button>
          <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            다음
          </button>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const filters = ref({
    name: '',
    department: '',
    position: '',
  });
  
  const sortField = ref('employee_id');
  const sortAsc = ref(true);
  const currentPage = ref(1);
  const itemsPerPage = 5;
  
  const employees = ref([
    { employee_id: 1001, name: '홍길동', department: '인사팀', position: '대리', email: 'hong@co.com', phone_number: '010-1234-5678', created_at: '2025-04-01' },
    { employee_id: 1002, name: '김미영', department: '개발팀', position: '팀장', email: 'kim@co.com', phone_number: '010-2345-6789', created_at: '2025-04-02' },
    { employee_id: 1003, name: '박지성', department: '기획팀', position: '사원', email: 'park@co.com', phone_number: '010-4567-1234', created_at: '2025-04-03' },
    { employee_id: 1004, name: '이수민', department: '개발팀', position: '과장', email: 'lee@co.com', phone_number: '010-5678-9012', created_at: '2025-04-04' },
    { employee_id: 1005, name: '정은지', department: '인사팀', position: '차장', email: 'jung@co.com', phone_number: '010-6789-1234', created_at: '2025-04-05' },
   
  ]);
  
  const filteredEmployees = computed(() => {
    return employees.value
      .filter((e) => e.name.includes(filters.value.name))
      .filter((e) => e.department.includes(filters.value.department))
      .filter((e) => e.position.includes(filters.value.position));
  });
  
  const sortedEmployees = computed(() => {
    return [...filteredEmployees.value].sort((a, b) => {
      const field = sortField.value;
      if (a[field] < b[field]) return sortAsc.value ? -1 : 1;
      if (a[field] > b[field]) return sortAsc.value ? 1 : -1;
      return 0;
    });
  });
  
  const totalPages = computed(() =>
    Math.ceil(sortedEmployees.value.length / itemsPerPage)
  );
  
  const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return sortedEmployees.value.slice(start, start + itemsPerPage);
  });
  
  function sortBy(field) {
    if (sortField.value === field) {
      sortAsc.value = !sortAsc.value;
    } else {
      sortField.value = field;
      sortAsc.value = true;
    }
    currentPage.value = 1;
  }
  </script>
  
  <style scoped>
  body {
    font-family: 'Noto Sans KR', sans-serif;
  }
  </style>
  