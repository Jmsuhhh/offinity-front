<template>

    <div class="header-container">
        <!-- 연차 승인 관리 버튼 -->
        <RouterLink class="approval-icon" :to = "`/leave/${route.params.id}/approval`">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                <path d="m18 18.5l.278-1.386c.146-.733.538-1.41.678-2.144q.045-.229.044-.47a2.5 2.5 0 1 0-4.956.47c.14.735.532 1.41.679 2.144L15 18.5m3 0h-3m3 0l2.497.666A1.92 1.92 0 0 1 22 21.04c0 .53-.43.96-.96.96h-9.08a.96.96 0 0 1-.96-.96c0-.9.625-1.679 1.503-1.874L15 18.5M17 9V8c0-2.828 0-4.243-.879-5.121C15.243 2 13.828 2 11 2H8c-2.828 0-4.243 0-5.121.879C2 3.757 2 5.172 2 8v8c0 2.828 0 4.243.879 5.121C3.757 22 5.172 22 8 22"/><path d="M7 8.667s.625 0 1.25 1.333c0 0 1.985-3.333 3.75-4m-6 8h4m-4 3h4"/></g></svg>
            <span class="badge"> {{ pendingCount }}</span>
        </RouterLink>

        <!-- 메인 타이틀 -->
        <img src="../assets/images/header.jpg" alt="배경이미지" class="header-image"/>
        <h1 class="page-title">연차 현황</h1>
    </div>

 
    <!-- 직원 기본 정보 -->
    <section class="info-section">
        <div class="info-row">
            <div>부서:  {{ employeeInfo.employeeDepartment }}</div>
            <div>작급:  {{ employeeInfo.employeeGrade }}</div>           
            <div>이름:  {{ employeeInfo.employeeName }}</div>
            <div>입사일:{{ employeeInfo.employeeDateOfJoin }}</div>              
        </div>
    </section>

    <!-- 연차현황 카드-->
    <section class="leave-status-section">
        <div class="leave-status-row">
            <div class="card">
                <h4>총연차</h4>
                <p>{{ leaveSummary.totalLeave }}</p>
            </div>
            <div class="card">
                <h4>사용연차</h4>
                <p>{{ leaveSummary.usedLeave }}</p>
            </div>
            <div class="card">
                <h4>잔여연차</h4>
                <p>{{ leaveSummary.residualLeave }}</p>
            </div>
        </div>
    </section>

    <!-- 연차 신청 -->
    <section class="apply-section">
        <h2 class="section-title">
            {{ isEditMode ? '연차 수정' : '연차 신청' }}
        </h2>
        <div class="form-grid">
            <div class="form1-grid">
             <!-- 1행 -->
                <div class="grid-item">
                    <label>결재자</label>
                    <select v-model="leaveApply.approverId">
                        <option disabled value="">선택</option>
                        <option v-for="a in leaveApprover" 
                            :key="a.approverId" :value="a.approverId">
                            {{ a.approverName }}
                        </option>
                    </select>
                </div>

                <!-- 2행 -->
                <div class="grid-item">
                    <label>연차구분</label>
                    <select v-model="leaveApply.leaveType">
                        <option disabled value="">선택</option>
                        <option>연차</option>
                        <option>반차(오전)</option>
                        <option>반차(오후)</option>
                    </select>
                </div>
                <div class="grid-item">
                    <label>신청일</label>
                    <input type="date" v-model="leaveApply.requestDate" />
                </div>

                <!-- 3행 -->
                <div class="grid-item">
                    <label>시작일</label>
                    <input type="date" v-model="leaveApply.startDate" />
                </div>
                <div class="grid-item">
                    <label>종료일</label>
                    <input type="date" v-model="leaveApply.endDate" 
                        :disabled="leaveApply.leaveType?.includes('반차')"
 />
                </div>
                <div class="grid-item">
                    <label>연차일수</label>
                    <div class="days-display">{{ leaveApply.leaveDays }}일</div>
                </div>
            </div>

            <!-- 4행 -->
            <div class="form2-grid">
                <label>사유</label>
                 <input type="text" placeholder="연차 사유를 작성합니다." v-model="leaveApply.reason" />
            </div>
        </div>

        <div class="submit-btn">
            <button @click="isEditMode ? updateLeave() : submitLeave()">
                {{ isEditMode ? '연차 수정' : '연차 신청' }}
            </button>
        </div>
    </section>
    
    <!-- 연차 신청현황 -->
    <section class="history-section">
        <h2 class="section-title">연차 신청현황</h2>

        <div class="scroll-table">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>신청일</th>
                        <th>기간</th>
                        <th>일수</th>
                        <th>상태</th>
                        <th style="min-width: 180px;">결재 의견</th>
                        <th>수정/취소</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="paginatedRequests.length === 0">
                        <td colspan="6" style="text-align:left">신청한 연차 내역이 없습니다.</td>
                    </tr>
                    <tr v-for="item in paginatedRequests" :key="item.requestId">
                        <td>{{ item.requestDate }}</td>
                        <td>{{ item.startDate }} ~ {{ item.endDate }}</td>
                        <td>{{ item.leaveDays }}</td>
                        <td>{{ item.status }}</td>
                        <td>
                        <!-- 20자 초과 시 줄임표 표시 -->
                        <div class="opinion-cell">
                            <span v-if="item.approvalComment">
                                {{ item.approvalComment.length > 20 ? item.approvalComment.substring(0, 20) + '...' : item.approvalComment }}
                            </span>
                        </div>
                        </td>
                        <td>
                            <button v-if="canEdit(item)" @click="editLeave(item)">수정</button>
                            <button v-if="canCancel(item)" @click="cancelLeave(item)">취소</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <button v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }" @click="currentPage = page">
               {{ page }}
            </button>
        </div>
    </section>

</template>
  
<script setup>

    import dayjs from 'dayjs';
    import { ref, onMounted } from 'vue';
    import axios from 'axios';
    import { useRoute } from 'vue-router';
    import { watch } from 'vue';
    import { computed } from 'vue';

    
    const route = useRoute();

    const employeeInfo = ref({});   // 직원 정보 저장
    const leaveSummary = ref({});   // 연차현황 요약
    const leaveApprover =ref([]);   // 결재자 정보
    const leaveApply = ref({
        approverId: '', leaveType: '', 
        requestDate: dayjs().format('YYYY-MM-DD'),      // 신청일을 오늘 날자로 세팅
        startDate: '', endDate: '', leaveDays: 0, reason: ''});

    const pendingCount = ref(0);

    const item = ref([]);  // 연차 신청 목록 저장
    const isEditMode = ref(false);

    const currentPage = ref(1);
    const itemsPerPage = 5;

    const paginatedRequests = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        return item.value.slice(start, start + itemsPerPage);   // slice(start, start + itemsPerPage)는 해당 구간의 데이터를 잘라 반환
    });

    const totalPages = computed(() => {
        return Math.ceil(item.value.length / itemsPerPage);     // Math.cell(number)는 올림 함수
    });

    const holidays = [
    '2025-01-01', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', // 설날
    '2025-03-01', '2025-03-03', // 3/1 대체
    '2025-05-01', 
    '2025-05-05', '2025-05-06', // 어린이날 대체
    '2025-06-03', // 대통령 선거
    '2025-06-06', '2025-08-15', '2025-10-03',
    '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', // 추석
    '2025-10-09', '2025-12-25'
    ];


    async function loadEmployeeInfo(employeeId){
        
        try{
            const res = await axios.get(
                `http://localhost:8001/api/leave/${employeeId}/employee`,
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });
            employeeInfo.value = res.data;
            console.log(employeeId);
            console.log(res.data);
        }catch(e){
            alert("직원 정보를 불러오지 못했습니다.");
        }
    }

    async function loadLeaveRequests(employeeId) {

        try {
            const res = await axios.get(
                `http://localhost:8001/api/leave/${employeeId}/request`,
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });

            item.value = res.data;
            console.log("연차신청 목록:", res.data);
        } catch (e) {
            console.error("연차 신청 목록 불러오기 실패", e);
            alert("연차 신청 목록을 불러오지 못했습니다.");
        }
    }


    async function loadLeaveSummary(employeeId) {

        try {
            const res = await axios.get(
                `http://localhost:8001/api/leave/${employeeId}/summary`,
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });

            leaveSummary.value = res.data;
            console.log("연차현황 요약:", res.data);
        } catch (e) {
            console.error("연차현향 요약 불러오기 실패", e);
            alert("연차현황 요약 목록을 불러오지 못했습니다.");
        }
    }


    async function loadLeaveApprover(employeeId) {

        try {
            const res = await axios.get(
                `http://localhost:8001/api/leave/${employeeId}/approver`,
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });

            leaveApprover.value = res.data;
            console.log("결재자 정보:", res.data);
        } catch (e) {
            console.error("결재자 정보 불러오기 실패", e);
            alert("결재자 정보 불러오지 못했습니다.");
        }
    }

    async function submitLeave() {
        const employeeId = route.params.id;

        // 유효성 검사 (선택사항)
        if (!leaveApply.value.approverId || !leaveApply.value.leaveType 
            || !leaveApply.value.startDate || !leaveApply.value.endDate) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        try {
            await axios.post(
               `http://localhost:8001/api/leave/${employeeId}/apply`,
                leaveApply.value, 
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });

            alert("연차 신청이 완료되었습니다.");
            // 신청 후 목록, 요약 다시 불러오기
            loadLeaveRequests(employeeId);
            loadLeaveSummary(employeeId);

            // 입력 폼 초기화
            leaveApply.value = {
                approverId: '', leaveType: '', requestDate: dayjs().format('YYYY-MM-DD'),
                startDate: '', endDate: '', leaveDays: 0, reason: ''
            };

        } catch (error) {
            console.error("연차 신청 실패", error);
            alert("연차 신청에 실패했습니다.");
        }
    }

    onMounted(() => {
        const employeeId = route.params.id;
        loadEmployeeInfo(employeeId);
        loadLeaveRequests(employeeId);
        loadLeaveSummary(employeeId);
        loadLeaveApprover(employeeId);
        loadPendingCount(employeeId);
    });

    function calculateLeaveDays() {
        const start = dayjs(leaveApply.value.startDate);
        const end = dayjs(leaveApply.value.endDate);

        if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
            leaveApply.value.leaveDays = 0;
            return;
        }

        // 반차는 무조건 0.5일
        if (leaveApply.value.leaveType === '반차(오전)' || leaveApply.value.leaveType === '반차(오후)') {
            leaveApply.value.leaveDays = 0.5;
            return;
        }

        let count = 0;
        let current = start;

        while (current.isBefore(end.add(1, 'day'))) {
            const day = current.day(); // 0: 일요일, 6: 토요일
            const isWeekend = (day === 0 || day === 6);
            const isHoliday = holidays.includes(current.format('YYYY-MM-DD'));

            if (!isWeekend && !isHoliday) {
                count++;
            }
            current = current.add(1, 'day');
        }

        leaveApply.value.leaveDays = count;
    }

    watch(
        () => [leaveApply.value.leaveType, leaveApply.value.startDate, 
            leaveApply.value.endDate],
        () => {
            if (['반차(오전)', '반차(오후)'].includes(leaveApply.value.leaveType)) {
                leaveApply.value.endDate = leaveApply.value.startDate;
            }
            calculateLeaveDays();
        }
    );


    function editLeave(item) {
        console.log("editLeave");
        console.log(leaveApprover.value);
        isEditMode.value = true;
        leaveApply.value = {
            requestId: item.requestId,
            approverId: item.approverId,
            leaveType: item.leaveType,
            requestDate: item.requestDate,
            startDate: item.startDate,
            endDate: item.endDate,
            leaveDays: item.leaveDays,
            reason: item.reason
        };
        console.log("현재 선택된 approverId:", leaveApply.value.approverId);
        leaveApprover.value.forEach(a => {
             console.log("옵션:", a.approverId, a.approverName);
        });


    }

    async function updateLeave() {
        const employeeId = route.params.id;

        try {
            await axios.put(
                `http://localhost:8001/api/leave/${leaveApply.value.requestId}`,
                leaveApply.value, 
                { headers : { Authorization : localStorage.getItem("token") },
                withCredentials: true });

            alert("연차 수정이 완료되었습니다.");
            isEditMode.value = false;
            leaveApply.value = {
                approverId: '', leaveType: '', requestDate: dayjs().format('YYYY-MM-DD'),
                startDate: '', endDate: '', leaveDays: 0, reason: ''
            };
            loadLeaveRequests(employeeId);
            loadLeaveSummary(employeeId);

            alert("연차 수정후 초기화를 하였습니다.");

        } catch (error) {
            console.error("연차 수정 실패", error);
            alert("연차 수정에 실패했습니다.");
        }
    }

    async function cancelLeave(item) {
        if (!confirm("정말로 해당 연차 신청을 취소하시겠습니까?")) return;

        try {
            await axios.delete(`http://localhost:8001/api/leave/${item.requestId}`, 
                { headers : { Authorization : localStorage.getItem("token") },
                  withCredentials: true });

            alert("연차 신청이 취소되었습니다.");
            loadLeaveRequests(route.params.id);
            loadLeaveSummary(route.params.id);
        } catch (error) {
            console.error("연차 취소 실패", error);
            alert("연차 취소에 실패했습니다.");
        }
    }


    function canEdit(item) {
        return item.updatable === true;
    }

    function canCancel(item) {
        return item.cancellable === true;
    }

    //  결재할 연차신청 현황 숫자 계산
    async function loadPendingCount(employeeId) {
        try {
            const res = await axios.get(`http://localhost:8001/api/leave/${employeeId}/approvals`, 
                { headers : { Authorization : localStorage.getItem("token") },
                withCredentials: true });
                
            // 상태가 PENDING인 요청만 세기
            pendingCount.value = res.data.length;
        } catch (e) {
            console.error("결재 요청 수 조회 실패", e);
            pendingCount.value = 0;
        }
    }

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

.approval-icon {
  position: fixed;
  top: 15px;
  right: 15px;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 3px 6px;
  border-radius: 12px;
  line-height: 1;
}

.approval-icon svg {
  width: 30px;
  height: 30px;
}

.approval-icon svg path {

  stroke: whitesmoke;
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

.info-section, .leave-status-section, .apply-section, .history-section {
  background: rgb(77, 61, 1);
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
}

.info-row, .leave-status-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: #ccc;
  font-size: 1rem;
  font-weight: bold;
}

.card {
  flex: 1;
  background: #7da105;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(255,255,255,0.1);
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form1-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 항상 3열 */
  gap: 16px;
}

.form2-grid {
  display: grid;
  grid-template-columns: 1fr 2fr; /* 왼쪽 1비율, 오른쪽 2비율 */
  gap: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  color: #ccc;
  margin-bottom: 0;
}

.submit-btn {
  margin-top: 20px;
  text-align: center;
}

.submit-btn button {
  width: 100%;       
  background-color: transparent;  /* 배경 제거 */
  padding: 5px;
  border: none;
  background-color: red;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.scroll-table {                 /* 내부 콘텐츠(특히 너비가 넓은 테이블)가 */
  overflow-x: auto;           /* 컨테이너 너비를 넘을 경우, 가로 스크롤바가 자동으로 생김. */
}

.history-table {
  width: 100%;                /* 가능한 공간을 모두 사용 */
  min-width: 800px;           /* 화면이 작아져도 최소 800px 유지  */
  border-collapse: collapse;  /* 테두리(border)가 겹치지 않고 한줄로 표현 */
}

.history-table th, .history-table td {
  padding: 12px;
  border-bottom: 1px solid #333;
  text-align: center;
  color: #ccc;
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

.history-table button:first-child {
  background-color: #007bff;
  color: white;
}

.history-table button:last-child {
  background-color: #dc3545;
  color: white;
}

</style>