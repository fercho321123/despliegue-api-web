

# chatbot/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ConversationViewSet,
    SendMessageView,
    rate_message,
    student_results,
    conversation_analytics,
)

# Router para ViewSets
router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    # ViewSets (incluye CRUD automático para conversaciones)
    path('', include(router.urls)),
    
    # Endpoints funcionales
    path('send/', SendMessageView.as_view(), name='send-message'),
    path('rate/', rate_message, name='rate-message'),
    path('results/', student_results, name='student-results'),
    path('analytics/', conversation_analytics, name='conversation-analytics'),
]