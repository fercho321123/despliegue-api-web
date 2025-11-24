# from django.contrib import admin
# from .models import Lesson, Question, ActivityLog, EditPermissionRequest
# from .models import EditRequest
# from django.utils import timezone

# @admin.register(Lesson)
# class LessonAdmin(admin.ModelAdmin):
#     list_display = ('id', 'title', 'grade', 'topic', 'teacher')
#     search_fields = ('title', 'topic', 'teacher__username')

# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     list_display = ('id', 'lesson', 'text', 'correct_answer')
#     search_fields = ('text', 'lesson__title')

# @admin.register(ActivityLog)
# class ActivityLogAdmin(admin.ModelAdmin):
#     list_display = ('id', 'user', 'model_name', 'action', 'timestamp')
#     search_fields = ('user__username', 'model_name', 'action')
#     list_filter = ('action', 'timestamp')

# @admin.register(EditPermissionRequest)
# class EditPermissionRequestAdmin(admin.ModelAdmin):
#     list_display = ('id', 'teacher', 'question', 'action_type', 'approved', 'approved_until', 'created_at')
#     list_filter = ('approved', 'action_type')
#     search_fields = ('teacher__username', 'question__text')

# @admin.register(EditRequest)
# class EditRequestAdmin(admin.ModelAdmin):
#     list_display = ('user', 'lesson', 'action_type', 'status', 'created_at', 'response_time')
#     list_filter = ('status', 'action_type', 'created_at')
#     search_fields = ('user__username', 'lesson__title')

#     actions = ['approve_request', 'reject_request']

#     def approve_request(self, request, queryset):
#         """Aprobar solicitud"""
#         for edit_request in queryset:
#             edit_request.status = 'approved'
#             edit_request.response_time = timezone.now()
#             edit_request.save()

#     def reject_request(self, request, queryset):
#         """Rechazar solicitud"""
#         for edit_request in queryset:
#             edit_request.status = 'rejected'
#             edit_request.response_time = timezone.now()
#             edit_request.save()

#     approve_request.short_description = "Aprobar solicitud"
#     reject_request.short_description = "Rechazar solicitud"

from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Lesson, Question, ActivityLog, EditRequest, LessonProgress


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'grade_display', 'topic', 'teacher_name', 'questions_count', 'is_active', 'created_at')
    list_filter = ('grade', 'is_active', 'created_at', 'topic')
    search_fields = ('title', 'topic', 'teacher__username', 'teacher__email')
    readonly_fields = ('created_at', 'updated_at', 'questions_count')
    list_editable = ('is_active',)
    date_hierarchy = 'created_at'
    
    def grade_display(self, obj):
        return obj.get_grade_display()
    grade_display.short_description = 'Grado'
    
    def teacher_name(self, obj):
        return obj.teacher.username
    teacher_name.short_description = 'Docente'
    
    def questions_count(self, obj):
        return obj.questions.count()
    questions_count.short_description = 'Preguntas'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson_title', 'text_preview', 'correct_answer', 'order', 'created_at')
    list_filter = ('correct_answer', 'lesson__grade', 'created_at')
    search_fields = ('text', 'lesson__title')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('order',)
    
    def lesson_title(self, obj):
        return obj.lesson.title
    lesson_title.short_description = 'Lección'
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Pregunta'


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_name', 'lesson_title', 'completed_icon', 'score', 'attempts', 'completed_at')
    list_filter = ('completed', 'lesson__grade', 'completed_at')
    search_fields = ('student__username', 'lesson__title')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'completed_at'
    
    def student_name(self, obj):
        return obj.student.username
    student_name.short_description = 'Estudiante'
    
    def lesson_title(self, obj):
        return obj.lesson.title
    lesson_title.short_description = 'Lección'
    
    def completed_icon(self, obj):
        if obj.completed:
            return format_html('<span style="color: green;">✅ Sí</span>')
        return format_html('<span style="color: red;">❌ No</span>')
    completed_icon.short_description = 'Completada'


@admin.register(EditRequest)
class EditRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_name', 'target_display', 'action_type_display', 'status_display', 'created_at', 'response_time')
    list_filter = ('status', 'action_type', 'created_at')
    search_fields = ('user__username', 'lesson__title', 'description')
    readonly_fields = ('created_at', 'response_time')
    actions = ['approve_requests', 'reject_requests']
    date_hierarchy = 'created_at'

    def user_name(self, obj):
        return obj.user.username
    user_name.short_description = 'Usuario'
    
    def target_display(self, obj):
        if obj.lesson:
            return f'Lección: {obj.lesson.title}'
        if obj.question:
            return f'Pregunta: {obj.question.text[:30]}...'
        return 'N/A'
    target_display.short_description = 'Objetivo'
    
    def action_type_display(self, obj):
        return obj.get_action_type_display()
    action_type_display.short_description = 'Acción'
    
    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red'
        }
        return format_html(
            '<span style="color: {};">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Estado'

    def approve_requests(self, request, queryset):
        """Aprobar solicitudes seleccionadas"""
        count = 0
        for edit_request in queryset.filter(status='pending'):
            edit_request.status = 'approved'
            edit_request.response_time = timezone.now()
            edit_request.approved_until = timezone.now() + timezone.timedelta(hours=24)
            edit_request.save()
            count += 1
        
        self.message_user(request, f'{count} solicitud(es) aprobada(s) exitosamente.')
    approve_requests.short_description = "✅ Aprobar solicitudes seleccionadas"

    def reject_requests(self, request, queryset):
        """Rechazar solicitudes seleccionadas"""
        count = 0
        for edit_request in queryset.filter(status='pending'):
            edit_request.status = 'rejected'
            edit_request.response_time = timezone.now()
            edit_request.save()
            count += 1
        
        self.message_user(request, f'{count} solicitud(es) rechazada(s).')
    reject_requests.short_description = "❌ Rechazar solicitudes seleccionadas"


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_name', 'model_name', 'action_display', 'object_id', 'timestamp', 'ip_address')
    list_filter = ('action', 'model_name', 'timestamp')
    search_fields = ('user__username', 'model_name', 'description')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    def user_name(self, obj):
        return obj.user.username if obj.user else 'Usuario eliminado'
    user_name.short_description = 'Usuario'
    
    def action_display(self, obj):
        return obj.get_action_display()
    action_display.short_description = 'Acción'
