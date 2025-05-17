document.addEventListener('DOMContentLoaded', () => {
    // URL에서 친구 이름 가져오기
    const params = new URLSearchParams(window.location.search);
    const friendName = params.get('name') || '친구';

    // 친구 이름 표시
    const friendNameEl = document.getElementById('friend-name');
    friendNameEl.textContent = `${friendName}님의 일정`;

    // 예시 일정 데이터 (여러분은 서버에서 불러올 수 있음)
    const exampleSchedules = [
        { date: '2025-05-20', event: '점심 약속' },
        { date: '2025-05-22', event: '영화 보기' },
        { date: '2025-05-25', event: '생일 파티' },
    ];

    const calendarEl = document.getElementById('calendar');
    exampleSchedules.forEach(schedule => {
        const div = document.createElement('div');
        div.textContent = `${schedule.date}: ${schedule.event}`;
        div.className = 'schedule-item';
        calendarEl.appendChild(div);
    });

    // 뒤로가기 버튼
    const backBtn = document.getElementById('back-button');
    backBtn.addEventListener('click', () => {
        window.history.back();
    });
});
