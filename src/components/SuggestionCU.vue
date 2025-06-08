<template>
  <form @submit.prevent="onSubmit">

      <div class="post-container">
        <h2>게시글 {{isEdit ? '수정' : '등록'}}</h2>

        <label for="title">제목</label>
      <input id="title" v-model="title" type="text" placeholder="제목을 입력하세요" />

      <label for="content">내용</label>
      <textarea id="content" v-model="content" rows="10" placeholder="내용을 입력하세요"></textarea>

      <div class="radio-group">
        <span>공개 여부</span>
        <label><input v-model="visibility" type="radio" name="visibility" value="공개" /> 공개</label>
        <label><input v-model="visibility" type="radio" name="visibility" value="비공개" /> 비공개</label>
      </div>

      <div class="button-group">
        <button class="submit">{{isEdit ? '수정' : '작성'}}</button>
        <button type="button" class="cancel" @click="clickReturn">돌아가기</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import axios from 'axios';
import { defineProps, ref } from 'vue';
import { useRouter } from 'vue-router';
defineProps({
  isEdit : {type:Boolean ,default : false}
});

const router = useRouter();

const title = ref('');
const content = ref('');
const visibility = ref('공개');

function validateTitle(){
  return true;
}

function validateContent(){
  return true;
}

async function onSubmit(){
  const isTitleValidate = validateTitle();
  const isContentValidate = validateContent();
  if(isTitleValidate && isContentValidate){
    await axios.post('http://localhost:8001/api/suggestion', {
      title : title.value,
      content : content.value,
      visible : visibility.value
    });

    router.replace('/board/suggestion');
  }
}

function clickReturn(){
  router.replace('/board/suggestion');
}

</script>

<style scoped>
.post-container {
  background-color: #1e1e1e;
  color: #e0e0e0;
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-container h2 {
  margin-bottom: 10px;
  color: #ffffff;
}

/* 공통 input, textarea 스타일 */
input[type="text"], textarea {
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 5px;
  color: #fff;
  padding: 12px;
  font-size: 16px;
  resize: vertical;
}

input[type="text"]::placeholder,
textarea::placeholder {
  color: #888;
}

/* 라디오 그룹 */
.radio-group {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: #ccc;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 버튼 그룹 */
.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

/* 작성 버튼 */
button.submit {
  background-color: #f664ef;
  color: #fff;
}

button.submit:hover {
  background-color: #fa4df1;
}

/* 돌아가기 버튼 */
button.cancel {
  background-color: #444;
  color: #ccc;
}

button.cancel:hover {
  background-color: #555;
}

</style>
