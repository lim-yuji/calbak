document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  // 모달 요소
  const modal = document.getElementById('event-modal');
  const closeBtn = document.getElementById('modal-close');
  const eventList = document.getElementById('event-list');
  const eventInput = document.getElementById('event-input');
  const timeInputBtn = document.getElementById('time-input-btn'); // 시간 입력하기 버튼
  let addBtn = document.getElementById('add-event-btn');
  let currentStart, currentEnd;
  let isComposing = false;

  // 현재 calendar 인스턴스는 아래에서 초기화됨(선언전 사용 불가)
  let calendar;

  // 모달 열기 함수
  function openModal(startStr, endStr = null) {
    if (!modal) return;
    currentStart = startStr;
    currentEnd = endStr || startStr;

    // 날짜, 시간 정보 분리
    const startDate = currentStart.split('T')[0];
    const startTime = currentStart.includes('T') ? currentStart.split('T')[1].slice(0,5) : '00:00';

    const endDate = currentEnd.split('T')[0];
    const endTime = currentEnd.includes('T') ? currentEnd.split('T')[1].slice(0,5) : '23:59';

    // 날짜 표시 (범위 선택시 ~ 표시)
    document.getElementById('modal-date').textContent =
      (startDate !== endDate)
        ? `${startDate} ${startTime} ~ ${endDate} ${endTime}`
        : `${startDate} ${startTime} ~ ${endTime}`;

    // 일정 리스트 초기화 및 표시 (날짜 기준 필터링)
    eventList.innerHTML = '';
    calendar.getEvents()
      .filter(e => {
        if (!endStr || endStr === startStr) {
          // 단일 날짜 선택
          return e.startStr.slice(0,10) === startDate;
        } else {
          // 범위 선택
          return e.startStr >= currentStart && e.startStr <= currentEnd;
        }
      })
      .forEach(e => {
        const li = document.createElement('li');
        const del = document.createElement('span');
        li.textContent = e.title + (e.allDay ? ' (종일)' : ` (${formatTime(e.start)}~${formatTime(e.end)})`);
        del.textContent = '🗑️';
        del.className = 'event-delete';
        del.onclick = () => {
          if (confirm('삭제하시겠습니까?')) {
            e.remove();
            openModal(currentStart, currentEnd);
          }
        };
        li.prepend(del);
        eventList.appendChild(li);
      });

    eventInput.value = '';

    // 현재 뷰가 'dayGridMonth'면 시간 입력 버튼 보임, 아니면 숨김
    if (timeInputBtn) {
      if (calendar.view.type === 'dayGridMonth' && (!endStr || endStr === startStr)) {
        timeInputBtn.style.display = 'inline-block';
      } else {
        timeInputBtn.style.display = 'none';
      }
    }

    modal.classList.add('show');
    eventInput.focus();
  }

  // 시간 포맷팅 헬퍼 (Date 객체 → HH:mm)
  function formatTime(dateObj) {
    if (!dateObj) return '';
    const h = dateObj.getHours().toString().padStart(2, '0');
    const m = dateObj.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // 모달 닫기
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  window.onclick = e => { if (e.target === modal) closeModal(); };

  // 일정 추가 함수
  function addEvent() {
    if (isComposing) return;

    const title = eventInput.value.trim();
    if (!title) return;

    // 월간 뷰면 allDay 이벤트, 주간/일간 뷰면 시간 기반 이벤트 추가
    const isMonthView = calendar.view.type === 'dayGridMonth';

    calendar.addEvent({
      title,
      start: currentStart,
      end: currentEnd,
      allDay: isMonthView
    });

    openModal(currentStart, currentEnd);
  }

  if (addBtn) addBtn.onclick = addEvent;

  if (eventInput) {
    eventInput.addEventListener('compositionstart', () => { isComposing = true; });
    eventInput.addEventListener('compositionend', () => { isComposing = false; });
    eventInput.addEventListener('keydown', e => {
      if (isComposing) return;
      if (e.key === 'Enter') {
        addEvent();
        e.preventDefault();
      }
    });
  }

  // 시간 입력하기 버튼 클릭 → 주간 뷰로 변경, 선택 날짜 유지
  if (timeInputBtn) {
    timeInputBtn.addEventListener('click', () => {
      if (!currentStart) return;
      calendar.changeView('timeGridWeek', currentStart.split('T')[0]);
      closeModal();
    });
  }

  // ——— FullCalendar 초기화
  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'ko',
    eventSources: [{
      url: '/google/calendar/events/',
      color: '#ff6565',
      textColor: 'white'
    }],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    selectable: true,
    selectMirror: true,
    editable: true,

    // 기간 드래그 선택시
    select: info => {
      currentStart = info.startStr;
      currentEnd = info.endStr;

      // 주간, 일간 뷰에서는 시간까지 포함된 일정 추가용 모달 띄우기
      if (calendar.view.type === 'timeGridWeek' || calendar.view.type === 'timeGridDay') {
        openModal(currentStart, currentEnd);
      } else {
        // 월간 뷰는 단순 날짜 범위 선택 모달 띄우기
        openModal(info.startStr, info.endStr);
      }

      calendar.unselect();
    },

    // 단일 날짜 클릭 시
    dateClick: info => openModal(info.dateStr, info.dateStr),

    events: [
      { title: '샘플 이벤트', start: new Date().toISOString().slice(0,10) }
    ]
  });

  calendar.render();
});
