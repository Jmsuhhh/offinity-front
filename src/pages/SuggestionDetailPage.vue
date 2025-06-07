<template>
  <div class="post-detail" v-if="board!=null">
    <h1 class="title">{{board.title}}</h1>
    <div class="meta">
      <span>작성자 id: {{board.userId}}</span>
      <span>·</span>
      <span>{{board.createdAt}}</span>
      <span>·</span>
      <span>조회수: {{board.views}}</span>
    </div>

    <div class="content">
      <p>
        {{board.content}}
      </p>
    </div>

    <div class="button-group">
      <button class="edit" @click="router.push(`/board/suggestion/${route.params.id}/update`)">수정</button>
      <button class="delete" @click="onDeleteClick">삭제</button>
      <button class="back" @click="router.push('/board/suggestion')">목록으로</button>
    </div>
  </div>
  <div v-else class="post-detail">
    게시글 정보를 불러오는 중입니다.
  </div>

  <!-- 댓글 섹션 -->
<div class="comment-section">
  <h2>댓글</h2>

  <!-- 댓글 입력 -->
  <div class="comment-input">
    <textarea v-model="newComment" placeholder="댓글을 입력하세요..."></textarea>
    <button @click="submitComment">작성</button>
  </div>

  <!-- 댓글 목록 -->
  <ul class="comment-list">
    <CommentItem v-for="comment in comments" :key="comment.commentId" :comment="comment"
    @update="updateComment"
    @delete="handleDelete"
    />
  </ul>
</div>

</template>


<script setup>
import CommentItem from '@/components/CommentItem.vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const board = ref(null);
const newComment = ref('');
const comments = ref([]);

async function onDeleteClick(){
  let answer = confirm('삭제하시겠습니까?');
  console.log(answer)
  if(answer){
    const res = await deleteBoard();
    if(res){
      router.replace('/board/suggestion');
    }

  }
}
async function fetchBoard(){
  try{
    const res = await axios.get(`http://localhost:8001/api/suggestion/${route.params.id}`);
    if (res.data.visible === 'private') {
      alert('비공개 글입니다.');
      router.replace('/board/suggestion');
      return;
    }

    board.value = res.data;

  }catch(e){
    alert('오류 발생');
  }
}

async function deleteBoard(){
  try{
    await axios.delete(`http://localhost:8001/api/suggestion/${route.params.id}`);
    return true;
  }catch(e){
    alert('삭제 오류 발생');
    return false;
  }
}

async function fetchComments() {
  try{
    const res = await axios.get(`http://localhost:8001/api/suggestion/comments/${route.params.id}`);
    comments.value = res.data;
  }catch(e){
    alert('댓글 목록 불러오기 오류');
  }
}

async function createComments(){
  try{
    await axios.post(`http://localhost:8001/api/suggestion/comments` , {
      postId : route.params.id,
      content : newComment.value
    });
    return true;
  }catch(e){
    alert('댓글 추가 오류');
    return false;
  }

}

async function updateComment({ commentId, content }){
  try{
    await axios.put(`http://localhost:8001/api/suggestion/comments/${commentId}`, {
      content : content
    })
    const target = comments.value.find(c => c.commentId === commentId);
    if (target) target.content = content;
  }catch(e){
    alert('댓글 수정 실패');
    return false;
  }
}

async function handleDelete(commentId) {
  try {
    await axios.delete(`http://localhost:8001/api/suggestion/comments/${commentId}`);
    comments.value = comments.value.filter(c => c.commentId !== commentId);
  } catch (e) {
    alert('댓글 삭제 실패');
  }
}

async function submitComment() {
  if (newComment.value.trim() === '') {
    alert('댓글을 입력해주세요.');
    return;
  }
  const res = await createComments();
  if(res){
    fetchComments();
    newComment.value = '';
  }
}

onMounted(()=>{
  fetchBoard();
  fetchComments();
})
</script>

<style scoped>
.post-detail {
  background-color: #1e1e1e;
  color: #e0e0e0;
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
}

.meta {
  font-size: 14px;
  color: #aaaaaa;
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.content {
  line-height: 1.7;
  font-size: 16px;
  white-space: pre-line; /* 줄바꿈 유지 */
  margin-bottom: 30px;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.2s;
}

button.edit {
  background-color: #f664ef;
  color: white;
}

button.edit:hover {
  background-color: #fa4df1;
}

button.delete {
  background-color: #e57373;
  color: white;
}

button.delete:hover {
  background-color: #ef5350;
}

button.back {
  background-color: #444;
  color: #ccc;
}

button.back:hover {
  background-color: #555;
}

.comment-section {
  margin: 50px auto;
  border-top: 1px solid #333;
  padding-top: 30px;
  max-width: 800px;
}

.comment-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #f0f0f0;
}

/* 입력 영역 */
.comment-input {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 30px;
}

.comment-input textarea {
  flex-grow: 1;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #e0e0e0;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
  resize: vertical;
  min-height: 80px;
}

.comment-input button {
  padding: 8px 16px;
  background-color: #2b2b2b;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}

.comment-input button:hover {
  background-color: #444444;
}

/* 댓글 리스트 */
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}


</style>