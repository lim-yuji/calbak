
document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  // ——— grab modal elements (may be absent)
  const modal      = document.getElementById('event-modal');
  const closeBtn   = document.getElementById('modal-close');
  const eventList  = document.getElementById('event-list');
  const eventInput = document.getElementById('event-input');
  const addBtn     = document.getElementById('add-event-btn');
  let currentDate;

  function openModal(dateStr) {
    if (!modal) return;
    currentDate = dateStr;
    document.getElementById('modal-date').textContent = dateStr;
    eventList.innerHTML = '';
    calendar.getEvents()
      .filter(e => e.startStr.slice(0,10) === dateStr)
      .forEach(e => {
        const li  = document.createElement('li');
        const del = document.createElement('span');
        li.textContent = e.title;
        del.textContent = '🗑️';
        del.className = 'event-delete';
        del.onclick = () => {
          if (confirm('삭제하시겠습니까?')) {
            e.remove();
            openModal(currentDate);
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

  // only wire up these if they exist
  if (closeBtn)   closeBtn.onclick = closeModal;
  window.onclick   = e => { if (e.target === modal) closeModal(); };

  function addEvent() {
    const title = eventInput.value.trim();
    if (!title) return;
    calendar.addEvent({ title, start: currentDate, allDay: true });
    openModal(currentDate);
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

  // FullCalendar 초기화
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
    selectable: true,
    editable: true,
    dateClick: info => openModal(info.dateStr),
    events: [
      { title: '샘플 이벤트', start: new Date().toISOString().slice(0,10) }
    ]
  });

  calendar.render();
});