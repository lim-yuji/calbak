
import json
import datetime
import requests

from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login
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
    events = Event.objects.all() 
    return render(request, 'app/calendar.html', {'events': events})

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
@require_POST
def add_event(request):
    try:
        payload = json.loads(request.body.decode('utf-8'))
        
        title = payload.get('title')
        start = payload.get('start')
        end = payload.get('end', start)

        if not title or not start:
            raise ValueError("Title and Start date are required.")

        ev = Event.objects.create(
            title=title,   # 변수 사용
            start=start,
            end=end
        )
        
        return JsonResponse({'success': True, 'event': ev.as_dict()})
    
    except Exception as e:
        return HttpResponseBadRequest(json.dumps({'success': False, 'error': str(e)}), content_type='application/json')

# 마이 페이지
def mypage(request):
    return render(request, 'app/mypage.html')

# 프로필 수정
def profile_edit(request):
    return render(request, 'app/profile_edit.html')

# 친구의 캘린더 보기
def friend_calendar(request):
    return render(request, 'app/friend_calendar.html')

# 로그인
@csrf_exempt  # 개발 중에만, 실제론 CSRF 토큰 처리 필요
def login(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'error': '잘못된 JSON 데이터입니다.'}, status=400)
            email = data.get('email')
            password = data.get('password')
        else:
            email = request.POST.get('email')
            password = request.POST.get('password')

        if not email or not password:
            return JsonResponse({'success': False, 'error': '이메일과 비밀번호를 입력하세요.'}, status=400)

        user = authenticate(request, username=email, password=password)
        if user is not None:
            auth_login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': '로그인 실패. 아이디 또는 비밀번호를 확인하세요.'}, status=401)

    return render(request, 'app/login.html')


# 회원가입
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()
            password = data.get('password')
            password_confirm = data.get('password_confirm')
            name = data.get('name')

            if not email:
                return JsonResponse({'success': False, 'error': '이메일을 입력하세요.'})

            if password != password_confirm:
                return JsonResponse({'success': False, 'error': '비밀번호가 일치하지 않습니다.'})

            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': '이미 가입된 이메일입니다.'})

            user = User.objects.create_user(username=email, email=email, password=password)
            user.first_name = name 
            user.save()

            return JsonResponse({'success': True})

        except json.JSONDecodeError:
            return HttpResponseBadRequest('잘못된 요청입니다.')

    return render(request, 'app/signup.html')