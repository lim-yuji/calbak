from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),  # 앱의 URL을 추가
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)  # 정적 파일 서빙
