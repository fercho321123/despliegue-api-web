# # backend/chatbot/views.py
# from rest_framework import generics, permissions, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404

# from .models import Conversation, ChatMessage, Result
# from .serializers import ConversationSerializer, ChatMessageSerializer, ResultSerializer
# from ejercicios.models import Question, Lesson
# from .logic.responses import get_next_question_by_lesson, evaluate_answer
# from .services.openai_service import ask_openai, format_conversation_history

# import logging

# logger = logging.getLogger(__name__)


# class StartConversationView(generics.CreateAPIView):
#     """Iniciar una nueva conversación"""
#     serializer_class = ConversationSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(student=self.request.user)


# class SendMessageView(APIView):
#     """
#     Endpoint principal para enviar mensajes.
#     Maneja tanto respuestas a preguntas como consultas generales con OpenAI.
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         user = request.user
#         text = request.data.get('text', '').strip()
#         conv_id = request.data.get('conversation')
#         msg_type = request.data.get('type', 'query')  # 'answer' | 'query'
#         meta = request.data.get('meta', {}) or {}

#         if not text:
#             return Response(
#                 {"detail": "El mensaje no puede estar vacío."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         lesson_id = meta.get('lesson_id')
#         last_question_id = meta.get('question_id')

#         # =====================================================
#         # 🧩 Obtener o crear conversación
#         # =====================================================
#         if conv_id:
#             conversation = get_object_or_404(Conversation, id=conv_id, student=user)
#         else:
#             lesson = Lesson.objects.filter(id=lesson_id).first() if lesson_id else None
#             conversation = Conversation.objects.create(student=user, lesson=lesson)

#         # =====================================================
#         # 💬 Guardar mensaje del usuario
#         # =====================================================
#         user_msg = ChatMessage.objects.create(
#             conversation=conversation,
#             sender='user',
#             text=text,
#             metadata=meta
#         )

#         # =====================================================
#         # 🧠 Procesar mensaje según tipo
#         # =====================================================
#         bot_text = ""
#         bot_meta = {}
#         use_openai = False

#         # CASO 1: Usuario está respondiendo una pregunta
#         if msg_type == 'answer' and last_question_id:
#             question = get_object_or_404(Question, id=last_question_id)
#             result = evaluate_answer(question, text)
            
#             # Guardar resultado
#             Result.objects.create(
#                 student=user,
#                 question_id=question.id,
#                 sent_answer=text,
#                 correct=result['correct'],
#                 conversation=conversation
#             )
            
#             bot_text = result['feedback']
            
#             # Intentar obtener siguiente pregunta
#             if lesson_id:
#                 next_q = get_next_question_by_lesson(lesson_id, exclude_ids=[last_question_id])
#                 if next_q:
#                     bot_text += (
#                         f"\n\n📝 Siguiente pregunta:\n\n"
#                         f"{next_q.text}\n\n"
#                         f"A) {next_q.option_a}\n"
#                         f"B) {next_q.option_b}\n"
#                         f"C) {next_q.option_c}\n"
#                         f"D) {next_q.option_d}"
#                     )
#                     bot_meta = {'lesson_id': lesson_id, 'question_id': next_q.id}
#                 else:
#                     bot_text += "\n\n🎉 ¡Felicidades! Has completado todas las preguntas de esta lección."
#                     bot_text += "\n\n💬 Si tienes dudas sobre la lección, pregúntame lo que quieras."
#                     bot_meta = {'lesson_id': lesson_id, 'source': 'predefined'}

#         # CASO 2: Usuario hace una consulta/query
#         else:
#             # Si hay una lección activa, intentar primero con preguntas predefinidas
#             if lesson_id:
#                 lesson = Lesson.objects.filter(id=lesson_id).first()
#                 next_q = get_next_question_by_lesson(lesson_id)
                
#                 if next_q:
#                     # Hay preguntas disponibles en la lección
#                     bot_text = (
#                         f"📘 Vamos a practicar con la lección: *{lesson.title}*\n\n"
#                         f"{next_q.text}\n\n"
#                         f"A) {next_q.option_a}\n"
#                         f"B) {next_q.option_b}\n"
#                         f"C) {next_q.option_c}\n"
#                         f"D) {next_q.option_d}"
#                     )
#                     bot_meta = {'lesson_id': lesson_id, 'question_id': next_q.id}
#                 else:
#                     # No hay preguntas predefinidas -> usar OpenAI con contexto de lección
#                     use_openai = True
#                     lesson_context = {
#                         'title': lesson.title,
#                         'topic': lesson.topic,
#                         'description': lesson.description,
#                         'grade': lesson.grade
#                     } if lesson else None
#             else:
#                 # No hay lección activa -> consulta general con OpenAI
#                 use_openai = True
#                 lesson_context = None

#             # =====================================================
#             # 🤖 Usar OpenAI si es necesario
#             # =====================================================
#             if use_openai:
#                 logger.info(f"Usando OpenAI para responder a: {text[:50]}...")
                
#                 # Obtener historial reciente de la conversación
#                 recent_messages = conversation.messages.order_by('created_at')[-8:]
#                 conversation_history = format_conversation_history(recent_messages)
                
#                 # Llamar a OpenAI
#                 openai_response = ask_openai(
#                     user_message=text,
#                     conversation_history=conversation_history,
#                     lesson_context=lesson_context if lesson_id else None
#                 )
                
#                 if openai_response['success']:
#                     bot_text = openai_response['text']
#                     bot_meta = {
#                         'source': 'openai',
#                         'tokens_used': openai_response.get('tokens_used', 0)
#                     }
#                     if lesson_id:
#                         bot_meta['lesson_id'] = lesson_id
#                 else:
#                     # Fallback si OpenAI falla
#                     bot_text = (
#                         "Lo siento, estoy teniendo dificultades técnicas en este momento. "
#                         "Por favor, intenta reformular tu pregunta o contacta a tu profesor."
#                     )
#                     bot_meta = {'source': 'error', 'error': openai_response.get('error')}

#         # =====================================================
#         # 🤖 Guardar mensaje del bot
#         # =====================================================
#         bot_msg = ChatMessage.objects.create(
#             conversation=conversation,
#             sender='bot',
#             text=bot_text,
#             metadata=bot_meta
#         )

#         logger.info(f"Bot respondió: {bot_text[:100]}... (source: {bot_meta.get('source', 'predefined')})")

#         # =====================================================
#         # 📤 Responder al frontend
#         # =====================================================
#         return Response({
#             'conversation': ConversationSerializer(conversation).data,
#             'bot_message': ChatMessageSerializer(bot_msg).data
#         }, status=status.HTTP_200_OK)


# class ConversationHistoryView(generics.RetrieveAPIView):
#     """Obtener el historial de una conversación"""
#     queryset = Conversation.objects.all()
#     serializer_class = ConversationSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_object(self):
#         conv = super().get_object()
#         if conv.student != self.request.user and self.request.user.role != 'admin':
#             from rest_framework.exceptions import PermissionDenied
#             raise PermissionDenied("No puedes ver esta conversación.")
#         return conv


# class ConversationsByStudentView(generics.ListAPIView):
#     """Listar conversaciones del estudiante"""
#     serializer_class = ConversationSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'admin':
#             return Conversation.objects.all()
#         return Conversation.objects.filter(student=user)


# class ManualAnswerEvaluationView(generics.CreateAPIView):
#     """Evaluación manual de respuestas (opcional)"""
#     serializer_class = ResultSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(student=self.request.user)


# class StudentResultsView(APIView):
#     """Ver resultados de estudiantes (solo para profesores/admin)"""
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         if user.role not in ['teacher', 'admin']:
#             return Response({"detail": "No autorizado"}, status=403)

#         data = []
#         for result in Result.objects.select_related('student').all():
#             data.append({
#                 "estudiante": result.student.username,
#                 "pregunta_id": result.question_id,
#                 "correcta": result.correct,
#                 "fecha": result.date,
#             })
#         return Response(data)

# ============================================
# 📁 chatbot/views.py - MEJORADO Y OPTIMIZADO
# ============================================

from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.db import models
from django.utils import timezone
from datetime import timedelta
import time
import logging


from .models import Conversation, ChatMessage, Result, ConversationFeedback
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    ChatMessageSerializer,
    ResultSerializer,
    ConversationFeedbackSerializer,
    MessageRatingSerializer
)
from ejercicios.models import Question, Lesson
from .logic.responses import get_next_question_by_lesson, evaluate_answer
try:
    from .services.openai_client import ask_openai, format_conversation_history
except ImportError:
    # Funciones dummy temporales para poder hacer migraciones
    def ask_openai(user_message, system_prompt=None, conversation_history=None, 
                   lesson_context=None, student_grade=None):
        return {
            "text": "⚠️ OpenAI no configurado aún. Por favor, configura el servicio.",
            "success": False,
            "error": "Service not configured",
            "tokens_used": 0,
            "model": "none"
        }
    
    def format_conversation_history(messages_queryset):
        return []


logger = logging.getLogger(__name__)


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet completo para conversaciones"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Conversation.objects.all().select_related('student', 'lesson')
        elif user.role == 'teacher':
            # Teachers pueden ver conversaciones de sus lecciones
            return Conversation.objects.filter(
                Q(student=user) | Q(lesson__teacher=user)
            ).distinct().select_related('student', 'lesson')
        else:
            # Students solo ven las propias
            return Conversation.objects.filter(
                student=user
            ).select_related('lesson')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        """Crear conversación con título automático"""
        lesson = serializer.validated_data.get('lesson')
        title = f"Conversación {timezone.now().strftime('%d/%m/%Y %H:%M')}"
        
        if lesson:
            title = f"{lesson.title} - {timezone.now().strftime('%d/%m')}"
        
        serializer.save(student=self.request.user, title=title)
    
    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        """Cerrar/finalizar una conversación"""
        conversation = self.get_object()
        conversation.is_active = False
        conversation.save()
        
        return Response({
            'message': 'Conversación cerrada',
            'conversation': ConversationSerializer(conversation).data
        })
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Agregar feedback a la conversación"""
        conversation = self.get_object()
        serializer = ConversationFeedbackSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(conversation=conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Estadísticas del estudiante"""
        user = request.user
        
        conversations = Conversation.objects.filter(student=user)
        total_messages = ChatMessage.objects.filter(
            conversation__student=user,
            sender='user'
        ).count()
        
        results = Result.objects.filter(student=user)
        
        stats = {
            'total_conversations': conversations.count(),
            'active_conversations': conversations.filter(is_active=True).count(),
            'total_messages': total_messages,
            'total_questions_answered': results.count(),
            'correct_answers': results.filter(correct=True).count(),
            'accuracy': round(
                (results.filter(correct=True).count() / results.count() * 100) 
                if results.count() > 0 else 0,
                1
            ),
            'avg_response_time': results.aggregate(
                avg=Avg('time_taken_seconds')
            )['avg'] or 0,
        }
        
        return Response(stats)

class SendMessageView(APIView):
    """
    Endpoint principal mejorado para enviar mensajes.
    Maneja tanto respuestas a preguntas como consultas con IA.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        start_time = time.time()
        
        user = request.user
        text = request.data.get('text', '').strip()
        conv_id = request.data.get('conversation')
        msg_type = request.data.get('type', 'query')  # 'answer' | 'query'
        meta = request.data.get('meta', {}) or {}

        # Validaciones
        if not text:
            return Response(
                {"detail": "El mensaje no puede estar vacío."},
                status=status.HTTP_400_BAD_REQUEST
            )

        lesson_id = meta.get('lesson_id')
        last_question_id = meta.get('question_id')

        # =====================================================
        # 🧩 Obtener o crear conversación
        # =====================================================
        if conv_id:
            conversation = get_object_or_404(
                Conversation, 
                id=conv_id, 
                student=user
            )
        else:
            lesson = Lesson.objects.filter(id=lesson_id).first() if lesson_id else None
            mode = request.data.get('mode', 'mixed')
            
            title = f"Conversación {timezone.now().strftime('%d/%m/%Y %H:%M')}"
            if lesson:
                title = f"{lesson.title} - {timezone.now().strftime('%d/%m')}"
            
            conversation = Conversation.objects.create(
                student=user,
                lesson=lesson,
                mode=mode,
                title=title
            )
            
            logger.info(f"📝 Nueva conversación creada: {conversation.id}")

        # =====================================================
        # 💬 Guardar mensaje del usuario
        # =====================================================
        user_msg = ChatMessage.objects.create(
            conversation=conversation,
            sender='user',
            text=text,
            metadata=meta
        )

        # =====================================================
        # 🧠 Procesar mensaje según tipo
        # =====================================================
        bot_text = ""
        bot_meta = {}
        use_openai = False
        is_correct = None

        # CASO 1: Usuario está respondiendo una pregunta
        if msg_type == 'answer' and last_question_id:
            question = get_object_or_404(Question, id=last_question_id)
            result = evaluate_answer(question, text)
            is_correct = result['correct']
            
            # Guardar resultado
            Result.objects.create(
                student=user,
                question=question,
                sent_answer=text,
                correct=is_correct,
                conversation=conversation,
                time_taken_seconds=meta.get('time_taken', 0)
            )
            
            # Actualizar estadísticas de conversación
            conversation.update_stats(is_correct)
            
            bot_text = result['feedback']
            bot_meta = {'source': 'evaluation', 'question_id': last_question_id}
            
            # Intentar obtener siguiente pregunta
            if lesson_id:
                next_q = get_next_question_by_lesson(
                    lesson_id, 
                    exclude_ids=[last_question_id]
                )
                
                if next_q:
                    bot_text += self._format_question(next_q)
                    bot_meta.update({
                        'lesson_id': lesson_id,
                        'question_id': next_q.id,
                        'has_next': True
                    })
                else:
                    bot_text += (
                        f"\n\n🎉 ¡Felicidades! Has completado todas las preguntas.\n"
                        f"📊 Resultado: {conversation.correct_answers}/{conversation.total_questions} correctas "
                        f"({conversation.accuracy}%)\n\n"
                        f"💬 ¿Tienes alguna duda sobre la lección?"
                    )
                    bot_meta.update({
                        'lesson_id': lesson_id,
                        'source': 'completion',
                        'has_next': False
                    })

        # CASO 2: Usuario hace una consulta/query
        else:
            if conversation.mode == 'practice' and lesson_id:
                next_q = get_next_question_by_lesson(lesson_id)
                
                if next_q:
                    lesson = conversation.lesson
                    bot_text = (
                        f"📘 Practicando: *{lesson.title}*\n\n"
                        f"{self._format_question(next_q)}"
                    )
                    bot_meta = {
                        'source': 'predefined',
                        'lesson_id': lesson_id,
                        'question_id': next_q.id
                    }
                else:
                    bot_text = "No hay más preguntas disponibles en esta lección."
                    bot_meta = {'source': 'none'}
            
            elif conversation.mode == 'tutor':
                use_openai = True
            
            else:  # mixed
                if lesson_id:
                    next_q = get_next_question_by_lesson(lesson_id)
                    
                    if next_q:
                        lesson = conversation.lesson
                        bot_text = (
                            f"📘 Vamos a practicar: *{lesson.title}*\n\n"
                            f"{self._format_question(next_q)}"
                        )
                        bot_meta = {
                            'source': 'predefined',
                            'lesson_id': lesson_id,
                            'question_id': next_q.id
                        }
                    else:
                        use_openai = True
                else:
                    use_openai = True

            if use_openai:
                logger.info(f"🤖 Usando OpenAI para: {text[:50]}...")
                
                recent_messages_qs = conversation.messages.order_by('-created_at')[:10]
                recent_messages = list(recent_messages_qs)
                recent_messages.reverse()
                
                conversation_history = format_conversation_history(recent_messages)
                
                lesson_context = None
                if conversation.lesson:
                    lesson = conversation.lesson
                    lesson_context = {
                        'title': lesson.title,
                        'topic': lesson.topic,
                        'description': lesson.description,
                        'grade': lesson.get_grade_display()
                    }
                
                openai_response = ask_openai(
                    user_message=text,
                    conversation_history=conversation_history,
                    lesson_context=lesson_context,
                    student_grade=user.grade
                )
                
                if openai_response['success']:
                    bot_text = openai_response['text']
                    bot_meta = {
                        'source': 'openai',
                        'tokens_used': openai_response.get('tokens_used', 0),
                        'model': openai_response.get('model', 'unknown')
                    }
                    if lesson_id:
                        bot_meta['lesson_id'] = lesson_id
                else:
                    bot_text = (
                        "😔 Lo siento, estoy teniendo dificultades técnicas. "
                        "Por favor, intenta de nuevo o contacta a tu profesor."
                    )
                    bot_meta = {
                        'source': 'error',
                        'error': openai_response.get('error')
                    }

        # =====================================================
        # ✔️ NUEVO: análisis de si el usuario hizo una pregunta
        # =====================================================
        if "pregunta" in text.lower() or "?" in text:
            bot_meta['contains_question'] = True
            bot_meta['question_intent'] = self._detect_question_intent(text)

        # =====================================================
        # 🤖 Guardar mensaje del bot
        # =====================================================
        response_time = int((time.time() - start_time) * 1000)
        
        bot_msg = ChatMessage.objects.create(
            conversation=conversation,
            sender='bot',
            text=bot_text,
            metadata=bot_meta,
            tokens_used=bot_meta.get('tokens_used', 0),
            response_time_ms=response_time
        )

        logger.info(
            f"✅ Respuesta enviada en {response_time}ms "
            f"(source: {bot_meta.get('source', 'unknown')})"
        )

        return Response({
            'conversation_id': conversation.id,
            'user_message': ChatMessageSerializer(user_msg).data,
            'bot_message': ChatMessageSerializer(bot_msg).data,
            'conversation_stats': {
                'total_questions': conversation.total_questions,
                'correct_answers': conversation.correct_answers,
                'accuracy': conversation.accuracy
            }
        }, status=status.HTTP_200_OK)

    def _format_question(self, question):
        return (
            f"{question.text}\n\n"
            f"A) {question.option_a}\n"
            f"B) {question.option_b}\n"
            f"C) {question.option_c}\n"
            f"D) {question.option_d}"
        )

    def _detect_question_intent(self, text):
        """Detectar el tipo de pregunta"""
        text = text.lower()
        if any(word in text for word in ['ejemplo', 'ejempo']):
            return 'example_request'
        elif any(word in text for word in ['explicar', 'explica', 'qué es']):
            return 'explanation_request'
        elif any(word in text for word in ['cómo', 'como']):
            return 'how_to_request'
        return 'general_question'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_message(request):
    """Calificar un mensaje del bot"""
    serializer = MessageRatingSerializer(data=request.data)
    
    if serializer.is_valid():
        message_id = serializer.validated_data['message_id']
        rating = serializer.validated_data['rating']
        
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                conversation__student=request.user
            )
            message.rating = rating
            message.save()
            
            return Response({
                'message': 'Calificación guardada',
                'rating': rating
            })
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensaje no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_results(request):
    """Ver resultados propios o de estudiantes (teachers/admin)"""
    user = request.user
    student_id = request.query_params.get('student_id')
    
    if user.role == 'student':
        # Estudiantes solo ven sus resultados
        results = Result.objects.filter(student=user).select_related('question', 'question__lesson')
    elif user.role in ['teacher', 'admin']:
        # Teachers/admin pueden ver de otros estudiantes
        if student_id:
            results = Result.objects.filter(student_id=student_id).select_related('question', 'question__lesson')
        else:
            # Ver todos los resultados
            results = Result.objects.all().select_related('student', 'question', 'question__lesson')
    else:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_analytics(request):
    """Analíticas generales del sistema (admin/teacher)"""
    user = request.user
    
    if user.role not in ['admin', 'teacher']:
        return Response(
            {'error': 'No autorizado'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Filtrar por teacher si no es admin
    if user.role == 'teacher':
        conversations = Conversation.objects.filter(lesson__teacher=user)
    else:
        conversations = Conversation.objects.all()
    
    analytics = {
        'total_conversations': conversations.count(),
        'active_conversations': conversations.filter(is_active=True).count(),
        'total_messages': ChatMessage.objects.filter(
            conversation__in=conversations
        ).count(),
        'avg_messages_per_conversation': ChatMessage.objects.filter(
            conversation__in=conversations
        ).count() / max(conversations.count(), 1),
        'total_questions_answered': Result.objects.filter(
            conversation__in=conversations
        ).count(),
        'overall_accuracy': round(
            Result.objects.filter(
                conversation__in=conversations,
                correct=True
            ).count() / max(
                Result.objects.filter(conversation__in=conversations).count(), 1
            ) * 100,
            1
        ),
        'avg_response_time_ms': ChatMessage.objects.filter(
            conversation__in=conversations,
            sender='bot'
        ).aggregate(avg=Avg('response_time_ms'))['avg'] or 0,
        'total_ai_tokens': ChatMessage.objects.filter(
            conversation__in=conversations,
            sender='bot'
        ).aggregate(total=models.Sum('tokens_used'))['total'] or 0,
    }
    
    return Response(analytics)