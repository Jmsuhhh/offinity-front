<template>
  <h1>Suggestion 게시글 목록</h1>
  <table>
    <thead>
      <tr>
        <th>번호</th>
        <th>제목</th>
        <th>작성자</th>
        <th>날짜</th>
        <th>조회수</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="board in boardList" :key="board.postId">
        <td>{{board.postId}}</td>
        <td class="title">{{board.title}}</td>
        <td>{{board.userId}}</td>
        <td>{{dateFormat(board.createdAt)}}</td>
        <td>{{board.views}}</td>
      </tr>
    </tbody>
  </table>
  <button>등록</button>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';

const boardList = ref([]);

function dateFormat(date){
  const target = new Date(date);
  return `${target.getFullYear()}-${target.getMonth()+1 >=1 && target.getMonth()+1 <= 9 ? `0${target.getMonth()+1}` : target.getMonth()+1}-${target.getDate() >= 1 && target.getDate() <= 9 ? `0${target.getDate()}` : target.getDate()} ${target.getHours()}:${target.getMinutes()}:${target.getSeconds()}`;
}

async function fetchBoardList() {
  try{
    const res = await axios.get('http://localhost:8001/api/suggestion');
    // console.log(res.data);
    boardList.value = res.data;
  }catch(e){
    alert('게시글 불러오기 실패');
  }
}

onMounted(()=>{
  fetchBoardList();
});
</script>


<style scoped>
h1{
  text-align: center;
}

/* 테이블 기본 스타일 */
table {
    width: 90%;
    margin: 40px auto;
    border-collapse: collapse;
    background-color: #1e1e1e;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

/* 테이블 헤더 */
thead {
    background-color: #2c2c2c;
}

th {
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    color: #ffffff;
    border-bottom: 1px solid #333;
}

/* 테이블 바디 */
td {
    padding: 14px 16px;
    border-bottom: 1px solid #333;
}

/* 짝수 행에 약간 다른 배경색 */
tbody tr:nth-child(even) {
    background-color: #252525;
}

/* 마우스 오버 시 강조 효과 */
tbody tr:hover {
    background-color: #333333;
    transition: background-color 0.2s ease;
}

/* 제목 컬럼 하이라이트 */
td.title {
  color: #f664ef;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 350px; 
}

td.title:hover {
    text-decoration: underline;
}

button{
  margin: 0 auto;
  display: block;
  padding: 10px 20px;
  background-color: #f664ef;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

/* 반응형 고려 */
@media (max-width: 768px) {
    table {
        font-size: 14px;
    }

    th, td {
        padding: 10px;
    }

    td.title {
    max-width: 100px; 
  }

}

</style>