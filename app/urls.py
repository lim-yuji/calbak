# app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    # path('google/login/',    views.google_login,    name='google_login'),
    # path('google/callback/', views.google_callback, name='google_callback'),
    path('calendar/', views.calendar_view, name='calendar'),
    path('calendar/events/add/', views.add_event, name='add_event'),
    path('google/calendar/events/', views.get_holiday_events, name='get_holiday_events'),
    path('mypage/', views.mypage, name='mypage'),
    path('mypage/profile_edit/', views.profile_edit, name='profile_edit'),
    path('friend_calendar/', views.friend_calendar, name='friend_calendar'),
]