
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),

    # Endpoints de la API
    path('api/usuarios/', include('usuarios.urls')),     # User management
    path('api/ejercicios/', include('ejercicios.urls')), # Exercises
    path('api/chatbot/', include('chatbot.urls')),       # Chatbot 
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)