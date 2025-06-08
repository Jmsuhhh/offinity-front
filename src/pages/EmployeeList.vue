<template>
  <div class="container">
    <main class="main">
      <!-- Header with Title and Home Link -->
      <div class="header">
        <h2 class="title">전체 직원 명부</h2>
        <router-link to="/event" class="button-home">캘린더페이지</router-link>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          v-model="filters.name"
          placeholder="이름 검색"
          class="filter-input"
        />
        <input
          v-model="filters.department"
          placeholder="부서 검색"
          class="filter-input"
        />
        <input
          v-model="filters.position"
          placeholder="직책 검색"
          class="filter-input"
        />
      </div>

      <!-- Employee Table -->
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="header-cell" @click="sortBy('employeeId')">직원 ID</th>
            <th class="header-cell" @click="sortBy('employeeName')">이름</th>
            <th class="header-cell" @click="sortBy('employeeDepartment')">부서</th>
            <th class="header-cell" @click="sortBy('employeePosition')">직책</th>
            <th class="header-cell" @click="sortBy('employeeEmail')">이메일</th>
            <th class="header-cell" @click="sortBy('employeePhoneNumber')">전화번호</th>
            <th class="header-cell" @click="sortBy('employeeDateOfJoin')">입사일</th>
            <th class="header-cell">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.employeeId" class="row">
            <td class="cell">{{ employee.employeeId }}</td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeeName" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeeName }}
              </template>
            </td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeeDepartment" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeeDepartment }}
              </template>
            </td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeePosition" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeePosition }}
              </template>
            </td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeeEmail" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeeEmail }}
              </template>
            </td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeePhoneNumber" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeePhoneNumber }}
              </template>
            </td>
            <td class="cell">
              <template v-if="editingId === employee.employeeId">
                <input v-model="editedEmployee.employeeDateOfJoin" type="date" class="cell-input" />
              </template>
              <template v-else>
                {{ employee.employeeDateOfJoin }}
              </template>
            </td>
            <td class="cell actions">
              <template v-if="editingId === employee.employeeId">
                <button @click="saveEdit" class="button-save">저장</button>
                <button @click="cancelEdit" class="button-cancel">취소</button>
                <button @click="confirmDelete(employee.employeeId)" class="button-delete">삭제</button>
              </template>
              <template v-else>
                <button @click="startEdit(employee)" class="button-edit">편집</button>
              </template>
            </td>
          </tr>
          <tr v-if="employees.length === 0">
            <td class="cell text-center" colspan="8">직원 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage <= 1" class="pagination-button">이전</button>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages" class="pagination-button">다음</button>
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
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = true }
  currentPage.value = 1
}

function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }

function startEdit(emp) { editingId.value = emp.employeeId; editedEmployee.value = { ...emp } }
function cancelEdit() { editingId.value = null; editedEmployee.value = {} }

async function saveEdit() {
  try {
    await axios.put(`http://localhost:8001/api/employees/${editedEmployee.value.employeeId}`, editedEmployee.value)
    cancelEdit(); fetchEmployees()
  } catch (err) { console.error('저장 실패:', err) }
}

function confirmDelete(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    axios.delete(`http://localhost:8001/api/employees/${id}`)
      .then(fetchEmployees)
      .catch(err => console.error('삭제 실패:', err))
  }
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
}
.main {
  flex: 1;
  background-color: #000000;
  padding: 2.5rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}
.button-home {
  background-color: #2563EB;
  color: #FFFFFF;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
}
.button-home:hover {
  background-color: #1D4ED8;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}
.filter-input {
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  width: 13rem;
  background-color: #FFFFFF;
}
.table {
  width: 100%;
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #D1D5DB;
  border-collapse: collapse;
}
.table-header {
  background-color: #E9D5FF;
  cursor: pointer;
}
.header-cell,
.cell {
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  color: #FFFFFF;
}
.row:hover .cell {
  background-color: #333333;
}
.cell-input {
  border: 1px solid #D1D5DB;
  padding: 0.25rem;
  width: 100%;
  background-color: #FFFFFF;
  color: #000000;
}
.button-edit {
  background-color: #7E22CE;
  color: #FFFFFF;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.button-edit:hover {
  background-color: #6B21A8;
}
.button-save {
  background-color: #10B981;
  color: #FFFFFF;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.button-save:hover {
  background-color: #059669;
}
.button-cancel {
  background-color: #9CA3AF;
  color: #FFFFFF;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.button-cancel:hover {
  background-color: #6B7280;
}
.button-delete {
  background-color: #EF4444;
  color: #FFFFFF;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.button-delete:hover {
  background-color: #DC2626;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  align-items: center;
}
.pagination-button {
  padding: 0.25rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  background-color: #FFFFFF;
  color: #000000;
}
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.text-center {
  text-align: center;
  color: #FFFFFF;
}
.actions {
  display: flex;
  gap: 0.25rem;
}
</style>
