# from django.db import models
# from django.conf import settings

# User = settings.AUTH_USER_MODEL


# # =====================================================
# # 🟢 MODELO LESSON
# # =====================================================
# class Lesson(models.Model):
#     title = models.CharField(max_length=100)
#     description = models.TextField(blank=True)
#     grade = models.CharField(max_length=20)
#     topic = models.CharField(max_length=50)
#     teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lessons")

#     def __str__(self):
#         return f"{self.title} ({self.grade})"


# # =====================================================
# # 🟡 MODELO QUESTION
# # =====================================================
# class Question(models.Model):
#     lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="questions")
#     text = models.TextField(verbose_name="Texto de la pregunta")
#     option_a = models.CharField(max_length=200, verbose_name="Opción A")
#     option_b = models.CharField(max_length=200, verbose_name="Opción B")
#     option_c = models.CharField(max_length=200, verbose_name="Opción C")
#     option_d = models.CharField(max_length=200, verbose_name="Opción D")
#     correct_answer = models.CharField(
#         max_length=1,
#         choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
#         verbose_name="Respuesta correcta"
#     )

#     def __str__(self):
#         return f"Pregunta {self.id} - {self.lesson.title}"


# # =====================================================
# # 🔵 MODELO ACTIVITY LOG
# # =====================================================
# class ActivityLog(models.Model):
#     ACTIONS = [
#         ('create', 'Creación'),
#         ('update', 'Edición'),
#         ('delete', 'Eliminación'),
#     ]

#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     model_name = models.CharField(max_length=100)
#     object_id = models.PositiveIntegerField(null=True, blank=True)
#     action = models.CharField(max_length=10, choices=ACTIONS)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     description = models.TextField(blank=True)

#     def __str__(self):
#         return f"{self.user} - {self.model_name} - {self.action}"


# # =====================================================
# # 🟣 MODELO EDIT PERMISSION REQUEST (versión final extendida)
# # =====================================================
# class EditPermissionRequest(models.Model):
#     teacher = models.ForeignKey(User, on_delete=models.CASCADE)
#     question = models.ForeignKey('Question', on_delete=models.CASCADE, null=True, blank=True)
#     lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE, null=True, blank=True)
#     action_type = models.CharField(
#         max_length=10,
#         choices=[('edit', 'Editar'), ('delete', 'Eliminar')]
#     )
#     approved = models.BooleanField(default=False)
#     rejected = models.BooleanField(default=False)  # para marcar solicitudes rechazadas
#     response_message = models.TextField(blank=True, null=True)  # motivo de aprobación o rechazo
#     created_at = models.DateTimeField(auto_now_add=True)
#     approved_until = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         target = (
#             f"pregunta {self.question.id}" if self.question
#             else f"lección {self.lesson.id}" if self.lesson
#             else "elemento desconocido"
#         )
#         estado = (
#             "Aprobada" if self.approved else
#             "Rechazada" if self.rejected else
#             "Pendiente"
#         )
#         return f"{self.teacher.username} solicita {self.action_type} de {target} ({estado})"


# # =====================================================
# # 🟣 MODELO LESSON PROGRESS (progreso de lectura del estudiante)
# # =====================================================
# class LessonProgress(models.Model):
#     student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress")
#     lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
#     completed = models.BooleanField(default=False)
#     completed_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         unique_together = ('student', 'lesson')  # evita duplicados

#     def __str__(self):
#         estado = "✅ Leída" if self.completed else "❌ Pendiente"
#         # when student might be None (defensive)
#         student_name = getattr(self.student, 'username', str(self.student))
#         return f"{student_name} - {self.lesson.title} ({estado})"



# class EditRequest(models.Model):
#     ACTION_CHOICES = [
#         ('edit', 'Edit'),
#         ('delete', 'Delete'),
#     ]
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#     ]

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='edit_requests'
#     )
#     lesson = models.ForeignKey(
#         'Lesson',
#         on_delete=models.CASCADE,
#         related_name='edit_requests',
#         null=True,
#         blank=True
#     )
#     question = models.ForeignKey(
#         'Question',
#         on_delete=models.CASCADE,
#         null=True,
#         blank=True,
#         related_name='edit_requests'
#     )  # <-- agregado para alinear con la validación en serializer
#     action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)
#     description = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     response_time = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.user.username} requested {self.action_type} on {self.lesson.title if self.lesson else 'No lesson'}"


from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class Lesson(models.Model):
    """Lecciones creadas por docentes"""
    GRADE_CHOICES = (
        ('1', 'Primero'),
        ('2', 'Segundo'),
        ('3', 'Tercero'),
        ('4', 'Cuarto'),
        ('5', 'Quinto'),
        ('6', 'Sexto'),
        ('7', 'Séptimo'),
        ('8', 'Octavo'),
        ('9', 'Noveno'),
        ('10', 'Décimo'),
        ('11', 'Once'),
    )
    
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, verbose_name="Grado")
    topic = models.CharField(max_length=100, verbose_name="Tema")
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="lessons",
        limit_choices_to={'role': 'teacher'}
    )
    is_active = models.BooleanField(default=True, verbose_name="Activa")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"
        indexes = [
            models.Index(fields=['grade', 'topic']),
            models.Index(fields=['teacher']),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_grade_display()} ({self.teacher.username})"

    @property
    def questions_count(self):
        return self.questions.count()


class Question(models.Model):
    """Preguntas de opción múltiple asociadas a lecciones"""
    ANSWER_CHOICES = [
        ('A', 'Opción A'),
        ('B', 'Opción B'),
        ('C', 'Opción C'),
        ('D', 'Opción D'),
    ]
    
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name="questions"
    )
    text = models.TextField(verbose_name="Pregunta")
    option_a = models.CharField(max_length=300, verbose_name="Opción A")
    option_b = models.CharField(max_length=300, verbose_name="Opción B")
    option_c = models.CharField(max_length=300, verbose_name="Opción C")
    option_d = models.CharField(max_length=300, verbose_name="Opción D")
    correct_answer = models.CharField(
        max_length=1,
        choices=ANSWER_CHOICES,
        verbose_name="Respuesta correcta"
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Orden")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson', 'order', 'id']
        verbose_name = "Pregunta"
        verbose_name_plural = "Preguntas"

    def __str__(self):
        return f"Pregunta {self.id} - {self.lesson.title}"

    def clean(self):
        """Validar que la respuesta correcta no esté vacía"""
        correct_option = getattr(self, f'option_{self.correct_answer.lower()}', None)
        if not correct_option:
            raise ValidationError({
                'correct_answer': f'La opción {self.correct_answer} está vacía.'
            })


class LessonProgress(models.Model):
    """Progreso de lectura de lecciones por estudiante"""
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="lesson_progress",
        limit_choices_to={'role': 'student'}
    )
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name="student_progress"
    )
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Puntuación"
    )
    attempts = models.PositiveIntegerField(default=0, verbose_name="Intentos")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson')
        verbose_name = "Progreso de Lección"
        verbose_name_plural = "Progresos de Lecciones"
        ordering = ['-updated_at']

    def __str__(self):
        status = "✅ Completada" if self.completed else "📖 En progreso"
        return f"{self.student.username} - {self.lesson.title} ({status})"


class EditRequest(models.Model):
    """Solicitudes de edición/eliminación de lecciones o preguntas"""
    ACTION_CHOICES = [
        ('edit', 'Editar'),
        ('delete', 'Eliminar'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='edit_requests'
    )
    lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.CASCADE,
        related_name='edit_requests',
        null=True,
        blank=True
    )
    question = models.ForeignKey(
        'Question',
        on_delete=models.CASCADE,
        related_name='edit_requests',
        null=True,
        blank=True
    )
    action_type = models.CharField(
        max_length=10, 
        choices=ACTION_CHOICES,
        verbose_name="Tipo de acción"
    )
    description = models.TextField(
        blank=True, 
        verbose_name="Descripción/Justificación"
    )
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Estado"
    )
    response_message = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Mensaje de respuesta"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    response_time = models.DateTimeField(null=True, blank=True)
    approved_until = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Vigencia del permiso"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Solicitud de Edición"
        verbose_name_plural = "Solicitudes de Edición"

    def __str__(self):
        target = self.lesson or self.question or "elemento desconocido"
        return f"{self.user.username} - {self.get_action_type_display()} {target} ({self.get_status_display()})"

    def clean(self):
        """Validar que se proporcione lesson O question, pero no ambos"""
        if not self.lesson and not self.question:
            raise ValidationError(
                "Debes proporcionar una lección o una pregunta."
            )
        if self.lesson and self.question:
            raise ValidationError(
                "Solo puedes solicitar edición de una lección O una pregunta, no ambas."
            )


class ActivityLog(models.Model):
    """Registro de actividades del sistema"""
    ACTION_CHOICES = [
        ('create', 'Creación'),
        ('update', 'Actualización'),
        ('delete', 'Eliminación'),
        ('view', 'Visualización'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='activity_logs'
    )
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Registro de Actividad"
        verbose_name_plural = "Registros de Actividad"
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        username = self.user.username if self.user else "Usuario eliminado"
        return f"{username} - {self.model_name} - {self.get_action_display()} ({self.timestamp})"