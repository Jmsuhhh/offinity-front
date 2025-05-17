<template>
    <form class="auth-container" @submit.prevent="submitEvent">
        <div class="input-container">
            <div class="input-box">
                <input v-model="userEmail" type="text" placeholder="이메일을 입력해 주세요."/>
            </div>
            <div class="input-box">
                <input v-model="userPassword" type="password" placeholder="비밀번호를 입력해 주세요."/>
            </div>
        </div>
        <p id="login-msg" style="margin-top: -10px;" class="err status-msg">{{ loginErrMsg }}</p>
        <button>로그인</button>
    </form>

</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userEmail = ref("");
const userPassword = ref("");
const loginErrMsg = ref("");
// const isLoginSuccess = ref(false);

async function submitEvent() {

    if (!userEmail.value && !userPassword.value) {
        alert("이메일과 비밀번호를 입력해주세요")
        return
    }
    else if (!userEmail.value) {
        alert("이메일을 입력해주세요")
        return
    }
    else if (!userPassword.value) {
        alert("비밀번호를 입력해주세요")
        return
    }

    try { // 로그인 요청
        const res = await axios.post("http://localhost:8001/api/login", {
            userEmail : userEmail.value,
            userPassword : userPassword.value
        });

        // console.log(res.headers.getAuthorization());
        localStorage.setItem("token" , res.headers.getAuthorization());
        loginErrMsg.value = "";

        console.log("로그인 성공");

        alert("로그인 성공");
        router.replace('/');

    } catch(err) { // 요청 실패 시 실행 
        console.log(err)
        if (err.response && err.response.status === 401) {
            loginErrMsg.value = "아이디 또는 비밀번호를 확인하세요.";
        } else {
            alert("관리자에게 문의하세요.");
        }
    }
    
    
}

</script>


<style scoped>

.auth-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center; 

    margin-top: 200px;
}

.input-container {
    border-radius: 5px;
    border: 0;
    outline-width: 1px;
    outline-style: solid;
    outline-color: gray;
}

.input-box input { /* 아이디, 비밀번호 입력 칸 */
    width: 350px;

    border: none;

    padding: 15px;
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

/* 바로 앞에 input-box 클래스가 있는 경우에만 적용 */
.input-box + .input-box {
    border-top: 1px solid gray;
}

</style>