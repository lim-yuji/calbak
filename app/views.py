
import json
import datetime
import requests

from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, update_session_auth_hash
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
        # JSON 데이터를 받아옵니다.
        payload = json.loads(request.body)
        
        # 필요한 필드 확인 및 데이터베이스 저장
        title = payload.get('title')
        start = payload.get('start')
        end = payload.get('end', start)  # end가 없으면 start를 end로 설정

        if not title or not start:
            raise ValueError("Title and Start date are required.")

        # 새로운 이벤트 생성
        ev = Event.objects.create(
            title=title,
            start=start,
            end=end
        )
        
        # 성공적으로 저장되면 이벤트 정보를 반환
        return JsonResponse({'success': True, 'event': ev.as_dict()})
    
    except Exception as e:
        # 오류가 발생하면 오류 메시지 반환
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

@login_required
def profile_edit(request):
    """
    GET:  현재 이메일 보여주는 폼 렌더링
    POST: 이메일·비밀번호 변경 처리
    """
    user = request.user

    if request.method == 'POST':
        email    = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()

        # 이메일만 바꿀 때
        if email and email != user.email:
            user.email = email

        # 비밀번호만 바꿀 때
        if password:
            user.set_password(password)
            # 세션에 로그인 유지
            update_session_auth_hash(request, user)

        user.save()
        messages.success(request, '프로필이 성공적으로 업데이트되었습니다.')
        return redirect('profile_edit')

    # GET
    return render(request, 'app/profile_edit.html', {
        'user': user
    })


@login_required
def delete_account(request):
    """
    POST 요청으로만 처리
    """
    if request.method != 'POST':
        return HttpResponseBadRequest('잘못된 요청입니다.')

    # 현재 사용자 로그아웃 후 삭제
    user = request.user
    auth_logout(request)
    user.delete()

    messages.success(request, '회원 탈퇴가 완료되었습니다.')
    return redirect('home')


@login_required
def logout_view(request):
    auth_logout(request)
    messages.info(request, '로그아웃 되었습니다.')
    return redirect('home')