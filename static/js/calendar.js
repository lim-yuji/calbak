document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  // ——— grab modal elements
  const modal      = document.getElementById('event-modal');
  const closeBtn   = document.getElementById('modal-close');
  const eventList  = document.getElementById('event-list');
  const eventInput = document.getElementById('event-input');
  let addBtn       = document.getElementById('add-event-btn');
  let currentStart, currentEnd;   // 기간을 저장

  function openModal(startStr, endStr = null) {
    if (!modal) return;
    currentStart = startStr;
    currentEnd   = endStr || startStr;
    // 시작~종료 또는 단일일 표시
    document.getElementById('modal-date').textContent =
      endStr
        ? `${startStr} ~ ${endStr}`
        : startStr;

    eventList.innerHTML = '';
    calendar.getEvents()
      .filter(e =>
        // 선택된 기간 안에 들어오는 이벤트 모두 표시
        e.startStr.slice(0,10) >= startStr &&
        e.startStr.slice(0,10) <  endStr
      )
      .forEach(e => {
        const li  = document.createElement('li');
        const del = document.createElement('span');
        li.textContent = e.title;
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
    modal.classList.add('show');
    eventInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
  }

  if (closeBtn)   closeBtn.onclick = closeModal;
  window.onclick   = e => { if (e.target === modal) closeModal(); };

  function addEvent() {
    const title = eventInput.value.trim();
    if (!title) return;
    calendar.addEvent({
      title: title,
      start: currentStart,
      end:   currentEnd,
      allDay: true
    });
    openModal(currentStart, currentEnd);
  }

  if (addBtn) addBtn.onclick = addEvent;
  if (eventInput) {
    eventInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        addEvent();
        e.preventDefault();
      }
    });
  }

  // ——— FullCalendar 초기화
  const calendar = new FullCalendar.Calendar(calendarEl, {
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
    selectable: true,       // 드래그 선택 허용
    selectMirror: true,     // 드래그 중 블록 미리보기
    editable: true,

    // 드래그로 기간 선택했을 때 모달 띄우기
    select: info => {
      openModal(info.startStr, info.endStr);
      calendar.unselect();
    },

    // 단일일 클릭했을 때(기간 선택과 구분)
    dateClick: info => openModal(info.dateStr, info.dateStr),

    events: [
      { title: '샘플 이벤트', start: new Date().toISOString().slice(0,10) }
    ]
  });

  calendar.render();
});