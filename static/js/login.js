document.querySelector('.login__form').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  fetch(form.action || '/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error('로그인 실패');
    return res.json();
  })
  .then(data => {
    if (data.success) {
      console.log('로그인 성공');
      window.location.href = '/';
    } else {
      alert('로그인 실패: ' + (data.error || '알 수 없는 오류'));
    }
  })
  .catch(err => {
    alert('서버 에러가 발생했습니다.');
    console.error(err);
  });
});
