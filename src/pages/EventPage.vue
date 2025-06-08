<template>
    <div class="calendar-page">
        <div class="calendar-container">
            <div class="calendar-header">
                <div class="header-left">Offinity</div>
                <div class="header-center">
                    <button class="nav-btn" @click="prevMonth">&lt;</button>
                    <h2>{{ format(currentMonth, 'yyyy.MM') }}</h2>
                    <button class="nav-btn" @click="nextMonth">&gt;</button>
                </div>
                <div class="header-right">
                    <button v-if="isLoggedIn" class="top-add-button" @click="openBlankForm">일정 추가</button>
                    <span class="login-btn" v-if="!isLoggedIn" @click="goToLogin">로그인</span>
                    <span class="login-btn" v-else @click="logout">로그아웃</span>
                </div>
            </div>

            <div class="calendar-grid">
                <div class="day-header" v-for="day in weekDays" :key="day">{{ day }}</div>
                <div class="day-cell" v-for="day in days" :key="day.date" :class="[
                    { holiday: isHoliday(day.date) },
                    { outside: !day.isCurrentMonth }
                ]" @click="onDateClick(day)">
                    <div class="date-number" :class="[
                        { sunday: day.isSunday },
                        { outsideText: !day.isCurrentMonth }
                    ]">
                        {{ day.date.getDate() }}
                    </div>
                    <div class="event-label" :class="`type-${event.type}`" v-for="event in dayEvents(day.date)"
                        :key="event.id" @click.stop="onEventClick(event)" :title="`${event.time} ${event.title}`">
                        <span class="event-label-span">
                            {{ event.isAllDay ? '종일' : event.startTime }} {{ event.title }}
                        </span>

                    </div>
                    <div class="holiday-label" :class="{ faded: !day.isCurrentMonth }" v-if="getHoliday(day.date)">
                        {{ getHoliday(day.date) }}
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showDetailPopup" class="popup-overlay" @click.self="onEventClose">
            <div class="popup-box">
                <h3>[일정 상세보기]</h3>
                <p><strong>제목:</strong> {{ selectedEvent.title }}</p>
                <p>
                    <strong>일정: </strong>
                    <template v-if="selectedEvent.isAllDay">
                        {{ format(selectedEvent.date, 'yyyy-MM-dd') }}
                        <template
                            v-if="format(selectedEvent.endDate, 'yyyy-MM-dd') !== format(selectedEvent.date, 'yyyy-MM-dd')">
                            ~ {{ format(selectedEvent.endDate, 'yyyy-MM-dd') }}
                        </template>
                    </template>
                    <template v-else>
                        {{ format(selectedEvent.date, 'yyyy-MM-dd') }} {{ selectedEvent.startTime }}
                        ~
                        {{ format(selectedEvent.endDate, 'yyyy-MM-dd') }} {{ selectedEvent.endTime }}
                    </template>
                </p>

                <p v-if="selectedEvent.location"><strong>장소:</strong> {{ selectedEvent.location }}</p>
                <p v-if="selectedEvent.attendees"><strong>참석자:</strong> {{ selectedEvent.attendees }}</p>
                <p v-if="selectedEvent.description"><strong>내용:</strong> {{ selectedEvent.description }}</p>

                <div class="popup-buttons">
                    <button @click="onDeleteEvent">삭제</button>
                    <button @click="onEventClose">닫기</button>
                </div>
            </div>
        </div>
        <div v-if="showFormPopup" class="popup-overlay" @click.self="resetForm">
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
                    <input type="date" v-model="formEndDate" :min="formStartDate" />
                    <input type="time" v-model="formEndTime" v-if="!isAllDay" />
                </div>

                <div class="all-day-checkbox">
                    <input type="checkbox" v-model="isAllDay" id="allDay" />
                    <label for="allDay">종일</label>
                </div>

                <label>일정 유형</label>
                <select v-model="formType">
                    <option value="내부">내부</option>
                    <option value="외부">외부</option>
                    <option value="연차">연차</option>
                </select>

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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns'
import axios from 'axios'

const isLoggedIn = ref(false)
const currentMonth = ref(new Date())
const weekDays = ['일', '월', '화', '수', '목', '금', '토']

const holidays = ref({})
const events = ref([])

const showDetailPopup = ref(false)
const selectedEvent = ref(null)
const showFormPopup = ref(false)

const formTitle = ref('')
const formStartDate = ref('')
const formStartTime = ref('09:00')
const formEndDate = ref('')
const formEndTime = ref('09:00')
const isAllDay = ref(false)
const formLocation = ref('')
const formAttendees = ref('')
const formDescription = ref('')
const formType = ref('내부')


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

const visibleEvents = ref([])

function updateVisibleEvents() {
    const start = startOfWeek(startOfMonth(currentMonth.value));
    const end = endOfWeek(endOfMonth(currentMonth.value));

    visibleEvents.value = events.value.filter(e => {
        const eventStart = e.date;
        const eventEnd = e.endDate || e.date;
        return eventEnd >= start && eventStart <= end;
    })
}

onMounted(() => {
    const token = localStorage.getItem('token')
    console.log('📌 현재 토큰:', token)
    isLoggedIn.value = !!token
    fetchCalendarSummary()
})

watch(currentMonth, () => {
    // fetchHolidays()
    fetchCalendarSummary()
    // updateVisibleEvents()
})

watch([formStartDate, formStartTime], ([newDate, newTime]) => {
    if (!isAllDay.value) {
        formEndDate.value = newDate
        formEndTime.value = newTime
    }
})

function goToLogin() {
    const current = encodeURIComponent(window.location.pathname)
    window.location.href = `/login?redirect=${current}`
}

function logout() {
    localStorage.removeItem('token')
    isLoggedIn.value = false
    window.location.reload()
}

function prevMonth() {
    currentMonth.value = subMonths(currentMonth.value, 1)
}
function nextMonth() {
    currentMonth.value = addMonths(currentMonth.value, 1)
}

function isHoliday(date) {
    return holidays.value[format(date, 'yyyy-MM-dd')]
}
function getHoliday(date) {
    return holidays.value[format(date, 'yyyy-MM-dd')]
}

function fetchCalendarSummary() {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth() + 1
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `${token}` } : {}


    axios.get(`http://localhost:8001/api/calendar/summary`, {
        params: { year, month },
        headers
    }).then(res => {
        const result = {}

        res.data.holidays.forEach(h => {
            const ymd = `${h.dateString.slice(0, 4)}-${h.dateString.slice(4, 6)}-${h.dateString.slice(6, 8)}`
            result[ymd] = h.name
        })
        holidays.value = result

        events.value = res.data.events
            ? res.data.events
                .filter(e => !!e.startDate)
                .map(e => ({
                    id: e.eventId,
                    title: e.title,
                    date: parseISO(e.startDate),
                    endDate: parseISO(e.endDate || e.startDate),
                    isAllDay: !!e.isAllDay,
                    startTime: e.startTime?.slice(0, 5),
                    endTime: e.endTime?.slice(0, 5),
                    location: e.location,
                    attendees: e.attendees || '',
                    description: e.description,
                    type: e.type || '내부'
                }))
            : []


        nextTick(() => {
            updateVisibleEvents()
        })
    }).catch(err => {
        console.error('캘린더 데이터 불러오기 실패:', err)
    })
}

function dayEvents(date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.value.filter(event => {
        const start = format(event.date, 'yyyy-MM-dd');
        const end = format(event.endDate || event.date, 'yyyy-MM-dd');
        return dateStr >= start && dateStr <= end;
    });
}


function onDateClick(dayObj) {
    if (!isLoggedIn.value) return

    const baseDate = format(dayObj.date, 'yyyy-MM-dd')
    formStartDate.value = baseDate
    formEndDate.value = baseDate
    showFormPopup.value = true
    document.body.style.overflow = 'hidden'
}

function onEventClick(event) {
    if (!isLoggedIn.value) return

    selectedEvent.value = event
    showDetailPopup.value = true
    document.body.style.overflow = 'hidden';
}

function onEventClose() {
    showDetailPopup.value = false;
    document.body.style.overflow = 'auto';
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
    formType.value = '내부'
    document.body.style.overflow = 'auto';
}


function submitEvent() {
    if (!formTitle.value || !formStartDate.value) {
        return alert('제목과 날짜는 필수입니다.')
    }

    const start = `${formStartDate.value} ${formStartTime.value}`
    const end = `${formEndDate.value} ${formEndTime.value}`

    if (!isAllDay.value && start > end) {
        return alert('종료일은 시작일 이후여야 합니다.')
    }

    console.log('ddddd')

    axios.post('http://localhost:8001/api/event', {
        title: formTitle.value,
        description: formDescription.value,
        startDate: formStartDate.value,
        endDate: formEndDate.value,
        startTime: isAllDay.value ? null : formStartTime.value,
        endTime: isAllDay.value ? null : formEndTime.value,
        isAllDay: isAllDay.value,
        type: formType.value,
        location: formLocation.value,
        createdBy: 1 // 테스트용
    }).then(() => {
        // fetchEvents()
        fetchCalendarSummary()
        resetForm()
    }).catch(err => {
        console.error('등록 실패:', err)
    })
}

function onDeleteEvent() {
    if (!selectedEvent.value?.id) return;

    const confirmed = confirm('삭제하시겠습니까?');
    if (!confirmed) return;

    axios.delete(`http://localhost:8001/api/event/${selectedEvent.value.id}`)
        .then(() => {
            fetchCalendarSummary();
            onEventClose();
        })
        .catch(err => {
            console.error('삭제 실패:', err);
            alert('삭제 중 오류가 발생했습니다.');
        });
}

function openBlankForm() {
    if (!isLoggedIn.value) return
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

<style scoped>
.logo {
    font-size: 22px;
    font-weight: bold;
    color: #333;
}

.login-icon {
    cursor: pointer;
    font-size: 16px;
    color: #555;
}

.calendar-page {
    /* 달력 가로길이 조절 */
    max-width: 1000px;
    /* 가운데 정렬 조절 */
    margin: 0 auto;
    box-sizing: border-box;

    padding: 0;
    /* background-color: white; */
    background-color: black;
}

.calendar-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    border-radius: 2px;
    padding: 2px;
    /* background-color: white; */
    background-color: black;
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
}

/* .calendar-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 25px;
    color: black;
} */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    /* background-color: white; */
    background-color: black;
    border-bottom: 1px solid #eee;
    /* color: black; */
    color: white;
}

.header-left {
    font-size: 22px;
    font-weight: bold;
    /* color: black; */
    color: white;
}

.header-center {
    display: flex;
    align-items: center;
    gap: 10px;

}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.login-btn {
    font-size: 16px;
    cursor: pointer;
}

.top-add-button {
    /* position: absolute; */
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding: 6px 12px;
    background-color: rgb(244, 236, 255);
    color: rgb(36, 0, 36);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    height: 36px;
}


.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: auto;
    grid-auto-rows: minmax(150px, auto);
    gap: 4px;
    margin-bottom: 80px;
    position: relative;
}

.day-header {
    font-size: 20px;
    text-align: center;
    font-weight: bold;
    padding: 4px 0;
    /* background: #f0f0f0; */
    /* color: black; */
    background: #222;
    color: white;
}

.day-cell {
    border: 1px solid #ddd;
    padding: 9px;
    position: relative;
    overflow: hidden;
}

.date-number {
    font-size: 20px;
    color: #333;
    color: #eee;
}

.date-number.sunday {
    color: red;
}

.day-cell.outside {
    /* background-color: #f9f9f9; */
    background-color: #1a1a1a;
    color: #aaa;
}

.date-number.outsideText {
    /* color: #ccc; */
    color: #666;
}

.holiday {
    background-color: #310f0f;
}

.holiday-label {
    font-size: 15px;
    color: red;
    margin-top: 4px;
}

.event-label {
    margin-top: 4px;
    background: lightpink;
    color: black;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 20px;
    height: 20px;
    max-width: 100%;
    cursor: pointer;

    display: flex;
    align-items: center;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    width: 100%;
    min-width: 0;
    max-width: 100%;

    flex: 1 1 auto;
}

.type-내부 {
    background-color: rgb(221, 241, 247);
}

.type-외부 {
    background-color: rgb(255, 251, 213);
}

.type-연차 {
    background-color: rgb(255, 231, 231);
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
    /* color: #333; */
    color: #eee;
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
    /* background: white; */
    background-color: black;
    color: #333;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.popup-box h3 {
    margin-top: 0;
    font-size: 20px;
    color: #222;
    color: #fff;
}

.popup-box p {
    margin: 8px 0;
    font-size: 15px;
    line-height: 1.4;
}

.popup-box button {
    margin-top: 10px;
    padding: 6px 12px;
    /* background-color: #f9f9f9; */
    background-color: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.popup-box input,
.popup-box textarea {
    width: 100%;
    margin-bottom: 8px;
    padding: 6px;
    font-size: 14px;
    box-sizing: border-box;
    background-color: #111;
    color: #eee;
    border: 1px solid #444;
}

.popup-box label {
    display: block;
    margin-top: 12px;
    text-align: left;
    color: #eee;
}

.popup-box select {
    width: 100%;
    padding: 6px;
    margin-bottom: 8px;
    font-size: 14px;
    background-color: #111;   
    color: #eee;              
    border: 1px solid #444;   
    box-sizing: border-box;
}

.popup-box input[type="date"],
.popup-box input[type="time"] {
    background-color: #111;
    color: #eee;
    border: 1px solid #444;
}

.all-day-checkbox label {
    color: #eee; 
}

.popup-box input::placeholder,
.popup-box textarea::placeholder {
    color: #888;  
}

input[type="date"],
input[type="time"] {
  color-scheme: dark; 
}

.all-day-checkbox {

    display: flex;
    align-items: center;
    gap: 4px;
    margin: 12px 0 4px;
    font-size: 16px;
    justify-content: center;
}

.all-day-checkbox input {
    margin-bottom: 0;
    width: auto;
}

.all-day-checkbox label {
    white-space: nowrap;
    font-weight: normal;
    margin: 0;
}

.event-label-span {
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>