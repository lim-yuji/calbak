let currentPassword = 'test1234';
let currentEmail = 'sample@example.com';
const appVersion = '1.0.0';  // 앱 버전 정보
const notices = [
  { id: 1, title: "앱 버전 1.0.1 업데이트 예정", content: "이번 업데이트에서는 성능이 개선됩니다." },
  { id: 2, title: "서버 점검 안내", content: "5월 20일 02시~04시 서버 점검이 예정되어 있습니다." },
  { id: 3, title: "새 기능 추가", content: "즐겨찾기 기능이 추가되었습니다." }
];

// 공통 모달 표시 함수
function showModal(message, callback) {
    const modal = document.getElementById('modal');
    const modalMsg = document.getElementById('modalMsg');
    modalMsg.textContent = message;
    modal.style.display = 'flex';
    document.getElementById('modalOkBtn').onclick = function () {
        modal.style.display = 'none';
        if (callback) callback();
    };
}

// 폼 입력 모달 표시 함수
function showFormModal(title, fields, onSubmit) {
    const formModal = document.getElementById('formModal');
    const formTitle = document.getElementById('formTitle');
    const formFields = document.getElementById('formFields');
    formTitle.textContent = title;
    formFields.innerHTML = '';

    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = field.type;
        input.placeholder = field.placeholder;
        input.id = field.id;
        input.value = field.value || '';
        if (field.disabled) input.disabled = true;
        formFields.appendChild(input);
    });

    formModal.style.display = 'flex';

    document.getElementById('formSubmitBtn').onclick = () => {
        const values = {};
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            values[field.id] = input.disabled
                ? input.placeholder.replace('현재 이메일: ', '')
                : input.value;
        });

        formModal.style.display = 'none';
        onSubmit(values);
    };
}

// 페이지 로드 시 앱 버전 표시
document.addEventListener('DOMContentLoaded', () => {
    const appVersionSpan = document.getElementById('appVersion');
    if (appVersionSpan) {
        appVersionSpan.textContent = appVersion;
    }
});


// 비밀번호 변경
document.getElementById('changePasswordBtn').onclick = () => {
    showFormModal("비밀번호 변경", [
        { id: 'currentPw', type: 'password', placeholder: '현재 비밀번호 입력' }
    ], (data) => {
        if (data.currentPw !== currentPassword) {
            return showModal("현재 비밀번호가 일치하지 않습니다.");
        }

        showFormModal("새 비밀번호 입력", [
            { id: 'newPw', type: 'password', placeholder: '새 비밀번호 입력' },
            { id: 'confirmPw', type: 'password', placeholder: '새 비밀번호 재입력' }
        ], (newData) => {
            if (newData.newPw !== newData.confirmPw) {
                return showModal("새 비밀번호가 서로 일치하지 않습니다.");
            }
            currentPassword = newData.newPw;
            showModal("비밀번호가 성공적으로 변경되었습니다.");
        });
    });
};

// 이메일 변경
document.getElementById('changeEmailBtn').onclick = () => {
    showFormModal("이메일 변경", [
        { id: 'currentEmail', type: 'text', placeholder: `현재 이메일: ${currentEmail}`, disabled: true },
        { id: 'password', type: 'password', placeholder: '계정 비밀번호 입력' }
    ], (data) => {
        if (data.password !== currentPassword) {
            return showModal("비밀번호가 일치하지 않습니다.");
        }

        showFormModal("새 이메일 입력", [
            { id: 'newEmail', type: 'email', placeholder: '새 이메일 주소 입력' }
        ], (newData) => {
            if (!newData.newEmail.includes('@')) {
                return showModal("올바른 이메일 형식을 입력해주세요.");
            }

            currentEmail = newData.newEmail;
            showModal("이메일이 성공적으로 변경되었습니다.");
        });
    });
};

// 공지사항 확인
document.getElementById('noticeBtn').onclick = () => {
  let html = '<strong>공지사항</strong><br><br>';
  notices.forEach(n => {
    html += `<p><strong>${n.title}</strong><br>${n.content}</p><hr>`;
  });
  showModal(html);
};

// 모달 외부 클릭 시 닫기
document.getElementById('modal').addEventListener('click', function (e) {
    if (e.target === this) this.style.display = 'none';
});
document.getElementById('formModal').addEventListener('click', function (e) {
    if (e.target === this) this.style.display = 'none';
});

// 로그아웃
document.getElementById('logoutBtn').onclick = function () {
    showModal('로그아웃 하시겠습니까?', function () {
        fetch('/api/logout', { method: 'POST', credentials: 'include' })
          .then(res => {
              if (res.ok) {
                  window.location.href = '/login.html';
              } else {
                  showModal('로그아웃 실패');
              }
          })
          .catch(() => showModal('네트워크 오류가 발생했습니다.'));
    });
};

// 회원 탈퇴
document.getElementById('deleteBtn').onclick = function () {
    showFormModal("회원 탈퇴", [
        { id: 'password', type: 'password', placeholder: '비밀번호를 입력하세요' }
    ], (data) => {
        fetch('/api/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: data.password }),
            credentials: 'include'
        })
        .then(res => {
            if (res.ok) {
                showModal('회원 탈퇴가 완료되었습니다.', () => {
                    window.location.href = '/signup.html';
                });
            } else if (res.status === 401) {
                showModal('비밀번호가 일치하지 않습니다.');
            } else {
                showModal('회원 탈퇴에 실패');
            }
        })
        .catch(() => showModal('네트워크 오류가 발생했습니다.'));
    });
};