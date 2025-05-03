<template>
    <div ref="calendarContainer" style="height: 800px;"></div>
  </template>
  
  <script>
  import Calendar from '@toast-ui/calendar';
  import '@toast-ui/calendar/dist/toastui-calendar.min.css';
  
  export default {
    name: 'EventPage',
    mounted() {
      this.calendar = new Calendar(this.$refs.calendarContainer, {
        defaultView: 'month',
        usageStatistics: false
      });
    }
  };
  </script>