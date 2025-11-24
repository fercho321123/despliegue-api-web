
# from rest_framework import serializers
# from django.contrib.auth.password_validation import validate_password
# from .models import User


# # ----------------------------
# # Main user serializer (for listing, editing, etc.)
# # ----------------------------
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'role', 'avatar', 'grade', 'subject_area']
#         read_only_fields = ['id']


# # ----------------------------
# # Registration serializer (for public or admin registration)
# # ----------------------------
# # usuarios/serializers.py (fragmento dentro de RegistrationSerializer)
# class RegistrationSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'password', 'role']
#         read_only_fields = ['id']

#     def validate_username(self, value):
#         if User.objects.filter(username=value).exists():
#             raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
#         return value

#     def validate_email(self, value):
#         if User.objects.filter(email=value).exists():
#             raise serializers.ValidationError("Este correo ya está registrado.")
#         return value

#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password'],
#             role=validated_data.get('role', 'student')
#         )
#         return user

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer principal para usuarios"""
    avatar_url = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'avatar', 'avatar_url', 
            'grade', 'subject_area', 'is_active', 'created_at','telefono1'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def validate(self, data):
        """Validación según el rol"""
        role = data.get('role', getattr(self.instance, 'role', None))
        
        if role == 'student' and not data.get('grade') and not getattr(self.instance, 'grade', None):
            raise serializers.ValidationError({
                'grade': 'Los estudiantes deben tener un grado asignado.'
            })
        
        if role == 'teacher' and not data.get('subject_area') and not getattr(self.instance, 'subject_area', None):
            raise serializers.ValidationError({
                'subject_area': 'Los docentes deben tener un área asignada.'
            })
        
        # Limpiar campos innecesarios según rol
        if role == 'admin':
            data['grade'] = None
            data['subject_area'] = None
        elif role == 'student':
            data['subject_area'] = None
        elif role == 'teacher':
            data['grade'] = None
            
        return data


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuarios"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'grade', 'subject_area','telefono'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value.lower()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden.'
            })
        
        # Validación según rol
        role = data.get('role', 'student')
        
        if role == 'student' and not data.get('grade'):
            raise serializers.ValidationError({
                'grade': 'Los estudiantes deben tener un grado asignado.'
            })
        
        if role == 'teacher' and not data.get('subject_area'):
            raise serializers.ValidationError({
                'subject_area': 'Los docentes deben tener un área asignada.'
            })
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            grade=validated_data.get('grade'),
            subject_area=validated_data.get('subject_area'),
            telefono=validated_data.get('grade')
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambio de contraseña"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, validators=[validate_password], write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Las contraseñas no coinciden.'
            })
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('La contraseña actual es incorrecta.')
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer para recuperación de contraseña"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('No existe un usuario con este correo.')
        return value.lower()