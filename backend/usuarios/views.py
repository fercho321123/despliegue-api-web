
# from rest_framework import viewsets, generics, permissions, status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import get_user_model, authenticate
# from .serializers import UserSerializer, RegistrationSerializer
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import api_view, permission_classes
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils.crypto import get_random_string
# from django.core.exceptions import ValidationError
# from PIL import Image
# import os

# User = get_user_model()

# # ------------------------
# # Registro público
# # ------------------------
# class RegistrationView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = RegistrationSerializer
#     permission_classes = [permissions.AllowAny]

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if not serializer.is_valid():
#             print("❌ Error de registro:", serializer.errors)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         self.perform_create(serializer)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)


# # ------------------------
# # Login
# # ------------------------
# class LoginView(generics.GenericAPIView):
#     permission_classes = [permissions.AllowAny]
#     serializer_class = UserSerializer

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(username=username, password=password)
#         if user:
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user': UserSerializer(user).data
#             })
#         return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


# # ------------------------
# # Logout
# # ------------------------
# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             refresh_token = request.data.get("refresh")
#             if not refresh_token:
#                 return Response({"error": "Se requiere el token de refresco"}, status=status.HTTP_400_BAD_REQUEST)

#             token = RefreshToken(refresh_token)
#             token.blacklist()

#             return Response({"message": "Sesión cerrada correctamente."}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# # ------------------------
# # Users CRUD
# # ------------------------
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role == 'admin':
#             return User.objects.all()
#         elif user.role == 'teacher':
#             return User.objects.filter(role='student')
#         return User.objects.filter(id=user.id)

#     def create(self, request, *args, **kwargs):
#         user = request.user
#         if user.role != 'admin':
#             return Response(
#                 {"error": "Solo el administrador puede crear usuarios."},
#                 status=status.HTTP_403_FORBIDDEN
#             )

#         reg_serializer = RegistrationSerializer(data=request.data)
#         if not reg_serializer.is_valid():
#             print("❌ Error al crear usuario desde admin:", reg_serializer.errors)
#             return Response(reg_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         new_user = reg_serializer.save()
#         user_serializer = UserSerializer(new_user)
#         return Response(user_serializer.data, status=status.HTTP_201_CREATED)


# # ------------------------
# # Change password
# # ------------------------
# class ChangePasswordView(generics.UpdateAPIView):
#     queryset = User.objects.all()
#     permission_classes = [IsAuthenticated]

#     def update(self, request, *args, **kwargs):
#         user = request.user
#         old_password = request.data.get('old_password')
#         new_password = request.data.get('new_password')

#         if not user.check_password(old_password):
#             return Response({'error': 'Contraseña actual incorrecta'}, status=400)

#         user.set_password(new_password)
#         user.save()
#         return Response({'message': 'Contraseña cambiada correctamente'})


# # ------------------------
# # Password recovery
# # ------------------------
# class PasswordResetView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         email = request.data.get('email')
#         if not email:
#             return Response({"error": "El correo es obligatorio."}, status=400)

#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({"error": "No se encontró un usuario con ese correo."}, status=404)

#         new_password = get_random_string(length=10)
#         user.set_password(new_password)
#         user.save()

#         send_mail(
#             'Recuperación de contraseña',
#             f'Hola {user.username},\n\nTu nueva contraseña temporal es: {new_password}\n\nPor favor, cámbiala al iniciar sesión.',
#             settings.DEFAULT_FROM_EMAIL,
#             [email],
#             fail_silently=False,
#         )

#         return Response({"message": "Se envió un correo con una nueva contraseña temporal."})


# # ------------------------
# # Avatar Update
# # ------------------------
# class AvatarUpdateView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def put(self, request):
#         print("Request data:", request.data)
#         print("Request.FILES:", request.FILES)

#         user = request.user
#         avatar_url = request.data.get('avatar')

#         if not avatar_url:
#             raise ValidationError("No se proporcionó un avatar válido.")

#         if avatar_url.startswith("/media/"):
#             avatar_url = avatar_url.replace("/media/", "")

#         avatar_path = os.path.join(settings.MEDIA_ROOT, avatar_url)
#         if not os.path.exists(avatar_path):
#             raise ValidationError(f"El avatar '{avatar_url}' no se encuentra en la carpeta de avatares.")

#         user.avatar = avatar_url
#         user.save()

#         return Response({"avatar": user.avatar.url if user.avatar else None}, status=200)


# # ------------------------
# # Perfil del usuario autenticado (/api/usuarios/me/)
# # ------------------------
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_me(request):
#     """Devuelve los datos del usuario autenticado"""
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)





# from rest_framework import viewsets, generics, permissions, status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes, action
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.exceptions import TokenError
# from django.contrib.auth import get_user_model, authenticate
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils.crypto import get_random_string
# from django.core.exceptions import ValidationError
# from django.db import transaction
# from django_filters.rest_framework import DjangoFilterBackend
# import logging

# from .serializers import (
#     UserSerializer, 
#     RegistrationSerializer,
#     ChangePasswordSerializer,
#     PasswordResetSerializer
# )
# from .permissions import IsAdminUser, IsTeacherOrAdmin

# User = get_user_model()
# logger = logging.getLogger(__name__)



from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.exceptions import ValidationError
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend  # 👈 AGREGAR ESTO
import logging

from .serializers import (
    UserSerializer, 
    RegistrationSerializer,
    ChangePasswordSerializer,
    PasswordResetSerializer
)
from .permissions import IsAdminUser, IsTeacherOrAdmin

User = get_user_model()
logger = logging.getLogger(__name__)

class RegistrationView(generics.CreateAPIView):
    """Registro público de usuarios"""
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Intento de registro fallido: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user = serializer.save()
            logger.info(f"Usuario registrado: {user.username} ({user.role})")
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Inicio de sesión"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        
        if not username or not password:
            return Response(
                {'error': 'Usuario y contraseña son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            logger.warning(f"Intento de login fallido para: {username}")
            return Response(
                {'error': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Esta cuenta está desactivada.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        logger.info(f"Login exitoso: {user.username}")
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user, context={'request': request}).data
        })


class LogoutView(APIView):
    """Cierre de sesión"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response(
                    {"error": "Se requiere el token de refresco."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"Logout exitoso: {request.user.username}")
            return Response(
                {"message": "Sesión cerrada correctamente."},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            return Response(
                {"error": "Token inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error en logout: {str(e)}")
            return Response(
                {"error": "Error al cerrar sesión."},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """CRUD de usuarios - Solo para administradores"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # 👇 AGREGAR FILTROS Y BÚSQUEDA
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'grade', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username', 'role']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return User.objects.all()
        elif user.role == 'teacher':
            return User.objects.filter(role='student')
        
        return User.objects.filter(id=user.id)

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdminUser()]
        elif self.action in ['update', 'partial_update']:
            return [IsTeacherOrAdmin()]
        return [permissions.IsAuthenticated()]
    def create(self, request, *args, **kwargs):
        reg_serializer = RegistrationSerializer(data=request.data)
        
        if not reg_serializer.is_valid():
            logger.warning(f"Error al crear usuario: {reg_serializer.errors}")
            return Response(
                reg_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            new_user = reg_serializer.save()
            logger.info(f"Usuario creado por admin: {new_user.username}")

        user_serializer = UserSerializer(new_user, context={'request': request})
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        """Activar/desactivar usuario"""
        user = self.get_object()
        
        if user.role == 'admin' and user.id != request.user.id:
            return Response(
                {'error': 'No puedes desactivar a otro administrador.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user.is_active = not user.is_active
        user.save()
        
        logger.info(f"Usuario {'activado' if user.is_active else 'desactivado'}: {user.username}")
        
        return Response(UserSerializer(user, context={'request': request}).data)


class ChangePasswordView(generics.UpdateAPIView):
    """Cambio de contraseña para usuarios autenticados"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        logger.info(f"Contraseña cambiada: {user.username}")
        
        return Response({
            'message': 'Contraseña cambiada correctamente.'
        }, status=status.HTTP_200_OK)

class PasswordResetView(generics.GenericAPIView):
    """Recuperación de contraseña por email"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email__iexact=email)
            new_password = get_random_string(length=12)
            user.set_password(new_password)
            user.save()

            try:
                send_mail(
                    subject='Recuperación de contraseña',
                    message=f'Hola {user.first_name or user.username},\n\n'
                            f'Tu nueva contraseña temporal es: {new_password}\n\n'
                            f'Por favor, cámbiala al iniciar sesión.\n\n'
                            f'Si no solicitaste este cambio, contacta al administrador.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                logger.info(f"Contraseña recuperada para: {user.username}")
                
                return Response({
                    'message': 'Se envió un correo con una nueva contraseña temporal.'
                }, status=status.HTTP_200_OK)
                
            except Exception as email_error:
                # Si falla el envío de correo, revertir el cambio de contraseña
                logger.error(f"Error al enviar correo de recuperación: {str(email_error)}")
                
                # En desarrollo, devolver la contraseña directamente (SOLO PARA DEBUG)
                if settings.DEBUG:
                    return Response({
                        'message': 'Error al enviar correo. (Modo desarrollo)',
                        'debug_password': new_password,  # SOLO EN DEBUG
                        'error': str(email_error)
                    }, status=status.HTTP_200_OK)
                
                return Response(
                    {'error': 'Error al enviar el correo. Verifica la configuración del servidor.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        except User.DoesNotExist:
            # No revelar si el email existe o no (seguridad)
            return Response({
                'message': 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error en recuperación de contraseña: {str(e)}")
            return Response(
                {'error': 'Error al procesar la solicitud.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class AvatarUpdateView(APIView):
    """Actualizar avatar del usuario"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        user = request.user
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response(
                {'error': 'No se proporcionó ningún archivo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tipo de archivo
        valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
        ext = avatar_file.name.split('.')[-1].lower()
        
        if ext not in valid_extensions:
            return Response(
                {'error': f'Formato no válido. Use: {", ".join(valid_extensions)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tamaño (máx 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'El archivo no debe superar 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminar avatar anterior si existe
        if user.avatar:
            user.avatar.delete(save=False)
        
        user.avatar = avatar_file
        user.save()
        
        logger.info(f"Avatar actualizado: {user.username}")
        
        return Response({
            'avatar': request.build_absolute_uri(user.avatar.url)
        }, status=status.HTTP_200_OK)
    
    def delete(self, request):
        """Eliminar avatar"""
        user = request.user
        
        if user.avatar:
            user.avatar.delete()
            user.save()
            logger.info(f"Avatar eliminado: {user.username}")
        
        return Response({'message': 'Avatar eliminado.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_me(request):
    """Devuelve los datos del usuario autenticado"""
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)


# ------------------------
# Actualizar perfil propio
# ------------------------
@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_me(request):
    """Actualizar el perfil del usuario autenticado"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        # No permitir cambiar el rol a sí mismo
        if 'role' in request.data and request.data['role'] != user.role:
            return Response(
                {'error': 'No puedes cambiar tu propio rol.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
        logger.info(f"Perfil actualizado: {user.username}")
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------------
# Verificar token JWT
# ------------------------
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_token(request):
    """Verificar si un token JWT es válido"""
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'error': 'Token requerido.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        AccessToken(token)
        return Response({'valid': True, 'message': 'Token válido.'})
    except TokenError:
        return Response(
            {'valid': False, 'error': 'Token inválido o expirado.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


# ------------------------
# Estadísticas de usuarios (solo admin)
# ------------------------
from django.db.models import Count

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Obtener estadísticas de usuarios"""
    if request.user.role != 'admin':
        return Response(
            {'error': 'No tienes permisos para ver estadísticas.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    stats = {
        'total': User.objects.count(),
        'active': User.objects.filter(is_active=True).count(),
        'inactive': User.objects.filter(is_active=False).count(),
        'by_role': User.objects.values('role').annotate(count=Count('id')),
        'students_by_grade': User.objects.filter(role='student').values('grade').annotate(count=Count('id')),
    }
    
    return Response(stats)


# ------------------------
# Listar avatares disponibles
# ------------------------
import os

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def list_avatars(request):
    """Listar todos los avatares disponibles en /media/avatars/"""
    avatars_path = os.path.join(settings.MEDIA_ROOT, 'avatars')
    
    if not os.path.exists(avatars_path):
        return Response({'avatars': []})
    
    avatars = []
    for filename in os.listdir(avatars_path):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
            avatar_url = request.build_absolute_uri(
                os.path.join(settings.MEDIA_URL, 'avatars', filename)
            )
            avatars.append({
                'name': filename,
                'url': avatar_url
            })
    
    return Response({'avatars': avatars})