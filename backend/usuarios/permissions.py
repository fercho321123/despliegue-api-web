from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permiso solo para administradores"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsTeacherUser(permissions.BasePermission):
    """Permiso solo para docentes"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'


class IsTeacherOrAdmin(permissions.BasePermission):
    """Permiso para docentes y administradores"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['teacher', 'admin']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso al admin o al profesor dueño de la lección/pregunta"""

    def has_permission(self, request, view):
        # Permite que admin o teacher autenticado accedan al endpoint
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['teacher', 'admin']
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        # 👑 Admin siempre puede
        if user.role == 'admin':
            return True

        # 🧑‍🏫 Teacher puede si es dueño de la lección o de la pregunta
        if user.role == 'teacher':
            # Si el objeto es una lección
            if hasattr(obj, 'teacher') and obj.teacher == user:
                return True
            # Si el objeto es una pregunta con una lección asociada
            if hasattr(obj, 'lesson') and getattr(obj.lesson, 'teacher', None) == user:
                return True

        return False


class IsQuestionOwnerOrAdmin(permissions.BasePermission):
    """Permite acceso al admin o al profesor dueño de la lección de la pregunta"""

    def has_permission(self, request, view):
        # Permite que admin o teacher autenticado accedan al endpoint
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['teacher', 'admin']
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        # 👑 Admin siempre puede
        if user.role == 'admin':
            return True

        # 🧑‍🏫 Teacher puede si es dueño de la lección de la pregunta
        if user.role == 'teacher':
            # Verificar que la pregunta pertenezca a una lección del profesor
            if hasattr(obj, 'lesson') and obj.lesson.teacher == user:
                return True

        return False