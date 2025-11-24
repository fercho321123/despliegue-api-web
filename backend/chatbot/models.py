

# # chatbot/models.py (fragmento)
# from django.db import models
# from django.conf import settings

# User = settings.AUTH_USER_MODEL

# class Conversation(models.Model):
#     student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations")
#     lesson = models.ForeignKey('ejercicios.Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
#     start_date = models.DateTimeField(auto_now_add=True)
#     context = models.TextField(blank=True)

#     class Meta:
#         ordering = ['-start_date']  # muestra las conversaciones más recientes primero

#     def __str__(self):
#         return f"Conv-{self.id} ({self.student.username}) - {self.lesson.title if self.lesson else 'Sin lección'}"


# class ChatMessage(models.Model):
#     SENDER_CHOICES = (
#         ('bot', 'Bot'),
#         ('user', 'Usuario'),
#     )
#     conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
#     sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
#     text = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     metadata = models.JSONField(null=True, blank=True)

#     class Meta:
#         ordering = ['created_at']

#     def __str__(self):
#         return f"{self.sender}: {self.text[:30]}"


# class Result(models.Model):
#     student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="results")
#     question = models.ForeignKey('ejercicios.Question', on_delete=models.CASCADE, null=True, blank=True)  # <-- cambiado a FK
#     sent_answer = models.CharField(max_length=10)
#     correct = models.BooleanField()
#     date = models.DateTimeField(auto_now_add=True)
#     conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name="results")

#     class Meta:
#         ordering = ['-date']  # resultados más recientes primero

#     def __str__(self):
#         return f"R-{self.student.username} - Q{self.question_id} - {'OK' if self.correct else 'WR'}"


# ============================================
# 📁 chatbot/models.py - MEJORADO
# ============================================

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL


class Conversation(models.Model):
    """Conversación entre estudiante y bot"""
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="conversations"
    )
    lesson = models.ForeignKey(
        'ejercicios.Lesson', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='conversations'
    )
    title = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Título de la conversación generado automáticamente"
    )
    mode = models.CharField(
        max_length=20,
        choices=[
            ('practice', 'Práctica con preguntas'),
            ('tutor', 'Tutoría con IA'),
            ('mixed', 'Modo mixto')
        ],
        default='mixed'
    )
    start_date = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    context = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Contexto adicional de la conversación"
    )
    is_active = models.BooleanField(default=True)
    total_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-last_activity']
        verbose_name = "Conversación"
        verbose_name_plural = "Conversaciones"
        indexes = [
            models.Index(fields=['student', '-last_activity']),
            models.Index(fields=['lesson']),
        ]

    def __str__(self):
        lesson_info = f" - {self.lesson.title}" if self.lesson else ""
        return f"Conv #{self.id} ({self.student.username}){lesson_info}"
    
    @property
    def accuracy(self):
        """Porcentaje de aciertos"""
        if self.total_questions == 0:
            return 0
        return round((self.correct_answers / self.total_questions) * 100, 1)
    
    def update_stats(self, is_correct):
        """Actualizar estadísticas de la conversación"""
        self.total_questions += 1
        if is_correct:
            self.correct_answers += 1
        self.save(update_fields=['total_questions', 'correct_answers', 'last_activity'])


class ChatMessage(models.Model):
    """Mensaje individual en una conversación"""
    SENDER_CHOICES = (
        ('bot', 'Bot'),
        ('user', 'Usuario'),
        ('system', 'Sistema'),  # Para mensajes del sistema
    )
    
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name="messages"
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(
        null=True, 
        blank=True,
        help_text="Metadatos: question_id, source, tokens_used, etc."
    )
    # Nuevos campos para mejor tracking
    tokens_used = models.PositiveIntegerField(default=0)
    response_time_ms = models.PositiveIntegerField(
        default=0,
        help_text="Tiempo de respuesta en milisegundos"
    )
    rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Calificación del usuario (1-5 estrellas)"
    )

    class Meta:
        ordering = ['created_at']
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        preview = self.text[:50] + "..." if len(self.text) > 50 else self.text
        return f"[{self.sender}] {preview}"


class Result(models.Model):
    """Resultado de evaluación de respuestas"""
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="results"
    )
    question = models.ForeignKey(
        'ejercicios.Question', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="results"
    )
    sent_answer = models.CharField(max_length=10)
    correct = models.BooleanField()
    date = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Tiempo que tardó en responder"
    )
    attempts = models.PositiveIntegerField(
        default=1,
        help_text="Número de intentos para esta pregunta"
    )

    class Meta:
        ordering = ['-date']
        verbose_name = "Resultado"
        verbose_name_plural = "Resultados"
        indexes = [
            models.Index(fields=['student', '-date']),
            models.Index(fields=['question']),
        ]

    def __str__(self):
        status = "✅" if self.correct else "❌"
        return f"{status} {self.student.username} - Q{self.question_id}"


class ConversationFeedback(models.Model):
    """Feedback del usuario sobre la conversación"""
    conversation = models.OneToOneField(
        Conversation,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Feedback de Conversación"
        verbose_name_plural = "Feedbacks de Conversaciones"
    
    def __str__(self):
        return f"Feedback Conv #{self.conversation.id} - {self.rating}⭐"


# ============================================
# 📁 chatbot/serializers.py - MEJORADO
# ============================================

from rest_framework import serializers
from .models import Conversation, ChatMessage, Result, ConversationFeedback
from ejercicios.serializers import LessonSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensajes individuales"""
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'conversation', 'sender', 'text', 
            'created_at', 'metadata', 'tokens_used',
            'response_time_ms', 'rating'
        ]
        read_only_fields = ('id', 'created_at', 'tokens_used', 'response_time_ms')


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer para conversaciones"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_info = LessonSerializer(source='lesson', read_only=True)
    accuracy = serializers.FloatField(read_only=True)
    message_count = serializers.IntegerField(
        source='messages.count', 
        read_only=True
    )
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'student', 'student_name', 'lesson', 'lesson_info',
            'title', 'mode', 'start_date', 'last_activity', 
            'context', 'is_active', 'total_questions', 
            'correct_answers', 'accuracy', 'messages', 'message_count'
        ]
        read_only_fields = (
            'id', 'student', 'student_name', 'start_date', 
            'last_activity', 'total_questions', 'correct_answers'
        )


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listar conversaciones"""
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    accuracy = serializers.FloatField(read_only=True)
    message_count = serializers.IntegerField(
        source='messages.count', 
        read_only=True
    )
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'student_name', 'lesson', 'lesson_title',
            'title', 'mode', 'start_date', 'last_activity',
            'is_active', 'total_questions', 'correct_answers',
            'accuracy', 'message_count'
        ]


class ResultSerializer(serializers.ModelSerializer):
    """Serializer para resultados"""
    student_name = serializers.CharField(source='student.username', read_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = Result
        fields = [
            'id', 'student', 'student_name', 'question', 
            'question_text', 'conversation', 'sent_answer',
            'correct', 'date', 'time_taken_seconds', 'attempts'
        ]
        read_only_fields = ('id', 'student', 'date')


class ConversationFeedbackSerializer(serializers.ModelSerializer):
    """Serializer para feedback"""
    
    class Meta:
        model = ConversationFeedback
        fields = ['id', 'conversation', 'rating', 'comment', 'created_at']
        read_only_fields = ('id', 'created_at')


class MessageRatingSerializer(serializers.Serializer):
    """Serializer para calificar mensajes"""
    rating = serializers.IntegerField(min_value=1, max_value=5)
    message_id = serializers.IntegerField()