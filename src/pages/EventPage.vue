<template>
    <div class="calendar-page">
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="nav-btn" @click="prevMonth">&lt;</button>
                <h2>{{ format(currentMonth, 'yyyy.MM') }}</h2>
                <button class="nav-btn" @click="nextMonth">&gt;</button>
            </div>

            <div class="calendar-grid">
                <div class="day-header" v-for="day in weekDays" :key="day">{{ day }}</div>
                <div class="day-cell"  v-for="day in days" :key="day.date" :class="[
                    { holiday: isHoliday(day.date) },
                    { outside: !day.isCurrentMonth }
                ]" @click="onDateClick(day)">
                    <div class="date-number" :class="[
                        { sunday: day.isSunday },
                        { outsideText: !day.isCurrentMonth }
                    ]" >
                        {{ day.date.getDate() }}
                    </div>

                    <div class="holiday-label" :class="{ faded: !day.isCurrentMonth }" v-if="getHoliday(day.date)">
                        {{ getHoliday(day.date) }}
                    </div>
                    <div class="event-label" @click.stop="onEventClick(event)" v-for="event in dayEvents(day.date)" :key="event.id"
                        >
                        {{ event.time.split('~')[0]?.trim() }} {{ event.title }}
                    </div>
                </div>
            </div>
            <button class="floating-add-button" @click="openBlankForm">일정 추가</button>
        </div>
        <div v-if="showDetailPopup" class="popup-overlay">
            <div class="popup-box">
                <h3>[일정 상세보기]</h3>
                <p><strong>제목:</strong> {{ selectedEvent.title }}</p>
                <p><strong>일정:</strong> {{ selectedEvent.date }} {{ selectedEvent.time }}</p>
                <p v-if="selectedEvent.location"><strong>장소:</strong> {{ selectedEvent.location }}</p>
                <p v-if="selectedEvent.attendees"><strong>참석자:</strong> {{ selectedEvent.attendees }}</p>
                <p v-if="selectedEvent.description"><strong>내용:</strong> {{ selectedEvent.description }}</p>
                <button @click="onEventClose">닫기</button>
            </div>
        </div>
        <div v-if="showFormPopup" class="popup-overlay">
            <div class="popup-box">
                <h3>[일정 등록]</h3>
                <label>제목</label>
                <input v-model="formTitle" placeholder="제목 입력" />

                <label>시작</label>
                <div class="datetime-group">
                    <input type="date" v-model="formStartDate" />
                    <input type="time" v-model="formStartTime" v-if="!isAllDay" />
                </div>

                <label>종료</label>
                <div class="datetime-group">
                    <input type="date" v-model="formEndDate" />
                    <input type="time" v-model="formEndTime" v-if="!isAllDay" />
                </div>

                <label>
                    <input type="checkbox" v-model="isAllDay" /> 종일
                </label>

                <label>장소</label>
                <input v-model="formLocation" placeholder="장소" />

                <label>참석자</label>
                <input v-model="formAttendees" placeholder="참석자" />

                <label>내용</label>
                <textarea v-model="formDescription" />

                <button @click="submitEvent">등록</button>
                <button @click="resetForm">취소</button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths
} from 'date-fns'


const currentMonth = ref(new Date())
const weekDays = ['일', '월', '화', '수', '목', '금', '토']

// 공휴일 샘플
const holidays = {
    '2025-05-01': '근로자의 날',
    '2025-05-05': '어린이날'
}

const days = computed(() => {
    const start = startOfWeek(startOfMonth(currentMonth.value))
    const end = endOfWeek(endOfMonth(currentMonth.value))
    const monthIndex = currentMonth.value.getMonth()

    return eachDayOfInterval({ start, end }).map(date => ({
        date,
        isCurrentMonth: date.getMonth() === monthIndex,
        isSunday: date.getDay() === 0
    }))
})


// 일정 상세보기 샘플
const events = ref([
    {
        id: 1,
        title: 'A업체 미팅',
        date: '2025-05-14',
        time: '14:00 ~ 15:00',
        location: '2층 회의실',
        attendees: '사원 A',
        description: '-'
    },
    {
        id: 2,
        title: '전체 부서 회식',
        date: '2025-05-14',
        time: '17:00 ~ 19:00',
        location: '',
        attendees: '',
        description: ''
    }
])

const showDetailPopup = ref(false)
const selectedEvent = ref(null)
const showFormPopup = ref(false)

const formDate = ref(null)
const formTitle = ref('')
const formStartDate = ref('')
const formStartTime = ref('09:00')
const formEndDate = ref('')
const formEndTime = ref('09:00')
const isAllDay = ref(false)
const formLocation = ref('')
const formAttendees = ref('')
const formDescription = ref('')

watch([formStartDate, formStartTime], ([newDate, newTime]) => {
    if (!isAllDay.value) {
        formEndDate.value = newDate
        formEndTime.value = newTime
    }
})

function prevMonth() {
    currentMonth.value = subMonths(currentMonth.value, 1)
}
function nextMonth() {
    currentMonth.value = addMonths(currentMonth.value, 1)
}

function isHoliday(date) {
    return getHoliday(date) !== undefined
}
function getHoliday(date) {
    return holidays[format(date, 'yyyy-MM-dd')]
}

function onDateClick(dayObj) {
    const baseDate = format(dayObj.date, 'yyyy-MM-dd')
    // const found = events.value.find(e => e.date === baseDate)
   
    formStartDate.value = baseDate
    formEndDate.value = baseDate
    formStartTime.value = '09:00'
    formEndTime.value = '18:00'
    showFormPopup.value = true
    
    document.body.style.overflow = 'hidden';
}

function submitEvent() {
    if (!formTitle.value || !formStartDate.value) {
        alert('제목과 날짜는 필수입니다!')
        return
    }

    const start = `${formStartDate.value} ${formStartTime.value}`
    const end = `${formEndDate.value} ${formEndTime.value}`

    if (!isAllDay.value && start > end) {
        alert('종료일은 시작일과 같거나 이후여야 합니다!')
        return
    }

    events.value.push({
        id: Date.now(),
        title: formTitle.value,
        date: formDate.value,
        time: isAllDay.value ? '종일' : `${start} ~ ${end}`,
        location: formLocation.value,
        attendees: formAttendees.value,
        description: formDescription.value
    })
    resetForm()
}

function resetForm() {
    formTitle.value = ''
    formStartDate.value = ''
    formStartTime.value = '09:00'
    formEndDate.value = ''
    formEndTime.value = '09:00'
    formLocation.value = ''
    formAttendees.value = ''
    formDescription.value = ''
    isAllDay.value = false
    showFormPopup.value = false
    showDetailPopup.value = false
    document.body.style.overflow = 'auto';
}
function dayEvents(date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.value.filter(event => event.date === dateStr)
}
function onEventClick(event) {
    selectedEvent.value = event
    showDetailPopup.value = true
    document.body.style.overflow = 'hidden';
}

function onEventClose(){
    showDetailPopup.value = false;
    document.body.style.overflow = 'auto';
}

function openBlankForm() {
  formTitle.value = ''
  formStartDate.value = format(new Date(), 'yyyy-MM-dd')
  formStartTime.value = '09:00'
  formEndDate.value = format(new Date(), 'yyyy-MM-dd')
  formEndTime.value = '18:00'
  formLocation.value = ''
  formAttendees.value = ''
  formDescription.value = ''
  isAllDay.value = false
  showFormPopup.value = true
}

</script>

<style>
.calendar-page {
    /* 달력 가로길이 조절 */
    max-width: 1000px;
    /* 가운데 정렬 조절 */
    margin: 0 auto;
    box-sizing: border-box;

    padding: 0;
    background-color: white;
}

.calendar-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    border-radius: 2px;
    padding: 2px;
    background-color: white;
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
}

.calendar-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 25px;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: auto;
    grid-auto-rows: minmax(150px , auto);
    gap: 4px;
    margin-bottom: 80px;
}

.floating-add-button{
    position: fixed;
    right: 20px;
    bottom: 20px;
}



.day-header {
    font-size: 20px;
    text-align: center;
    font-weight: bold;
    padding: 4px 0;
    background: #f0f0f0;
}

.day-cell {
    border: 1px solid #ddd;
    padding: 9px;
    position: relative;
}

.date-number {
    font-size: 20px;
    color: #333;
}

.date-number.sunday {
    color: red;
}

.day-cell.outside {
    background-color: #f9f9f9;
    color: #aaa;
}

.date-number.outsideText {
    color: #ccc;
}

.holiday {
    background-color: #fff7f7;
}

.holiday-label {
    font-size: 15px;
    color: red;
    margin-top: 4px;
}

.event-label {
    font-size: 15px;
    background-color: lightpink;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.holiday-label.faded {
    color: #bbb;
}

.nav-btn {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    padding: 4px 12px;
    color: #333;
}

.nav-btn:hover {
    color: #000;
    font-weight: bold;
}

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.popup-box {
    background: white;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
}

.popup-box input,
.popup-box textarea {
    width: 100%;
    margin-bottom: 8px;
    padding: 6px;
    font-size: 14px;
    box-sizing: border-box;
}
.floating-add-btn {
  position: absolute;
  right: 20px; 
  bottom: 20px;
  width: 60px; 
  height: 60px;
  font-size: 14px; 
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: coral;
  color: white;
  z-index: 999;
}


</style>