<template>
    <div class="header-container">
      <img src="../assets/images/header.jpg" alt="배경이미지" class="header-image"/>
      <h1 class="page-title">결재 요청 목록</h1>
  </div>

  <div class="approval-container">
    <h2 class="section-title">연차 신청현황</h2>
    <div class="scroll-table">
      <table class="approval-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>직급</th>
            <th>신청일</th>
            <th>기간</th>
            <th>일수</th>
            <th>사유</th>
            <th style="min-width: 180px;">결재의견</th>
            <th>결재</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedRequests.length === 0">
            <td colspan="8" style="text-align:left">결재할 연차 신청이 없습니다.</td>
          </tr>
          <tr v-for="approvalItems in paginatedRequests" :key="approvalItems.requestId">
            <td>{{ approvalItems.employeeName }}</td>
            <td>{{ approvalItems.employeeGrade }}</td>
            <td>{{ approvalItems.requestDate }}</td>
            <td>{{ approvalItems.startDate }} ~ {{ approvalItems.endDate }}</td>
            <td>{{ approvalItems.leaveDays }}</td>
            <td>{{ approvalItems.reason }}</td>
            <td>
              <input v-model="approvalItems.approvalComment" placeholder="의견 입력" />
            </td>
            <td>
              <button @click="confirmDecision(approvalItems, 'APPROVED')">승인</button>
              <button @click="confirmDecision(approvalItems, 'REJECTED')">반려</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: currentPage === page }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const approverId = route.params.id;
const approvalItems = ref([]);

const leaveConfirm = ref(
  { status: '', approvalComment: '', requestId: "" }); 

const currentPage = ref(1);
const itemsPerPage = 5;

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return approvalItems.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(approvalItems.value.length / itemsPerPage);
});

async function loadApprovals() {
  try {
    const res = await axios.get(
      `http://localhost:8001/api/leave/${approverId}/approvals`, 
      { withCredentials: true }
    );
    approvalItems.value = res.data;
  } catch (e) {
    alert("결재 요청 불러오기 실패");
  }
}

async function confirmDecision(approvalItems, decision) {
  if (!confirm(`${decision === 'APPROVED' ? '승인' : '반려'}하시겠습니까?`)) return;

  try {
    leaveConfirm.value = {
      status: decision,
      approvalComment: approvalItems.approvalComment,
      requestId: approvalItems.requestId
    };

    await axios.put(`http://localhost:8001/api/leave/${leaveConfirm.value.requestId}/approval`, 
      leaveConfirm.value, { withCredentials: true }
    );

    alert(`${decision === 'APPROVED' ? '승인' : '반려'} 완료되었습니다.`);
    router.push(`/leave/${approverId}`);
  } catch (e) {
    alert("결재 처리 실패");
  }
}

onMounted(() => {
  loadApprovals();
});
</script>

<style scoped>

.header-container {
  position: relative;
  width: 100%;
  height: 100px; /* 원하는 이미지 높이 */
  overflow: hidden;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지 비율 유지하며 잘림 */
  display: block;
}
.page-title {
  position: absolute;
  transform: translateX(-50%);
  top: 20px;
  left: 50%;
  font-weight: bold;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 20px;
  color: whitesmoke;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
}

.section-title {
  margin-bottom: 10px;;
  font-size: 1.3rem;
  font-weight: bold;
}

.approval-container {
  background: rgb(77, 61, 1);
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
}

.section-title {
  margin-bottom: 10px;;
  font-size: 1.3rem;
  font-weight: bold;
}


.scroll-table {                 /* 내부 콘텐츠(특히 너비가 넓은 테이블)가 */
  overflow-x: auto;           /* 컨테이너 너비를 넘을 경우, 가로 스크롤바가 자동으로 생김. */
}

.approval-table {
  width: 100%;                /* 가능한 공간을 모두 사용 */
  min-width: 800px;           /* 화면이 작아져도 최소 800px 유지  */
  border-collapse: collapse;  /* 테두리(border)가 겹치지 않고 한줄로 표현 */
}

.approval-table th,.approval-table td {
  padding: 12px;
  border-bottom: 1px solid #333;
  text-align: center;
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.approval-table input {
  width: 95%;
  padding: 5px;
}

.approval-table button {
  margin: 2px;
  padding: 5px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.approval-table button:first-child {
  background-color: #007bff;
  color: white;
}

.approval-table button:last-child {
  background-color: #dc3545;
  color: white;
}


.pagination {
  text-align: center;     /* 페이지 번호들을 중앙 정렬  */
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 5px 10px;
  background: #333;
  color: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination .active {
  background: #007bff;
  color: white;
  font-weight: bold;
}

</style>