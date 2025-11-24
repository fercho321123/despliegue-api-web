# 🤖 Chatbot Educativo - Django + React + PostgreSQL

Sistema educativo con IA integrada (OpenAI) desplegado en AWS.

## 🏗️ Arquitectura

- **Backend**: Django 5.2 + DRF + JWT
- **Frontend**: React 18 + TypeScript + Material-UI
- **Base de Datos**: PostgreSQL 15
- **IA**: OpenAI GPT-4o-mini
- **Cloud**: AWS (Elastic Beanstalk + RDS + S3 + CloudFront)

---

## 📋 Requisitos Previos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Cuenta AWS
- Git

---

## 🚀 Instalación Local

### 1. Clonar repositorio
```bash
git clone https://github.com/TU-USUARIO/TU-REPO.git
cd TU-REPO
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# ✏️ Editar .env con tus credenciales locales
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# ✏️ Editar .env.local si es necesario
npm start
```

Accede a: http://localhost:3000

---

## ☁️ Despliegue en AWS

### Paso 1: Base de Datos RDS
1. Crear instancia PostgreSQL 15
2. Anotar endpoint: `xxxx.us-east-1.rds.amazonaws.com`
3. Configurar Security Group (puerto 5432)

### Paso 2: Backend Elastic Beanstalk
```bash
cd backend
pip install -r requirements-production.txt
python manage.py collectstatic --noinput

# Crear ZIP (sin venv)
zip -r app.zip . -x "venv/*" "*.pyc" "__pycache__/*" ".git/*"

# Subir app.zip a Elastic Beanstalk Console
```

**Variables de entorno en EB:**
```
SECRET_KEY=valor-seguro
DEBUG=False
RDS_DB_NAME=chatbot_db
RDS_USERNAME=postgres
RDS_PASSWORD=xxxxx
RDS_HOSTNAME=xxxxx.rds.amazonaws.com
RDS_PORT=5432
ALLOWED_HOST=tu-app.elasticbeanstalk.com
FRONTEND_URL=https://xxxxx.cloudfront.net
OPENAI_API_KEY=sk-proj-xxxxx
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=xxxxx
```

### Paso 3: Frontend S3 + CloudFront
```bash
cd frontend

# Editar .env.production con URL del backend
REACT_APP_API_URL=https://tu-backend.elasticbeanstalk.com/api

npm run build

# Subir a S3
aws s3 sync build/ s3://tu-bucket-frontend --delete

# Configurar CloudFront con origen S3
```

---

## 🔐 Seguridad

- IAM roles configurados
- Security Groups restrictivos
- HTTPS obligatorio
- CORS configurado
- JWT con refresh tokens

---

## 🧪 Testing
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

---

## 👥 Equipo

- [Tu Nombre]
- [Nombre Compañero]

---

## 📄 Licencia

MIT