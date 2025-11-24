# from rest_framework.routers import DefaultRouter
# from django.urls import path, include

# from .views import (
#     LessonViewSet,
#     QuestionViewSet,
#     ActivityLogViewSet,
#     EditPermissionRequestViewSet,
#     SolicitudViewSet,  # Asegúrate de importar el ViewSet correcto
#     mark_lesson_completed,
#     LessonProgressViewSet,
# )

# router = DefaultRouter()
# router.register(r'lecciones', LessonViewSet, basename='lesson')
# router.register(r'preguntas', QuestionViewSet, basename='question')
# router.register(r'historial', ActivityLogViewSet, basename='historial')
# router.register(r'solicitudes', EditPermissionRequestViewSet, basename='solicitudes')
# router.register(r'solicitudes-edicion', SolicitudViewSet, basename='edit-request')  # Cambié EditRequestViewSet por SolicitudViewSet
# router.register('progreso', LessonProgressViewSet, basename='progreso')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('lecciones/<int:lesson_id>/completar/', mark_lesson_completed, name='lesson-completar'),
# ]



from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import (
    LessonViewSet,
    QuestionViewSet,
    ActivityLogViewSet,
    EditRequestViewSet,
    LessonProgressViewSet,
    mark_lesson_completed,
    general_statistics,
)

router = DefaultRouter()
router.register(r'lecciones', LessonViewSet, basename='lesson')
router.register(r'preguntas', QuestionViewSet, basename='question')
router.register(r'progreso', LessonProgressViewSet, basename='progress')
router.register(r'solicitudes', EditRequestViewSet, basename='edit-request')
router.register(r'historial', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('', include(router.urls)),
    path('lecciones/<int:lesson_id>/completar/', mark_lesson_completed, name='lesson-complete'),
    path('estadisticas/', general_statistics, name='general-stats'),
]