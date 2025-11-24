
# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from .models import (
#     Lesson,
#     Question,
#     ActivityLog,
#     EditPermissionRequest,
#     LessonProgress,
#     EditRequest,  # ✅ new model added
# )

# User = get_user_model()


# # =====================================================
# # 🟢 LESSON SERIALIZER
# # =====================================================
# class LessonSerializer(serializers.ModelSerializer):
#     questions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
#     teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
#     teacher_name = serializers.CharField(source='teacher.username', read_only=True)

#     class Meta:
#         model = Lesson
#         fields = [
#             'id',
#             'title',
#             'description',
#             'grade',
#             'topic',
#             'teacher',
#             'teacher_id',
#             'teacher_name',
#             'questions',
#         ]
#         read_only_fields = ['teacher', 'teacher_id', 'teacher_name', 'questions']
# # =====================================================
# # 🟡 QUESTION SERIALIZER
# # =====================================================
# class QuestionSerializer(serializers.ModelSerializer):
#     lesson_title = serializers.CharField(source='lesson.title', read_only=True)
#     lesson_teacher = serializers.IntegerField(source='lesson.teacher.id', read_only=True)

#     class Meta:
#         model = Question
#         fields = '__all__'
#         read_only_fields = ['id', 'lesson_title', 'lesson_teacher']


# # =====================================================
# # 🔵 ACTIVITY LOG SERIALIZER
# # =====================================================
# class ActivityLogSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(source='user.username', read_only=True)

#     class Meta:
#         model = ActivityLog
#         fields = [
#             'id',
#             'user_name',
#             'model_name',
#             'object_id',
#             'action',
#             'timestamp',
#             'description',
#         ]
#         read_only_fields = ['id', 'user_name', 'timestamp']


# # =====================================================
# # 🟣 EDIT PERMISSION REQUEST SERIALIZER
# # =====================================================
# class EditPermissionRequestSerializer(serializers.ModelSerializer):
#     teacher_name = serializers.CharField(source='teacher.username', read_only=True)
#     question_text = serializers.CharField(source='question.text', read_only=True, allow_null=True)
#     lesson_title = serializers.CharField(source='lesson.title', read_only=True, allow_null=True)

#     class Meta:
#         model = EditPermissionRequest
#         fields = [
#             'id',
#             'teacher',
#             'teacher_name',
#             'question',
#             'question_text',
#             'lesson',
#             'lesson_title',
#             'action_type',
#             'approved',
#             'rejected',
#             'response_message',
#             'approved_until',
#             'created_at',
#         ]
#         read_only_fields = [
#             'teacher_name',
#             'question_text',
#             'lesson_title',
#             'created_at',
#             'approved',
#             'rejected',
#             'response_message',
#             'approved_until',
#         ]

#     def validate(self, data):
#         """Ensure either a question or lesson is provided, but not both."""
#         question = data.get('question', None)
#         lesson = data.get('lesson', None)

#         if question is None and lesson is None:
#             raise serializers.ValidationError("You must provide either a question or a lesson.")

#         if question is not None and lesson is not None:
#             raise serializers.ValidationError("You can only provide one: question or lesson, not both.")

#         return data


# # =====================================================
# # 🔹 LESSON PROGRESS SERIALIZER
# # =====================================================
# class LessonProgressSerializer(serializers.ModelSerializer):
#     student_name = serializers.CharField(source='student.username', read_only=True)
#     lesson_title = serializers.CharField(source='lesson.title', read_only=True)

#     class Meta:
#         model = LessonProgress
#         fields = ['id', 'student', 'student_name', 'lesson', 'lesson_title', 'completed', 'completed_at']
#         read_only_fields = ['completed_at']


# class EditRequestSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(source='user.username', read_only=True)
#     lesson_title = serializers.CharField(source='lesson.title', read_only=True)

#     class Meta:
#         model = EditRequest
#         fields = [
#             'id',
#             'user',
#             'user_name',
#             'lesson',
#             'lesson_title',
#             'action_type',
#             'description',
#             'created_at',
#             'status',
#             'response_time',
#         ]
#         read_only_fields = ['user', 'user_name', 'lesson_title', 'created_at', 'status', 'response_time']

#     def validate(self, data):
#         # Validación adicional si se necesita
#         if not data.get('lesson') and not data.get('question'):
#             raise serializers.ValidationError("Debes proporcionar 'lesson' o 'question'.")
#         return data


from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Lesson, Question, LessonProgress, EditRequest, ActivityLog

User = get_user_model()

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer para preguntas"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_teacher = serializers.IntegerField(source='lesson.teacher.id', read_only=True)  # ✅ AGREGAR ESTA LÍNEA
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'lesson', 'lesson_title', 'lesson_teacher', 'text',  # ✅ Agregar 'lesson_teacher' aquí
            'option_a', 'option_b', 'option_c', 'option_d',
            'correct_answer', 'order', 'created_at', 'updated_at','can_edit',
        ]
        read_only_fields = ['id', 'lesson_title', 'lesson_teacher', 'created_at', 'updated_at']  # ✅ Y aquí

    def get_can_edit(self, obj):
        """Determina si el usuario actual puede editar esta pregunta"""
        user = self.context['request'].user

        # 👑 Admin siempre puede editar
        if user.role == 'admin':
            return True

        # 🧑🏫 Profesor solo si es dueño de la lección
        if user.role == 'teacher' and obj.lesson.teacher == user:
            return True

        return False

    def validate(self, data):
        """Validar que la respuesta correcta no esté vacía"""
        correct_answer = data.get('correct_answer')
        if correct_answer:
            option_field = f'option_{correct_answer.lower()}'
            option_value = data.get(option_field)
            if not option_value or not option_value.strip():
                raise serializers.ValidationError({
                    'correct_answer': f'La opción {correct_answer} no puede estar vacía.'
                })
        return data

class LessonSerializer(serializers.ModelSerializer):
    """Serializer para lecciones"""
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    questions_count = serializers.IntegerField(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'grade', 'topic',
            'teacher', 'teacher_id', 'teacher_name',
            'is_active', 'questions_count', 'questions',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'teacher', 'teacher_id', 'teacher_name',
            'questions_count', 'questions', 'created_at', 'updated_at'
        ]

    def validate_teacher(self, value):
        """Validar que el teacher sea realmente un docente"""
        if value.role != 'teacher':
            raise serializers.ValidationError(
                "Solo los usuarios con rol 'teacher' pueden crear lecciones."
            )
        return value


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer para progreso de lecciones"""
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_grade = serializers.CharField(source='lesson.grade', read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            'id', 'student', 'student_name', 'lesson', 'lesson_title',
            'lesson_grade', 'completed', 'completed_at', 'score',
            'attempts', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'student', 'student_name', 'lesson_title', 
            'lesson_grade', 'created_at', 'updated_at'
        ]


class EditRequestSerializer(serializers.ModelSerializer):
    """Serializer para solicitudes de edición"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = EditRequest
        fields = [
            'id', 'user', 'user_name', 'lesson', 'lesson_title',
            'question', 'question_text', 'action_type', 'action_type_display',
            'description', 'status', 'status_display', 'response_message',
            'created_at', 'response_time', 'approved_until'
        ]
        read_only_fields = [
            'id', 'user', 'user_name', 'lesson_title', 'question_text',
            'status_display', 'action_type_display', 'created_at',
            'response_time'
        ]

    def validate(self, data):
        """Validar que se proporcione lesson O question"""
        lesson = data.get('lesson')
        question = data.get('question')

        if not lesson and not question:
            raise serializers.ValidationError(
                "Debes proporcionar 'lesson' o 'question'."
            )

        if lesson and question:
            raise serializers.ValidationError(
                "Solo puedes proporcionar 'lesson' O 'question', no ambos."
            )

        return data


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de actividad"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'model_name', 'object_id',
            'action', 'action_display', 'description', 'ip_address',
            'timestamp'
        ]
        read_only_fields = ['id', 'user_name', 'action_display', 'timestamp']