

from pathlib import Path
from dotenv import load_dotenv
import os
from datetime import timedelta
import warnings

# ------------------------
# Variables de entorno
# ------------------------
load_dotenv()

# ------------------------
# Paths
# ------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------
# Seguridad
# ------------------------
SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*'] if DEBUG else os.getenv('ALLOWED_HOSTS', '').split(',')

# ------------------------
# Aplicaciones instaladas
# ------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    
    # Django extensions
    'django_extensions',
    'django_filters',
    
    # JWT Blacklist
    'rest_framework_simplejwt.token_blacklist',

    # Terceros
    'rest_framework',
    'corsheaders',

    # Apps propias
    'usuarios',
    'ejercicios',
    'chatbot',  # Chatbot / AI assistant
]

# ------------------------
# Middleware
# ------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # debe ir primero
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# ------------------------
# Plantillas
# ------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ------------------------
# WSGI
# ------------------------
WSGI_APPLICATION = 'core.wsgi.application'

# ------------------------
# Base de datos PostgreSQL
# ------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'chatbot_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ------------------------
# Validación de contraseñas
# ------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ------------------------
# Internacionalización
# ------------------------
LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

# ------------------------
# Archivos estáticos y media
# ------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ------------------------
# Modelo de usuario personalizado
# ------------------------
AUTH_USER_MODEL = 'usuarios.User'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ------------------------
# Django REST Framework
# ------------------------
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

# ------------------------
# Simple JWT Configuration
# ------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'UPDATE_LAST_LOGIN': True,
}

# ------------------------
# CORS Configuration
# ------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# ------------------------
# Email Configuration
# ------------------------
EMAIL_HOST_USER = os.getenv('EMAIL_USER', 'lauracatalinacastiblancogomez@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_PASSWORD', 'mwxqrnohhqlltuyk')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
SERVER_EMAIL = EMAIL_HOST_USER

# Configuración SMTP - siempre enviar correos reales
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# ------------------------
# OpenAI Configuration
# ------------------------
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_DEFAULT_MODEL = os.getenv('OPENAI_DEFAULT_MODEL', 'gpt-4o-mini')
OPENAI_MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', '800'))
OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))

# Validación: advertir si no está configurada
if not OPENAI_API_KEY:
    warnings.warn("⚠️  OPENAI_API_KEY no está configurada en el archivo .env")

# ------------------------
# Logging Configuration
# ------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',  # 👈 Cambié a DEBUG
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {  # 👈 NUEVO - para ver errores de requests
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'usuarios': {
            'handlers': ['console'],
            'level': 'DEBUG',  # 👈 Cambié a DEBUG
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',  # 👈 Cambié a DEBUG
    },
}

# ------------------------
# Security Settings (para producción)
# ------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True



# ========================================
# CONFIGURACIÓN AWS / PRODUCCIÓN
# ========================================
import os

# Detectar si está en AWS
IS_AWS = 'RDS_HOSTNAME' in os.environ

if IS_AWS or not DEBUG:
    print("🚀 Ejecutando en modo PRODUCCIÓN (AWS)")
    
    # Base de datos RDS
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('RDS_DB_NAME'),
            'USER': os.environ.get('RDS_USERNAME'),
            'PASSWORD': os.environ.get('RDS_PASSWORD'),
            'HOST': os.environ.get('RDS_HOSTNAME'),
            'PORT': os.environ.get('RDS_PORT', '5432'),
            'OPTIONS': {
            'sslmode': 'require', # <--- ¡Asegúrate de que esta línea esté allí!
        }
        }
    }
    
    # Hosts permitidos
    ALLOWED_HOSTS = [
        '.elasticbeanstalk.com',
        '.cloudfront.net',
        os.environ.get('ALLOWED_HOST', ''),
    ]
    
    # CORS para producción
    CORS_ALLOWED_ORIGINS = [
        os.environ.get('FRONTEND_URL', ''),
    ]
    
    # Agregar WhiteNoise para servir archivos estáticos
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Seguridad HTTPS
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    
    # CSRF para CloudFront y Elastic Beanstalk
    CSRF_TRUSTED_ORIGINS = [
        'https://*.elasticbeanstalk.com',
        'https://*.cloudfront.net',
    ]
else:
    print("💻 Ejecutando en modo DESARROLLO (local)")