<template>
    <div>
        <!-- 캘린더 표시 영역 -->
        <div ref="calendarContainer" style="height: 800px; margin-bottom: 20px;"></div>

        <!-- 일정 등록 팝업 -->
        <div v-if="showFormPopup" class="form-box">
            <h3>[일정 작성]</h3>
            <label>제목:</label>
            <input v-model="title" placeholder="제목 입력" />

            <label>일정:</label>
            <input type="datetime-local" v-model="start" /> ~
            <input type="datetime-local" v-model="end" />
            <label>
                <input type="checkbox" v-model="isAllDay" /> 종일
            </label>

            <label>장소:</label>
            <input v-model="location" />

            <label>참석자:</label>
            <input v-model="attendees" />

            <label>내용:</label>
            <textarea v-model="description"></textarea>

            <button @click="submitEvent">등록</button>
            <button @click="resetForm">취소</button>
        </div>

        <!-- 일정 상세보기 팝업 -->
        <div v-if="showDetailPopup" class="detail-box">
            <h3>[일정 상세보기]</h3>
            <p>제목: {{ selectedEvent.title }}</p>
            <p>
                일정: {{ selectedEvent.start }} ~ {{ selectedEvent.end }}<span v-if="selectedEvent.isAllDay"> (종일)</span>
            </p>
            <p v-if="selectedEvent.location !== ''">장소: {{ selectedEvent.location }}</p>
            <p v-if="selectedEvent.attendees !== ''">참석자: {{ selectedEvent.attendees }}</p>
            <p v-if="selectedEvent.description !== ''">내용: {{ selectedEvent.description }}</p>

            <button @click="closeDetailPopup">닫기</button>
        </div>
    </div>
</template>

<script setup>
import Calendar from '@toast-ui/calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { onMounted, ref } from 'vue'
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const calendarContainer = ref(null)
const calendarInstance = ref(null)

const title = ref('')
const start = ref('')
const end = ref('')
const isAllDay = ref(false)
const location = ref('')
const attendees = ref('')
const description = ref('')

const showFormPopup = ref(false)
const showDetailPopup = ref(false)
const selectedEvent = ref({})

onMounted(() => {
    calendarInstance.value = new Calendar(calendarContainer.value, {
        defaultView: 'month',
        showFormPopup: true,
        useFormPopup: false,
        useDetailPopup: false,
        calendars: [
            { id: 'all', name: '전체', backgroundColor: '#9e5fff' },
            { id: 'dept1', name: '부서1', backgroundColor: '#00a9ff' },
            { id: 'dept2', name: '부서2', backgroundColor: '#ffb840' },
            { id: 'dept3', name: '부서3', backgroundColor: '#ff4040' },
        ],
    });
    

    calendarInstance.value.on('click', (e) => {
        if (e.schedule == null) {
      console.log('폼 팝업 열기');
      showFormPopup.value = true;
    } else {
      console.log('디테일 팝업 열기', e.schedule);
      selectedEvent.value = e.schedule;
      showDetailPopup.value = true;
    }
  });
});
//     calendarInstance.value.on('click', (e) => {
//         selectedEvent.value = e.schedule;
//         showDetailPopup.value = true;
//     });
// });


function submitEvent() {
    if (!title.value || !start.value || !end.value) {
        alert('제목과 일정은 필수입니다.')
        return
    }

    const event = {
        id: Date.now().toString(),
        calendarId: 'all',
        title: title.value,
        body: description.value,
        location: location.value,
        attendees: attendees.value,
        isAllday: isAllDay.value,
        start: start.value,
        end: end.value,
    }

    calendarInstance.value.createEvents([event])
    resetForm()
    alert('일정 등록 완료')
}

function resetForm() {
    title.value = ''
    start.value = ''
    end.value = ''
    isAllDay.value = false
    location.value = ''
    attendees.value = ''
    description.value = ''
    showFormPopup.value = false;
}

</script>
<style scoped>
.form-box,
.detail-box {
  position: fixed;
  top: 100px;
  left: 100px;
  background: white;
  z-index: 9999;
  border: 1px solid #ccc;
  padding: 20px;
}
</style>
