# # ejercicios/permissions.py
# from rest_framework import permissions

# class IsRoleAdmin(permissions.BasePermission):
#     """
#     Permite acceso solo a usuarios con role == 'admin'
#     """

#     def has_permission(self, request, view):
#         return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin')

from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permiso solo para administradores"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'admin'
        )


class IsTeacherUser(permissions.BasePermission):
    """Permiso solo para docentes"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'teacher'
        )


class IsTeacherOrAdmin(permissions.BasePermission):
    """Permiso para docentes y administradores"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) in ['teacher', 'admin']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permiso para el propietario del objeto o admin"""
    
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'admin':
            return True
        
        # Para lecciones
        if hasattr(obj, 'teacher'):
            return obj.teacher == request.user
        
        # Para preguntas
        if hasattr(obj, 'lesson'):
            return obj.lesson.teacher == request.user
        
        # Para progreso
        if hasattr(obj, 'student'):
            return obj.student == request.user
        
        return False
    

class IsQuestionOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso al admin o al profesor dueño de la lección de la pregunta"""

    def has_permission(self, request, view):
        # Permite que admin o teacher autenticado accedan al endpoint
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ['teacher', 'admin']
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        # 👑 Admin siempre puede
        if getattr(user, 'role', None) == 'admin':
            return True

        # 🧑‍🏫 Teacher puede si es dueño de la lección de la pregunta
        if getattr(user, 'role', None) == 'teacher':
            # Verificar que la pregunta pertenezca a una lección del profesor
            if hasattr(obj, 'lesson') and hasattr(obj.lesson, 'teacher'):
                return obj.lesson.teacher == user

        return False