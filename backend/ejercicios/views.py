
# from datetime import timedelta
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from rest_framework import viewsets, permissions, status
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.exceptions import PermissionDenied
# from rest_framework.permissions import IsAuthenticated

# from .models import (
#     Lesson,
#     Question,
#     ActivityLog,
#     EditPermissionRequest,
#     LessonProgress,
#     EditRequest,  # ✅ Asegúrate de importar este modelo
# )
# from .serializers import (
#     LessonSerializer,
#     QuestionSerializer,
#     ActivityLogSerializer,
#     EditPermissionRequestSerializer,
#     LessonProgressSerializer,
#     EditRequestSerializer  # ✅ Cambié SolicitudSerializer por EditRequestSerializer
# )

# # =====================================================
# # 🟢 LESSON VIEWSET
# # =====================================================
# class LessonViewSet(viewsets.ModelViewSet):
#     queryset = Lesson.objects.select_related('teacher').prefetch_related('questions').all()
#     serializer_class = LessonSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def has_temp_permission(self, user, lesson, action_type):
#         now = timezone.now()
#         return EditPermissionRequest.objects.filter(
#             teacher=user,
#             lesson=lesson,
#             action_type=action_type,
#             approved=True,
#             approved_until__gte=now
#         ).exists()

#     def perform_create(self, serializer):
#         lesson = serializer.save(teacher=self.request.user)
#         ActivityLog.objects.create(
#             user=self.request.user,
#             model_name='Lesson',
#             object_id=lesson.id,
#             action='create',
#             description=f'Creó la lección "{lesson.title}".'
#         )

#     def perform_update(self, serializer):
#         lesson = self.get_object()
#         user = self.request.user

#         if getattr(user, 'role', None) == 'teacher' and lesson.teacher != user:
#             if not self.has_temp_permission(user, lesson, 'edit'):
#                 raise PermissionDenied("❌ No puedes editar esta lección sin permiso temporal.")

#         updated = serializer.save()
#         ActivityLog.objects.create(
#             user=user,
#             model_name='Lesson',
#             object_id=updated.id,
#             action='update',
#             description=f'Modificó la lección "{updated.title}".'
#         )

#     def perform_destroy(self, instance):
#         user = self.request.user
#         if getattr(user, 'role', None) == 'teacher' and instance.teacher != user:
#             if not self.has_temp_permission(user, instance, 'delete'):
#                 raise PermissionDenied("❌ No puedes eliminar esta lección sin permiso temporal.")

#         ActivityLog.objects.create(
#             user=user,
#             model_name='Lesson',
#             object_id=instance.id,
#             action='delete',
#             description=f'Eliminó la lección "{instance.title}".'
#         )
#         instance.delete()


# # =====================================================
# # 🟡 QUESTION VIEWSET
# # =====================================================
# class QuestionViewSet(viewsets.ModelViewSet):
#     queryset = Question.objects.select_related('lesson', 'lesson__teacher').all()
#     serializer_class = QuestionSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def has_temp_permission(self, user, question, action_type):
#         now = timezone.now()
#         return EditPermissionRequest.objects.filter(
#             teacher=user,
#             question=question,
#             action_type=action_type,
#             approved=True,
#             approved_until__gte=now
#         ).exists()

#     def get_queryset(self):
#         user = self.request.user
#         qs = Question.objects.select_related('lesson', 'lesson__teacher')

#         if getattr(user, 'role', None) == 'admin':
#             return qs
#         elif getattr(user, 'role', None) == 'teacher':
#             return qs
#         elif hasattr(user, 'grade') and user.grade:
#             return qs.filter(lesson__grade=user.grade)
#         return Question.objects.none()

#     def perform_create(self, serializer):
#         question = serializer.save()
#         ActivityLog.objects.create(
#             user=self.request.user,
#             model_name='Question',
#             object_id=question.id,
#             action='create',
#             description=f'Creó una pregunta en la lección "{question.lesson.title}".'
#         )

#     def perform_update(self, serializer):
#         question = self.get_object()
#         user = self.request.user

#         if getattr(user, 'role', None) == 'teacher' and question.lesson.teacher != user:
#             if not self.has_temp_permission(user, question, 'edit'):
#                 raise PermissionDenied("❌ No puedes modificar esta pregunta sin permiso temporal.")

#         updated_question = serializer.save()
#         ActivityLog.objects.create(
#             user=user,
#             model_name='Question',
#             object_id=updated_question.id,
#             action='update',
#             description=f'Modificó la pregunta "{updated_question.text}".'
#         )

#     def perform_destroy(self, instance):
#         user = self.request.user
#         if getattr(user, 'role', None) == 'teacher' and instance.lesson.teacher != user:
#             if not self.has_temp_permission(user, instance, 'delete'):
#                 raise PermissionDenied("❌ No puedes eliminar esta pregunta sin permiso temporal.")

#         ActivityLog.objects.create(
#             user=user,
#             model_name='Question',
#             object_id=instance.id,
#             action='delete',
#             description=f'Eliminó la pregunta "{instance.text}".'
#         )
#         instance.delete()


# # =====================================================
# # 🔵 ACTIVITY LOG VIEWSET
# # =====================================================
# class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = ActivityLog.objects.select_related('user').order_by('-timestamp')
#     serializer_class = ActivityLogSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if hasattr(user, 'role') and user.role == 'admin':
#             return self.queryset
#         return ActivityLog.objects.none()


# # =====================================================
# # 🟣 EDIT PERMISSION REQUEST VIEWSET
# # =====================================================
# class EditPermissionRequestViewSet(viewsets.ModelViewSet):
#     queryset = EditPermissionRequest.objects.select_related('teacher', 'question', 'lesson').all()
#     serializer_class = EditPermissionRequestSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if hasattr(user, 'role') and user.role == 'admin':
#             return self.queryset
#         return self.queryset.filter(teacher=user)


# class SolicitudViewSet(viewsets.ModelViewSet):
#     queryset = EditRequest.objects.select_related('user', 'lesson', 'question').all()
#     serializer_class = EditRequestSerializer
#     permission_classes = [IsAuthenticated]

#     def create(self, request, *args, **kwargs):
#         # Simplificamos: el serializer hace la validación (lesson o question)
#         data = request.data.copy()
#         # si no se pasa description, generamos una por defecto
#         description = data.get("description")
#         if not description:
#             action_type = data.get("action_type", "edit")
#             q = data.get("question")
#             l = data.get("lesson")
#             description = f"Acción '{action_type}' sobre " + (f"la pregunta {q}" if q else f"la lección {l}" if l else "elemento desconocido")
#             data['description'] = description

#         serializer = self.get_serializer(data=data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(user=request.user)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     def update(self, request, *args, **kwargs):
#         """Actualizar el estado de la solicitud (aprobada o rechazada)"""
#         edit_request = self.get_object()
#         new_status = request.data.get('status')

#         if new_status not in ['approved', 'rejected']:
#             return Response({"detail": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

#         edit_request.status = new_status
#         edit_request.response_time = timezone.now()
#         edit_request.save()

#         return Response(EditRequestSerializer(edit_request).data, status=status.HTTP_200_OK)

#     # def create(self, request, *args, **kwargs):
#     #     print("📩 Datos recibidos en backend:", request.data)

#     #     action_type = request.data.get("action_type")
#     #     question_id = request.data.get("question")
#     #     lesson_id = request.data.get("lesson")

#     #     if not action_type:
#     #         return Response(
#     #             {"detail": "Debes indicar el tipo de acción ('edit' o 'delete')."},
#     #             status=status.HTTP_400_BAD_REQUEST,
#     #         )

#     #     if not question_id and not lesson_id:
#     #         return Response(
#     #             {"detail": "Debes proporcionar 'question' o 'lesson'."},
#     #             status=status.HTTP_400_BAD_REQUEST,
#     #         )

#     #     # Descripción por defecto si no se envía desde el frontend
#     #     description = request.data.get(
#     #         "description",
#     #         f"Acción '{action_type}' sobre "
#     #         + (f"la pregunta {question_id}" if question_id else f"la lección {lesson_id}")
#     #     )

#     #     # Validación adicional para lesson o question
#     #     if lesson_id:
#     #         try:
#     #             lesson = Lesson.objects.get(id=lesson_id)
#     #         except Lesson.DoesNotExist:
#     #             return Response(
#     #                 {"detail": f"La lección con ID {lesson_id} no existe."},
#     #                 status=status.HTTP_400_BAD_REQUEST,
#     #             )
#     #     if question_id:
#     #         try:
#     #             question = Question.objects.get(id=question_id)
#     #         except Question.DoesNotExist:
#     #             return Response(
#     #                 {"detail": f"La pregunta con ID {question_id} no existe."},
#     #                 status=status.HTTP_400_BAD_REQUEST,
#     #             )

#     #     # Serialización y guardado
#     #     serializer = self.get_serializer(data=request.data)
#     #     serializer.is_valid(raise_exception=True)
#     #     serializer.save(user=request.user, description=description)

#     #     return Response(serializer.data, status=status.HTTP_201_CREATED)

#     def update(self, request, *args, **kwargs):
#         """Actualizar el estado de la solicitud (aprobada o rechazada)"""
#         edit_request = self.get_object()
#         status = request.data.get('status')

#         if status not in ['approved', 'rejected']:
#             return Response({"detail": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

#         # Actualiza el estado de la solicitud
#         edit_request.status = status
#         edit_request.response_time = timezone.now()  # Guarda el tiempo de respuesta
#         edit_request.save()

#         return Response(EditRequestSerializer(edit_request).data, status=status.HTTP_200_OK)

# # =====================================================
# # 🔹 Endpoint para marcar lección como completada
# # =====================================================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def mark_lesson_completed(request, lesson_id):
#     lesson = get_object_or_404(Lesson, id=lesson_id)
#     progress, created = LessonProgress.objects.get_or_create(
#         student=request.user, lesson=lesson
#     )
#     progress.completed = True
#     progress.completed_at = timezone.now()
#     progress.save()

#     ActivityLog.objects.create(
#         user=request.user,
#         model_name='LessonProgress',
#         object_id=progress.id,
#         action='update' if not created else 'create',
#         description=f'{request.user.username} marcó la lección "{lesson.title}" como leída.'
#     )

#     return Response({"detail": "Lección marcada como completada ✅"}, status=status.HTTP_200_OK)


# # =====================================================
# # 🔹 LessonProgress ViewSet
# # =====================================================
# class LessonProgressViewSet(viewsets.ModelViewSet):
#     serializer_class = LessonProgressSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if getattr(user, 'role', None) in ['admin', 'teacher']:
#             return LessonProgress.objects.select_related('student', 'lesson').order_by('-completed_at')
#         return LessonProgress.objects.filter(student=user).select_related('lesson')

#     def perform_create(self, serializer):
#         serializer.save(student=self.request.user, completed=True, completed_at=timezone.now())




from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Q, Avg
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
import logging

from .models import (
    Lesson,
    Question,
    ActivityLog,
    LessonProgress,
    EditRequest,
)
from .serializers import (
    LessonSerializer,
    QuestionSerializer,
    ActivityLogSerializer,
    LessonProgressSerializer,
    EditRequestSerializer
  
)
from .permissions import (
    IsAdminUser,
    IsTeacherUser,
    IsTeacherOrAdmin,
    IsOwnerOrAdmin,
    
)

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Obtener IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_activity(user, model_name, object_id, action, description, request=None):
    """Helper para crear logs de actividad"""
    ip_address = get_client_ip(request) if request else None
    ActivityLog.objects.create(
        user=user,
        model_name=model_name,
        object_id=object_id,
        action=action,
        description=description,
        ip_address=ip_address
    )


# =====================================================
# 🟢 LESSON VIEWSET
# =====================================================
class LessonViewSet(viewsets.ModelViewSet):
    """CRUD de lecciones"""
    queryset = Lesson.objects.select_related('teacher').prefetch_related('questions').all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'topic', 'teacher__username']
    ordering_fields = ['created_at', 'title', 'grade']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar por rol y grado"""
        user = self.request.user
        queryset = Lesson.objects.select_related('teacher').prefetch_related('questions')

        # Admin ve todo
        if user.role == 'admin':
            return queryset.all()

        # Teacher ve sus lecciones y las activas
        if user.role == 'teacher':
            return queryset.filter(
                Q(teacher=user) | Q(is_active=True)
            ).distinct()

        # Student ve solo las de su grado
        if user.role == 'student' and user.grade:
            return queryset.filter(grade=user.grade, is_active=True)

        return Lesson.objects.none()

    def get_permissions(self):
        """Permisos según la acción"""
        if self.action in ['create']:
            return [IsTeacherOrAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsTeacherOrAdmin(), IsOwnerOrAdmin()]
        elif self.action in ['retrieve', 'list']:  # ✅ Permitir que estudiantes vean lecciones
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Crear lección y registrar en log"""
        with transaction.atomic():
            lesson = serializer.save(teacher=self.request.user)
            log_activity(
                user=self.request.user,
                model_name='Lesson',
                object_id=lesson.id,
                action='create',
                description=f'Creó la lección "{lesson.title}" para grado {lesson.get_grade_display()}',
                request=self.request
            )
            logger.info(f"✅ Lección creada: {lesson.title} por {self.request.user.username}")

    def perform_update(self, serializer):
        """Actualizar lección"""
        lesson = self.get_object()
        user = self.request.user

        # Verificar permisos
        if user.role == 'teacher' and lesson.teacher != user:
            # Verificar si tiene permiso temporal
            has_permission = EditRequest.objects.filter(
                user=user,
                lesson=lesson,
                action_type='edit',
                status='approved',
                approved_until__gte=timezone.now()
            ).exists()

            if not has_permission:
                raise PermissionDenied(
                    "❌ No tienes permiso para editar esta lección. Solicita permiso al administrador."
                )

        with transaction.atomic():
            updated_lesson = serializer.save()
            log_activity(
                user=user,
                model_name='Lesson',
                object_id=updated_lesson.id,
                action='update',
                description=f'Actualizó la lección "{updated_lesson.title}"',
                request=self.request
            )
            logger.info(f"✏️ Lección actualizada: {updated_lesson.title} por {user.username}")

    def perform_destroy(self, instance):
        """Eliminar lección"""
        user = self.request.user

        # Verificar permisos
        if user.role == 'teacher' and instance.teacher != user:
            has_permission = EditRequest.objects.filter(
                user=user,
                lesson=instance,
                action_type='delete',
                status='approved',
                approved_until__gte=timezone.now()
            ).exists()

            if not has_permission:
                raise PermissionDenied(
                    "❌ No tienes permiso para eliminar esta lección. Solicita permiso al administrador."
                )

        lesson_title = instance.title
        lesson_id = instance.id

        with transaction.atomic():
            instance.delete()
            log_activity(
                user=user,
                model_name='Lesson',
                object_id=lesson_id,
                action='delete',
                description=f'Eliminó la lección "{lesson_title}"',
                request=self.request
            )
            logger.warning(f"🗑️ Lección eliminada: {lesson_title} por {user.username}")

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def questions(self, request, pk=None):
        """Obtener todas las preguntas de una lección"""
        lesson = self.get_object()
        questions = lesson.questions.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_lessons(self, request):
        """Obtener lecciones del docente autenticado"""
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Solo los docentes pueden ver sus lecciones.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        lessons = Lesson.objects.filter(teacher=request.user).prefetch_related('questions')
        serializer = self.get_serializer(lessons, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_grade(self, request):
        """Filtrar lecciones por grado"""
        grade = request.query_params.get('grade')
        
        if not grade:
            return Response(
                {'error': 'Parámetro "grade" requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lessons = self.get_queryset().filter(grade=grade)
        serializer = self.get_serializer(lessons, many=True)
        return Response(serializer.data)

# =====================================================
# 🟡 QUESTION VIEWSET
# =====================================================
class QuestionViewSet(viewsets.ModelViewSet):
    """CRUD de preguntas"""
    queryset = Question.objects.select_related('lesson', 'lesson__teacher').all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['text', 'lesson__title']
    ordering_fields = ['order', 'created_at']
    ordering = ['order', 'id']
    pagination_class = None  # Desactivar paginación

    def get_queryset(self):
        """Filtrar preguntas según rol"""
        user = self.request.user
        queryset = Question.objects.select_related('lesson', 'lesson__teacher')

        # 👇 Filtrar por lección si viene en query params
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)

        # 🧩 Filtrar según rol
        if user.role == 'admin':
            return queryset.all()

        if user.role == 'teacher':
            return queryset.filter(
            Q(lesson__teacher=user) |  # Sus propias preguntas
            Q(lesson__teacher__role='admin', lesson__is_active=True)  # Preguntas del admin
        ).distinct()

            

        if user.role == 'student' and user.grade:
            return queryset.filter(
                lesson__grade=user.grade,
                lesson__is_active=True
            )

        return Question.objects.none()

    def get_permissions(self):
        """Permisos según la acción"""
        if self.action in ['create']:
            return [IsTeacherOrAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsTeacherOrAdmin(), IsOwnerOrAdmin()]
        # ✅ CAMBIO: retrieve y list son accesibles para todos los autenticados
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Crear pregunta"""
        lesson = serializer.validated_data.get('lesson')
        user = self.request.user

        # Verificar que el teacher pueda crear preguntas en su propia lección
        if user.role == 'teacher' and lesson.teacher != user:
            raise PermissionDenied("❌ Solo puedes crear preguntas en tus propias lecciones.")

        with transaction.atomic():
            question = serializer.save()
            log_activity(
                user=user,
                model_name='Question',
                object_id=question.id,
                action='create',
                description=f'Creó una pregunta en "{question.lesson.title}"',
                request=self.request
            )

    def perform_update(self, serializer):
        """Actualizar pregunta"""
        question = self.get_object()
        user = self.request.user

        # ✅ Verificar que el profesor solo edite sus propias preguntas
        if user.role == 'teacher' and question.lesson.teacher != user:
            raise PermissionDenied("❌ No tienes permiso para editar esta pregunta.")

        with transaction.atomic():
            updated_question = serializer.save()
            log_activity(
                user=user,
                model_name='Question',
                object_id=updated_question.id,
                action='update',
                description=f'Actualizó pregunta en \"{updated_question.lesson.title}\"',
                request=self.request
            )


    def perform_destroy(self, instance):
        """Eliminar pregunta"""
        user = self.request.user

        # ✅ Verificar que el profesor solo elimine sus propias preguntas
        if user.role == 'teacher' and instance.lesson.teacher != user:
            raise PermissionDenied("❌ No tienes permiso para eliminar esta pregunta.")

        question_text = instance.text
        question_id = instance.id

        with transaction.atomic():
            instance.delete()
            log_activity(
                user=user,
                model_name='Question',
                object_id=question_id,
                action='delete',
                description=f'Eliminó pregunta: \"{question_text[:50]}...\"',
                request=self.request
            )



# =====================================================
# 🔵 LESSON PROGRESS VIEWSET
# =====================================================
class LessonProgressViewSet(viewsets.ModelViewSet):
    """Progreso de lecciones de estudiantes"""
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar progreso según rol"""
        user = self.request.user

        if user.role == 'admin':
            return LessonProgress.objects.select_related('student', 'lesson').all()

        if user.role == 'teacher':
            # Ver progreso de lecciones propias
            return LessonProgress.objects.filter(
                lesson__teacher=user
            ).select_related('student', 'lesson')

        if user.role == 'student':
            # Ver solo su propio progreso
            return LessonProgress.objects.filter(
                student=user
            ).select_related('lesson')

        return LessonProgress.objects.none()

    def perform_create(self, serializer):
        """Crear registro de progreso"""
        serializer.save(
            student=self.request.user,
            completed=True,
            completed_at=timezone.now(),
            attempts=1
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_progress(self, request):
        """Obtener progreso del estudiante autenticado"""
        if request.user.role != 'student':
            return Response(
                {'error': 'Solo los estudiantes pueden ver su progreso.'},
                status=status.HTTP_403_FORBIDDEN
            )

        progress = LessonProgress.objects.filter(
            student=request.user
        ).select_related('lesson')
        
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsTeacherOrAdmin])
    def statistics(self, request):
        """Estadísticas de progreso (para teachers y admin)"""
        user = request.user
        
        if user.role == 'teacher':
            # Estadísticas de lecciones propias
            lessons = Lesson.objects.filter(teacher=user)
        else:
            # Admin ve todo
            lessons = Lesson.objects.all()

        stats = {
            'total_lessons': lessons.count(),
            'total_students': LessonProgress.objects.filter(
                lesson__in=lessons
            ).values('student').distinct().count(),
            'completed_lessons': LessonProgress.objects.filter(
                lesson__in=lessons,
                completed=True
            ).count(),
            'average_score': LessonProgress.objects.filter(
                lesson__in=lessons,
                score__isnull=False
            ).aggregate(avg=Avg('score'))['avg'] or 0
        }

        return Response(stats)


# =====================================================
# 🟣 EDIT REQUEST VIEWSET
# =====================================================
class EditRequestViewSet(viewsets.ModelViewSet):
    """Solicitudes de edición/eliminación"""
    queryset = EditRequest.objects.select_related('user', 'lesson', 'question').all()
    serializer_class = EditRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar solicitudes según rol"""
        user = self.request.user

        if user.role == 'admin':
            return self.queryset.all()

        # Teachers ven sus propias solicitudes
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        """Crear solicitud de edición"""
        with transaction.atomic():
            edit_request = serializer.save(user=self.request.user)
            
            target = edit_request.lesson or edit_request.question
            log_activity(
                user=self.request.user,
                model_name='EditRequest',
                object_id=edit_request.id,
                action='create',
                description=f'Solicitó {edit_request.get_action_type_display()} de {target}',
                request=self.request
            )
            logger.info(f"📝 Nueva solicitud de edición por {self.request.user.username}")

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Aprobar solicitud (solo admin)"""
        edit_request = self.get_object()
        
        duration_hours = request.data.get('duration_hours', 24)
        response_message = request.data.get('response_message', 'Solicitud aprobada.')

        with transaction.atomic():
            edit_request.status = 'approved'
            edit_request.response_time = timezone.now()
            edit_request.approved_until = timezone.now() + timedelta(hours=duration_hours)
            edit_request.response_message = response_message
            edit_request.save()

            log_activity(
                user=request.user,
                model_name='EditRequest',
                object_id=edit_request.id,
                action='update',
                description=f'Aprobó solicitud de {edit_request.user.username}',
                request=request
            )

        logger.info(f"✅ Solicitud #{edit_request.id} aprobada por {request.user.username}")
        return Response(EditRequestSerializer(edit_request).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Rechazar solicitud (solo admin)"""
        edit_request = self.get_object()
        
        response_message = request.data.get('response_message', 'Solicitud rechazada.')

        with transaction.atomic():
            edit_request.status = 'rejected'
            edit_request.response_time = timezone.now()
            edit_request.response_message = response_message
            edit_request.save()

            log_activity(
                user=request.user,
                model_name='EditRequest',
                object_id=edit_request.id,
                action='update',
                description=f'Rechazó solicitud de {edit_request.user.username}',
                request=request
            )

        logger.warning(f"❌ Solicitud #{edit_request.id} rechazada por {request.user.username}")
        return Response(EditRequestSerializer(edit_request).data)


# =====================================================
# 🔵 ACTIVITY LOG VIEWSET
# =====================================================
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Logs de actividad (solo lectura)"""
    queryset = ActivityLog.objects.select_related('user').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'model_name', 'description']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


# =====================================================
# 🔹 ENDPOINT: Marcar lección como completada
# =====================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_completed(request, lesson_id):
    """Marcar lección como completada"""
    if request.user.role != 'student':
        return Response(
            {'error': 'Solo los estudiantes pueden completar lecciones.'},
            status=status.HTTP_403_FORBIDDEN
        )

    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    # Verificar que sea del grado del estudiante
    if lesson.grade != request.user.grade:
        return Response(
            {'error': 'Esta lección no corresponde a tu grado.'},
            status=status.HTTP_403_FORBIDDEN
        )

    with transaction.atomic():
        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
            defaults={
                'completed': True,
                'completed_at': timezone.now(),
                'attempts': 1
            }
        )

        if not created:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.attempts += 1
            progress.save()

        log_activity(
            user=request.user,
            model_name='LessonProgress',
            object_id=progress.id,
            action='update',
            description=f'Completó la lección "{lesson.title}"',
            request=request
        )

    logger.info(f"✅ {request.user.username} completó lección: {lesson.title}")
    
    return Response({
        'message': 'Lección marcada como completada ✅',
        'progress': LessonProgressSerializer(progress).data
    }, status=status.HTTP_200_OK)


# =====================================================
# 🔹 ENDPOINT: Estadísticas generales
# =====================================================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def general_statistics(request):
    """Estadísticas generales del sistema"""
    stats = {
        'lessons': {
            'total': Lesson.objects.count(),
            'active': Lesson.objects.filter(is_active=True).count(),
            'by_grade': list(Lesson.objects.values('grade').annotate(count=Count('id')))
        },
        'questions': {
            'total': Question.objects.count(),
            'by_lesson': list(
                Lesson.objects.annotate(
                    questions_count=Count('questions')
                ).values('title', 'questions_count')[:10]
            )
        },
        'progress': {
            'total_completions': LessonProgress.objects.filter(completed=True).count(),
            'average_score': LessonProgress.objects.filter(
                score__isnull=False
            ).aggregate(avg=Avg('score'))['avg'] or 0,
            'total_attempts': LessonProgress.objects.aggregate(
                total=Count('id')
            )['total']
        },
        'edit_requests': {
            'total': EditRequest.objects.count(),
            'pending': EditRequest.objects.filter(status='pending').count(),
            'approved': EditRequest.objects.filter(status='approved').count(),
            'rejected': EditRequest.objects.filter(status='rejected').count()
        }
    }

    return Response(stats)