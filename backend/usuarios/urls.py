

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt import views as jwt_views

# from .views import (
#     RegistrationView,
#     LoginView,
#     LogoutView,
#     UserViewSet,
#     ChangePasswordView,
#     PasswordResetView,
#     AvatarUpdateView,
#     get_me,  # 👈 Importamos la nueva vista
# )

# # 🔹 Rutas del ViewSet de usuarios (solo para admin)
# router = DefaultRouter()
# router.register(r'admin/users', UserViewSet, basename='users')

# urlpatterns = [
#     # -------------------------
#     # 🔐 Autenticación y registro
#     # -------------------------
#     path('auth/register/', RegistrationView.as_view(), name='register'),
#     path('auth/login/', LoginView.as_view(), name='login'),
#     path('auth/logout/', LogoutView.as_view(), name='logout'),

#     # -------------------------
#     # 🔑 Gestión de contraseñas
#     # -------------------------
#     path('auth/password/change/', ChangePasswordView.as_view(), name='change-password'),
#     path('auth/password/reset/', PasswordResetView.as_view(), name='reset-password'),
#     path('auth/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

#     # -------------------------
#     # 👤 Perfil del usuario autenticado
#     # -------------------------
#     path('me/', get_me, name='get-me'),  # 👈 NUEVA RUTA

#     # -------------------------
#     # 🖼️ Actualizar avatar
#     # -------------------------
#     path('avatar/', AvatarUpdateView.as_view(), name='avatar-update'),

#     # -------------------------
#     # ⚙️ CRUD de usuarios (solo admin)
#     # -------------------------
#     path('', include(router.urls)),
# ]


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views

from .views import (
    RegistrationView,
    LoginView,
    LogoutView,
    UserViewSet,
    ChangePasswordView,
    PasswordResetView,
    AvatarUpdateView,
    get_me,
    update_me,           # 👈 NUEVO
    verify_token,        # 👈 NUEVO
    user_stats,          # 👈 NUEVO
    list_avatars,        # 👈 NUEVO
)

# Rutas del ViewSet de usuarios (solo para admin)
router = DefaultRouter()
router.register(r'admin/users', UserViewSet, basename='users')

urlpatterns = [
    # -------------------------
    # 🔐 Autenticación y registro
    # -------------------------
    path('auth/register/', RegistrationView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # -------------------------
    # 🔑 Gestión de tokens JWT
    # -------------------------
    path('auth/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', verify_token, name='token_verify'),  # 👈 NUEVO

    # -------------------------
    # 🔒 Gestión de contraseñas
    # -------------------------
    path('auth/password/change/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/password/reset/', PasswordResetView.as_view(), name='reset-password'),

    # -------------------------
    # 👤 Perfil del usuario autenticado
    # -------------------------
    path('me/', get_me, name='get-me'),
    path('me/update/', update_me, name='update-me'),  # 👈 NUEVO

    # -------------------------
    # 🖼️ Gestión de avatares
    # -------------------------
    path('avatar/', AvatarUpdateView.as_view(), name='avatar-update'),
    path('avatars/', list_avatars, name='list-avatars'),  # 👈 NUEVO

    # -------------------------
    # 📊 Estadísticas (solo admin)
    # -------------------------
    path('admin/stats/', user_stats, name='user-stats'),  # 👈 NUEVO

    # -------------------------
    # ⚙️ CRUD de usuarios (solo admin)
    # -------------------------
    path('', include(router.urls)),
]