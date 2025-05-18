<template>
    <div class="auth-footer">
        <RouterLink to="/signup" v-if="location != '회원가입'">회원가입</RouterLink>
        <div class="dividing-line" v-if="location != '회원가입'"></div>
        <RouterLink to="/login" v-if="location != '로그인'">로그인</RouterLink>
        <div class="dividing-line" v-if="location != '로그인'"></div>
        <RouterLink to="/find-email" v-if="location != '이메일 찾기'">이메일 찾기</RouterLink>
        <div class="dividing-line" v-if="location != '이메일 찾기'"></div>
        <RouterLink>비밀번호 찾기</RouterLink>
    </div>

</template>

<script setup>
import { defineProps} from 'vue';
defineProps({location : String});


</script>

<style scoped>

.auth-footer {
    display: flex;
    justify-content: space-between;
    margin-top: -10px;
    font-size: 12px;
    width: 350px
}

.auth-footer a {
    color: rgb(41, 41, 41);
    text-decoration: none;
}

.dividing-line {
    border-right: 1px solid silver;
    height: 15px;
}

</style>