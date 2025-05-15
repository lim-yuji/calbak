# app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # OAuth
    path('', views.home, name='home'),  # 홈 페이지 경로
    #path('google/login/',    views.google_login,    name='google_login'),
    #path('google/callback/', views.google_callback, name='google_callback'),
    # 캘린더 페이지
    path('calendar/', views.calendar_view, name='calendar'),
    path('calendar/events/add/', views.add_event, name='add_event'),
    path('google/calendar/events/', views.get_holiday_events, name='get_holiday_events'),

]