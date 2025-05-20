document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  fetch(form.action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('회원가입 성공');
      window.location.href = '/';
    } else {
      console.error('회원가입 실패:', data.error);
      alert('회원가입 실패: ' + (data.error || '알 수 없는 오류'));
    }
  })
  .catch(err => {
    console.error('네트워크 또는 서버 에러:', err);
    alert('서버 오류가 발생했습니다.');
  });
});