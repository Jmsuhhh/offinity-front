<template>
  <li class="comment-item">
    <div class="comment-meta">
      <strong>{{ comment.commentId }}</strong>
      <span>{{ comment.createdAt }}</span>
      <button class="delete-btn" @click="onDelete">삭제</button>
    </div>
    <p class="comment-content" v-if="!isEdit" @click="changeEdit()">{{ comment.content }}</p>
    <input v-model="commentContent" @blur="onBlur" class="comment-content" type="text" ref="inputRef" v-else>

  </li>
</template>

<script setup>
import { defineProps, nextTick, ref , defineEmits} from 'vue';
const props = defineProps({comment : {type : Object, required:true}})

const isEdit = ref(false);
const inputRef = ref(null);
const commentContent = ref(props.comment.content);
const emit = defineEmits(['update', 'delete']);

function changeEdit(){
  isEdit.value = true;

  nextTick(()=>{
    if (inputRef.value) {
      inputRef.value.focus();
    }
  })
}

function onBlur(){
  if (commentContent.value !== props.comment.content) {
    emit('update', {
      commentId: props.comment.commentId,
      content: commentContent.value
    });
  }
  isEdit.value = false;
}
function onDelete() {
  if (confirm('댓글을 삭제하시겠습니까?')) {
    emit('delete', props.comment.commentId);
  }
}

</script>

<style scoped>
.delete-btn {
  background-color: #555555;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: 0.3s;
}
strong{
  flex-grow: 1;
}

.delete-btn:hover {
  background-color: #815251;
}
.comment-item {
  padding: 15px;
  background-color: #292929;
  border-radius: 5px;
  margin-bottom: 10px;
}

.comment-meta {
  font-size: 13px;
  color: #bbbbbb;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  column-gap: 20px;
}

.comment-content {
  font-size: 15px;
  color: #e0e0e0;
}

input{
  width: 100%;
  background-color: rgb(78, 78, 78);
  border: none;
  padding: 0 15px;

  
}

</style>