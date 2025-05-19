
import json
import datetime
import requests

from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import service_account
from googleapiclient.discovery import build
from .models import Event
from django.views.decorators.http import require_POST
from urllib.parse import quote

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

# 로그인 페이지 렌더링
def login_view(request):
    return render(request, 'app/login.html')

def get_holiday_events(request):
    start = request.GET.get('start', datetime.datetime.utcnow().isoformat() + 'Z')
    end = request.GET.get('end')
    calendar_id = quote(settings.HOLIDAY_CALENDAR_ID, safe='')

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    params = {
        'key': settings.GOOGLE_API_KEY,  # API 키만 넣음
        'timeMin': start,
        'singleEvents': 'true',
        'orderBy': 'startTime',
        'maxResults': 250,
    }
    if end:
        params['timeMax'] = end

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch holiday events'}, status=500)

    items = response.json().get('items', [])

    data = []
    for h in items:
        data.append({
            'id': h.get('id'),
            'title': h.get('summary'),
            'start': h['start'].get('date'),
            'end': h['start'].get('date'),
            'color': '#ff5757'
        })

    # DB에 저장된 개인 이벤트가 있으면 추가 (선택 사항)
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

