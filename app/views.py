
import json
import datetime
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import service_account
from googleapiclient.discovery import build
from .models import Event
from django.views.decorators.http import require_POST

# Google Calendar API 클라이언트 생성
def get_calendar_service():
    creds = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_SERVICE_ACCOUNT_FILE,
        scopes=settings.GOOGLE_SCOPES
    )
    return build('calendar', 'v3', credentials=creds)

# 홈 페이지 렌더링
def home(request):
    return render(request, 'app/home.html')

# 캘린더 페이지 렌더링
def calendar_view(request):
    return render(request, 'app/calendar.html')

def get_google_events(request):
    data = []
    service = get_calendar_service()
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    start = request.GET.get('start', now)
    end = request.GET.get('end', None)

    try:
        # Google Calendar에서 이벤트 가져오기
        params = dict(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            timeMin=start,
            maxResults=250,
            singleEvents=True,
            orderBy='startTime'
        )
        if end:
            params['timeMax'] = end
        items = service.events().list(**params).execute().get('items', [])
        for e in items:
            data.append({
                'id': e.get('id'),
                'title': e.get('summary', 'No Title'),
                'start': e['start'].get('dateTime', e['start'].get('date')),
                'end': e['end'].get('dateTime', e['end'].get('date'))
            })
    except Exception as e:
        print(f"Error fetching Google calendar events: {e}")

    # DB에 저장된 이벤트 가져오기
    for ev in Event.objects.all():
        data.append(ev.as_dict())

    return JsonResponse(data, safe=False)

# 일정 추가 API
@csrf_exempt
@require_POST
def add_event(request):
    if request.method != 'POST':
        return HttpResponseBadRequest(json.dumps({'success': False, 'error': 'Invalid method'}), content_type='application/json')
    try:
        payload = json.loads(request.body)
        ev = Event.objects.create(
            title=payload['title'],
            start=payload['start'],
            end=payload.get('end', payload['start'])
        )
        return JsonResponse({'success': True, 'event': ev.as_dict()})
    except Exception as e:
        return HttpResponseBadRequest(json.dumps({'success': False, 'error': str(e)}), content_type='application/json')

