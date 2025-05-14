document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  // FullCalendar 초기화
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'ko',
    eventSources: [
      {
        url: '/google/calendar/events/',  // 서버에서 이벤트 데이터를 가져옵니다.
        color: '#ff6565',  // 색상
        textColor: 'white'
      }
    ],
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