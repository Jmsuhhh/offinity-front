<template>
  <div class="post-detail">
    <h1 class="title">다크모드 건의합니다</h1>
    <div class="meta">
      <span>작성자: 홍길동</span>
      <span>·</span>
      <span>2025-06-01</span>
      <span>·</span>
      <span>조회수: 123</span>
    </div>

    <div class="content">
      <p>
        다크모드를 기본으로 해주세요.<br />
        눈이 아픕니다. 🙏<br /><br />
        여러 줄로 작성된 내용도 이렇게 보일 수 있도록<br />
        줄바꿈이 유지되어야 합니다.
      </p>
    </div>

    <div class="button-group">
      <button class="edit">수정</button>
      <button class="delete">삭제</button>
      <button class="back">목록으로</button>
    </div>
  </div>
</template>


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

</style>