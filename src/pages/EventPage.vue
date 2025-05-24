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
                    <div class="holiday-label" :class="{ faded: !day.isCurrentMonth }" v-if="getHoliday(day.date)">
                        {{ getHoliday(day.date) }}
                    </div>
                    <!-- <div class="event-label" v-for="event in dayEvents(day.date)" :key="event.id">
                        {{ event.isAllDay ? '종일' : event.time.split('~')[0]?.trim() }} {{ event.title }}
                    </div> -->
                </div>

                <div v-for="event in visibleEvents" :key="event.id" class="event-label"
                    :style="getAbsoluteEventStyle(event)" @click.stop="onEventClick(event)">
                    {{ event.isAllDay ? '종일' : event.time.split('~')[0]?.trim() }} {{ event.title }}
                </div>
            </div>

            <button class="floating-add-button" @click="openBlankForm">일정 추가</button>
        </div>
        <div v-if="showDetailPopup" class="popup-overlay" @click.self="onEventClose">
            <div class="popup-box">
                <h3>[일정 상세보기]</h3>
                <p><strong>제목:</strong> {{ selectedEvent.title }}</p>
                <!-- <p><strong>일정:</strong> {{ selectedEvent.date }} {{ selectedEvent.time }}</p> -->
                <p><strong>일정:</strong> {{ format(selectedEvent.date, 'yyyy-MM-dd') }} {{ selectedEvent.time }}</p>
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
                    <input type="date" v-model="formEndDate" />
                    <input type="time" v-model="formEndTime" v-if="!isAllDay" />
                </div>

                <div class="all-day-checkbox">
                    <input type="checkbox" v-model="isAllDay" id="allDay" />
                    <label for="allDay">종일</label>
                </div>


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

const isLoggedIn = ref(true)
const userRole = ref('ADMIN')

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
    // fetchEvents()
    // fetchHolidays()
    fetchCalendarSummary()
})

watch(currentMonth, () => {
    // fetchHolidays()
    fetchCalendarSummary()
    updateVisibleEvents()
})

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
    return holidays.value[format(date, 'yyyy-MM-dd')]
}
function getHoliday(date) {
    return holidays.value[format(date, 'yyyy-MM-dd')]
}

function fetchCalendarSummary() {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth() + 1

    axios.get(`http://localhost:8001/api/calendar/summary`, {
        params: { year, month }
    }).then(res => {
        const result = {}

        res.data.holidays.forEach(h => {
            const ymd = `${h.dateString.slice(0, 4)}-${h.dateString.slice(4, 6)}-${h.dateString.slice(6, 8)}`
            result[ymd] = h.name
        })
        holidays.value = result

        const loadedEvents = res.data.events.map(e => ({
            id: e.eventId,
            title: e.title,
            date: parseISO(e.startDate),
            endDate: parseISO(e.endDate),
            time: e.isAllDay ? '종일' : `${e.startTime?.slice(0, 5)} ~ ${e.endTime?.slice(0, 5)}`,
            location: e.location,
            attendees: e.attendees || '',
            description: e.description
        }))
        events.value = loadedEvents

        nextTick(() => {
            updateVisibleEvents()
        })
    }).catch(err => {
        console.error('캘린더 데이터 불러오기 실패:', err)
    })
}
// function dayEvents(date) {
//     const dateStr = format(date, 'yyyy-MM-dd')
//     return events.value.filter(event => format(event.date, 'yyyy-MM-dd') === dateStr)
// }

// function dayEvents(date) {
//     const dateStr = format(date, 'yyyy-MM-dd');
//     return events.value.filter(event => {
//         const start = format(event.date, 'yyyy-MM-dd');
//         const end = format(event.endDate || event.date, 'yyyy-MM-dd');
//         return dateStr >= start && dateStr <= end;
//     });
// }

function onDateClick(dayObj) {
    if (!isLoggedIn.value || userRole.value !== 'ADMIN') return

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

function getAbsoluteEventStyle(event) {
    const grid = document.querySelector('.calendar-grid');
    const gridWidth = grid?.offsetWidth || 700;
    const cellWidth = gridWidth / 7;

    const start = new Date(event.date);
    const end = new Date(event.endDate || event.date);

    const startIndex = days.value.findIndex(d => format(d.date, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd'));
    const endIndex = days.value.findIndex(d => format(d.date, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd'));

    if (startIndex === -1 || endIndex === -1) return {};

    return {
        position: 'absolute',
        top: `${32 + (startIndex / 7 | 0) * 150}px`,
        left: `${startIndex * cellWidth}px`,
        width: `${(endIndex - startIndex + 1) * cellWidth}px`,
        height: '20px',
        backgroundColor: 'lightpink',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '14px',
        color: 'black',
        zIndex: 5
    };
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
    grid-auto-rows: minmax(150px, auto);
    gap: 4px;
    margin-bottom: 80px;
    position: relative;
}

.floating-add-button {
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

/* .event-label {
    font-size: 15px;
    background-color: lightpink;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: black;
    display: block;
    grid-column-end: span 1;
} */

.event-label {
    position: absolute;
    top: 32px;
    background: lightpink;
    color: black;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    z-index: 10;
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

/* .popup-box {
    background: white;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
} */

.popup-box {
    background: white;
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
}

.popup-box p {
    margin: 8px 0;
    font-size: 15px;
    line-height: 1.4;
}

.popup-box button {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
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
}

.all-day-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
}

.all-day-checkbox label {
    margin: 0;
    font-weight: normal;
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