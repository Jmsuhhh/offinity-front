<template>
    <form class="auth-container" @submit.prevent="submitEvent">

        <div class="input-box">
            <label for="name">이름</label>
            <input @input="onUserNameInput" :value="userName" id="user-name" type="text" placeholder="이름을 입력해 주세요." />
            <p class="err-msg" id="name-err-msg">{{ userNameErrMsg }}</p>
        </div>

        <div class="input-box">
            <label for="security-question">본인 확인 질문</label>
            <select v-model="userSecurityQuestion" id="security-question"> 
                <option value="" hidden selected>-- 선택하세요 --</option>
                <option value="1">내가 태어난 곳은?</option>
                <option value="2">내가 다닌 초등학교 이름은?</option>
                <option value="3">내가 가장 좋아하는 영화는?</option>
            </select>
            <input @input="onUserSecurityAnswerInput" :value="userSecurityAnswer" id="security-answer" type="text" placeholder="응답 입력">
            <p class="err-msg" id="security-answer-err-msg">{{ userSecurityAnswerErrMsg }}</p>
        </div>

        <button>이메일 찾기</button>

        <AuthFooter location="이메일 찾기" />
    </form>

</template>

<script setup>
import AuthFooter from '@/components/AuthFooter.vue';
import router from '@/routers';
import axios from 'axios';
import { ref } from 'vue';

const userName = ref("");
const userNameErrMsg = ref("");
const userSecurityQuestion = ref("");
const userSecurityAnswer = ref("");
const userSecurityAnswerErrMsg = ref("");

function onUserNameInput(e) {
    userName.value = e.target.value;
    validateUserName();
}

function onUserSecurityAnswerInput(e) {
    userSecurityAnswer.value = e.target.value;
    validateUserSecurityAnswer();
}

function validateUserName() {
    if (userName.value == '') {
        userNameErrMsg.value = "필수 입력 값입니다.";
        return false;
    }

    userNameErrMsg.value = "";

    return true;
}

function validateUserSecurityAnswer() {
    if (userSecurityAnswer.value == '') {
        userSecurityAnswerErrMsg.value = "필수 입력 값입니다.";
        return false;
    }

    userSecurityAnswerErrMsg.value = "";
    return true;
}

function submitEvent() {
    const isUserNameValidate = validateUserName();
    const isUserSecurityAnswerValidate = validateUserSecurityAnswer();

    if (isUserNameValidate && isUserSecurityAnswerValidate) {
        findEmail();
    }
}

async function findEmail() {

    try {
        const res = await axios.post("http://localhost:8001/api/find-email", {
            userName : userName.value,
            userSecurityQuestion : userSecurityQuestion.value,
            userSecurityAnswer : userSecurityAnswer.value
        });

        console.log("이메일 찾기 성공");

        alert("이메일은 >> " + res.data + " << 입니다.");
        router.push('/login');

    } catch(err) {
        console.log(err);
        alert("관리자에게 문의하세요.");
    }

}


</script>

<style scoped>

.auth-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center; 

    margin-top: 100px;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-box {
    display: flex;
    flex-direction: column;
    row-gap: 7px;
}

.input-box label {
    font-size: 13px;
    font-weight: bold;
}

.input-box input { /* 아이디, 비밀번호 입력 칸 */
    width: 350px;
    padding: 15px;

    border-radius: 5px;
    border: 0;
    outline-width: 1px;
    outline-style: solid;
    outline-color: gray;

}

button {
    cursor: pointer;

    border-radius: 5px;
    border: 0;
    outline-width: 1px;
    outline-style: solid;
    outline-color: gray;
    width: 350px;
    height: 40px;

    font-weight: bold;
}

.err-msg {
    color: red;
    font-size: 12px;
    text-indent: 5px; /* 들여쓰기 */
    margin-top: -5px;
}
</style>