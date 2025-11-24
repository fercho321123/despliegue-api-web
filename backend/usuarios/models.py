
# from django.contrib.auth.models import AbstractUser
# from django.db import models


# class User(AbstractUser):
#     ROLE_CHOICES = (
#         ('admin', 'Administrador'),
#         ('teacher', 'Docente'),
#         ('student', 'Estudiante'),
#     )
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
#     avatar = models.ImageField(upload_to='avatar/', null=True, blank=True)
#     grade = models.CharField(max_length=20, null=True, blank=True)  # only for students
#     subject_area = models.CharField(max_length=50, null=True, blank=True)  # only for teachers

#     def __str__(self):
#         return f"{self.username} ({self.role})"
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrador'),
        ('teacher', 'Docente'),
        ('student', 'Estudiante'),
    )
    
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
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, null=True, blank=True)
    subject_area = models.CharField(max_length=50, null=True, blank=True)

    telefono1 = models.CharField(
            max_length=15,
            null=True,
            blank=True,
            verbose_name='Teléfono',
            help_text='Formato: 3001234567 o +573001234567'
        )
    
    # Campos adicionales útiles
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def clean(self):
        """Validación personalizada"""
        if self.role == 'student' and not self.grade:
            raise ValidationError({'grade': 'Los estudiantes deben tener un grado asignado.'})
        if self.role == 'teacher' and not self.subject_area:
            raise ValidationError({'subject_area': 'Los docentes deben tener un área asignada.'})
        if self.role == 'admin':
            self.grade = None
            self.subject_area = None

    def save(self, *args, **kwargs):
        # Solo validar en creación o si se modifican campos específicos
        skip_validation = kwargs.pop('skip_validation', False)
        
        if not skip_validation:
            try:
                self.full_clean()
            except ValidationError:
                # En actualización de contraseña, ignorar validaciones de rol
                pass
        
        super().save(*args, **kwargs)