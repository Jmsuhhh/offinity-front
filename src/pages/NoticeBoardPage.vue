<template>
    <table>
        <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
        </tr>
        <tbody>
            <tr v-for="notice in noticeList" :key="notice.Id">
                <td>{{ notice.id }}</td>
                <td @click="moveToNoticeDetail(notice.id)">{{ notice.title }}</td>
                <td>{{ notice.writer }}</td>
                <td>{{ notice.date }}</td>
                <td>{{ notice.views }}</td>
            </tr>
        </tbody>
    </table>

</template>


<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const noticeList = ref([]);
const router = useRouter();

async function fetchNoticeList() {
    try {
        const res = await axios.get('http://localhost:8001/api/notice');
        noticeList.value = res.data;
    } catch(err) {
        console.log(err)
        alert('공지 게시글을 불러오는 도중 오류가 발생했습니다.');
    }
}

function moveToNoticeDetail(id) {
    router.push(`/board/notice/${id}`)
}

onMounted(()=>{
  fetchNoticeList();
});

</script>

<style scoped>

</style>