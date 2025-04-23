from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # 홈 페이지 경로
]