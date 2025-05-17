<template>
    <form class="auth-container" @submit.prevent="submitEvent">
        <div class="input-container">
            <div class="input-box"> <!-- 이름 -->
                <label for="user-name">이름</label>
                <input @input="onUserNameInput" :value="userName" id="user-name" type="text" placeholder="이름을 입력해 주세요." />
                <p class="err-msg" id="name-err-msg">{{ userNameErrMsg }}</p>
            </div>

            <div class="input-box"> <!-- 이메일 -->
                <label for="user-email">이메일</label>
                <input @input="onUserEmailInput" :value="userEmail" id="user-email" type="text" placeholder="이메일을 입력해 주세요." />
                <p class="err-msg" id="email-err-msg">{{ userEmailErrMsg }}</p>
            </div>

            <div class="input-box"> <!-- 비밀번호 -->
                <label for="user-password">비밀번호</label>
                <input @input="onUserPasswordInput" :value="userPassword" id="user-password" type="password" placeholder="비밀번호를 입력해 주세요." />
                <p class="err-msg" id="password-err-msg">{{ userPasswordErrMsg }}</p>
            </div>

            <div class="input-box"> <!-- 비밀번호 확인 -->
                <label for="user-password-chk">비밀번호 확인</label>
                <input @input="onUserPasswordChkInput" :value="userPasswordChk" id="user-password-chk" type="password" placeholder="비밀번호를 한 번 더 입력해 주세요." />
                <p class="err-msg" id="password-chk-err-msg">{{ userPasswordChkErrMsg }}</p>
            </div>
        </div>
        <button>회원가입</button>
    </form>

</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userName = ref("");
const userNameErrMsg = ref("");
const userEmail = ref("");
const userEmailErrMsg = ref("");
const userPassword = ref("");
const userPasswordErrMsg = ref("");
const userPasswordChk = ref("");
const userPasswordChkErrMsg = ref("");

// 양방향 바인딩을 하기 위한 함수
function onUserNameInput(e) {
    userName.value = e.target.value;
    validateUserName();
}

function onUserEmailInput(e) {
    userEmail.value = e.target.value;
    validateUserEmail();
}

function onUserPasswordInput(e) {
    userPassword.value = e.target.value;
    validateUserPassword();
}

function onUserPasswordChkInput(e) {
    userPasswordChk.value = e.target.value;
    validateUserPasswordConfirmation();
}

// 이름 유효성 검사
function validateUserName() {
    if (userName.value == '') {
        userNameErrMsg.value = "필수 입력 값입니다.";
        return false;
    }

    userNameErrMsg.value = "";

    return true;
}

// 이메일 유효성 검사
function validateUserEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (userEmail.value == '') {
        userEmailErrMsg.value = "필수 입력 값입니다.";
        return false;
    } else if (!emailPattern.test(userEmail.value)) {
        userEmailErrMsg.value = "올바른 이메일 형식으로 입력해 주세요."
        return false;
    }

    userEmailErrMsg.value = "";

    return true;
    
}

// 비밀번호 유효성 검사 
function validateUserPassword() {
    if (userPassword.value == '') {
        userPasswordErrMsg.value = "필수 입력 값입니다.";
        return false;
    } else if (userPassword.value.length < 3) {
        userPasswordErrMsg.value = "4글자 이상으로 작성해 주세요."
        return false;
    }

    userPasswordErrMsg.value = "";

    return true;
    
}

// 비밀번호 재확인
function validateUserPasswordConfirmation() {
    if (userPasswordChk.value == '') {
        userPasswordChkErrMsg.value = "필수 입력 값입니다.";
        return false;
    } else if (userPassword.value != userPasswordChk.value) {
        userPasswordChkErrMsg.value = "비밀번호가 일치하지 않습니다";
        return false;
    }

    userPasswordChkErrMsg.value = "";

    return true;
}

function submitEvent() {
    const isUserNameValidate = validateUserName();
    const isUserEmailValidate = validateUserEmail();
    const isUserPasswordValidate = validateUserPassword();
    const isUserPasswordConfirmed = validateUserPasswordConfirmation();

    if (isUserNameValidate && isUserEmailValidate && isUserPasswordValidate && isUserPasswordConfirmed) {
        createUser();
    }
}

async function createUser() {
    try {

        let res = await axios.post("http://localhost:8001/api/signup", {
            userName: userName.value, 
            userEmail: userEmail.value, 
            userPassword: userPassword.value
        });
        
        if (res.data == "성공") {
            alert("회원가입 성공")
            router.replace("/login");
        } else {
            alert("회원가입 실패");
        }

    } catch(e) {
        console.log(e);
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