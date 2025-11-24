# 🤖 Chatbot Educativo - Django + React + PostgreSQL

Sistema educativo con IA integrada (OpenAI GPT-4o-mini) desplegado en AWS.

---

## 🎉 ¡Proyecto Subido Exitosamente a GitHub!

### ✅ Confirmación del Despliegue
```
✓ 125 objetos escritos
✓ 280.83 KiB subidos  
✓ Rama main actualizada
✓ Working tree limpio
```

**Repositorio:** [https://github.com/lauracast000009/proyectoFinal](https://github.com/lauracast000009/proyectoFinal)

---

## 📨 Instrucciones para el Compañero de Equipo

### 🚀 Inicio Rápido
```bash
# Clonar proyecto
git clone https://github.com/lauracast000009/proyectoFinal.git
cd proyectoFinal
```

### 📋 Archivos Clave para AWS

- ✅ `README.md` - Instrucciones completas
- ✅ `backend/.env.example` - Variables de entorno documentadas
- ✅ `backend/.ebextensions/` - Configuración Elastic Beanstalk
- ✅ `backend/Procfile` - Comando de inicio Gunicorn
- ✅ `backend/requirements-production.txt` - Dependencias AWS
- ✅ `backend/create_superuser.py` - Script automático de admin

### ⚠️ Antes de Desplegar en AWS

1. **Leer este README completo** (especialmente sección de Despliegue AWS)
2. **Crear archivo `.env`** desde `.env.example` con **CREDENCIALES REALES**
3. **NO usar** las credenciales del `.env` local (no están en el repo)
4. **Obtener propias API keys:** OpenAI, Gmail App Password, etc.

### 🔐 Seguridad Importante

- ❌ NO uses credenciales compartidas por WhatsApp/Email
- ✅ Crea tu propia OpenAI API Key
- ✅ Configura tu propia base de datos RDS
- ✅ Genera tu propio SECRET_KEY de Django

---

## 🏗️ Arquitectura del Sistema

- **Backend**: Django 5.2 + Django REST Framework + JWT
- **Frontend**: React 18 + TypeScript + Material-UI  
- **Base de Datos**: PostgreSQL 15
- **IA**: OpenAI GPT-4o-mini
- **Cloud**: AWS (Elastic Beanstalk + RDS + S3 + CloudFront)

### 📊 Diagrama de Arquitectura AWS
```
┌─────────────────────────────────────────┐
│          Usuario Final                   │
└─────────────────┬───────────────────────┘
                  │
         ┌────────▼─────────┐
         │   CloudFront     │ (CDN - Distribución global)
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   S3 Bucket      │ (Frontend React estático)
         └──────────────────┘
                  │
                  │ API REST Calls
                  │
         ┌────────▼─────────┐
         │ Elastic Beanstalk│ (Backend Django + Gunicorn)
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   RDS PostgreSQL │ (Base de Datos)
         └──────────────────┘
                  │
         ┌────────▼─────────┐
         │   OpenAI API     │ (Chatbot IA)
         └──────────────────┘
```

---

## 📋 Requisitos Previos

### Desarrollo Local
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Despliegue AWS
- Cuenta AWS activa (con tarjeta de crédito)
- AWS CLI configurado
- Credenciales IAM con permisos necesarios

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar Repositorio
```bash
git clone https://github.com/lauracast000009/proyectoFinal.git
cd proyectoFinal
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Windows:
copy .env.example .env
# Linux/Mac:
cp .env.example .env

# ✏️ IMPORTANTE: Editar .env con tus credenciales locales
# Abrir archivo .env y completar:
# - SECRET_KEY
# - DB_PASSWORD  
# - OPENAI_API_KEY
# - EMAIL_PASSWORD

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

**Backend corriendo en:** http://127.0.0.1:8000

### 3. Configurar Frontend
```bash
# En otra terminal
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Windows:
copy .env.example .env.local
# Linux/Mac:
cp .env.example .env.local

# Iniciar aplicación
npm start
```

**Frontend corriendo en:** http://localhost:3000

### 4. Verificar Funcionamiento Local

- ✅ Acceder a http://localhost:3000
- ✅ Crear cuenta de usuario
- ✅ Iniciar sesión
- ✅ Probar chatbot
- ✅ Verificar admin en http://127.0.0.1:8000/admin

---

## ☁️ Despliegue en AWS (Para el Compañero)

### 🗄️ PASO 1: Crear Base de Datos RDS PostgreSQL

#### A) Crear Instancia RDS

1. **Ir a AWS Console → RDS → Create database**

2. **Configuración básica:**
   - Engine: **PostgreSQL 15**
   - Template: **Free tier** (o Dev/Test según presupuesto)
   - DB instance identifier: `chatbot-db`
   - Master username: `postgres`
   - Master password: **(anotar en lugar seguro)**

3. **Configuración de instancia:**
   - DB instance class: `db.t3.micro` (Free tier)
   - Storage: 20 GB SSD

4. **Conectividad:**
   - VPC: Default VPC
   - Public access: **Yes** (para pruebas - cambiar a No en producción)
   - VPC security group: Crear nuevo → `chatbot-rds-sg`

5. **Configuración adicional:**
   - Initial database name: `chatbot_db`

#### B) Configurar Security Group

1. **Ir a EC2 → Security Groups → chatbot-rds-sg**
2. **Editar Inbound Rules:**
   - Type: PostgreSQL
   - Port: 5432
   - Source: **(Agregar después el Security Group de Elastic Beanstalk)**

#### C) Anotar Datos de Conexión
```
Endpoint: chatbot-db.xxxxx.us-east-1.rds.amazonaws.com
Port: 5432
Database: chatbot_db
Username: postgres
Password: [tu-password]
```

---

### 🖥️ PASO 2: Desplegar Backend en Elastic Beanstalk

#### A) Preparar Aplicación
```bash
cd backend

# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias de producción
pip install -r requirements-production.txt

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Crear archivo ZIP (SIN incluir venv)
# Windows (PowerShell):
Compress-Archive -Path * -DestinationPath app.zip -Exclude venv,*.pyc,__pycache__,.git,logs,*.log

# Linux/Mac:
zip -r app.zip . -x "venv/*" "*.pyc" "__pycache__/*" ".git/*" "*.log" "logs/*" "*.sqlite3"
```

#### B) Crear Aplicación en Elastic Beanstalk

1. **Ir a AWS Console → Elastic Beanstalk → Create application**

2. **Configuración de aplicación:**
   - Application name: `chatbot-backend`
   - Platform: **Python 3.11 on Amazon Linux 2023**
   - Application code: **Upload your code**
   - Version label: `v1.0`
   - Upload: Seleccionar `app.zip`

3. **Configure more options (antes de crear):**
   - Presets: **Single instance** (Free tier)
   - Software → Edit → Environment properties

#### C) Configurar Variables de Entorno

En **Configuration → Software → Environment properties**, agregar estas variables:
```bash
# Django Core
SECRET_KEY=genera-valor-aleatorio-50-caracteres-usar-generador-online
DEBUG=False

# Base de Datos RDS
RDS_DB_NAME=chatbot_db
RDS_USERNAME=postgres
RDS_PASSWORD=tu-password-rds-del-paso-1
RDS_HOSTNAME=chatbot-db.xxxxx.us-east-1.rds.amazonaws.com
RDS_PORT=5432

# URLs (actualizar después con URLs reales)
ALLOWED_HOST=tu-app.elasticbeanstalk.com
FRONTEND_URL=https://xxxxx.cloudfront.net

# OpenAI (obtener tu propia key en platform.openai.com)
OPENAI_API_KEY=sk-proj-tu-key-personal
OPENAI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=800
OPENAI_TEMPERATURE=0.7

# Email Gmail (crear App Password en Google Account)
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-app-password-16-caracteres

# Superuser Automático (para crear admin al desplegar)
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=password-seguro-cambiar-despues
```

#### D) Actualizar Security Groups

1. **Ir a EC2 → Security Groups**
2. **Buscar el Security Group de Elastic Beanstalk** (nombre similar a `awseb-e-...`)
3. **Copiar su ID** (sg-xxxxxxxxx)
4. **Ir al Security Group de RDS** (`chatbot-rds-sg`)
5. **Editar Inbound Rules:**
   - Type: PostgreSQL
   - Port: 5432
   - Source: **[ID del Security Group de EB]**

#### E) Verificar Despliegue

- **URL del backend:** `http://tu-app.elasticbeanstalk.com`
- **API Root:** `http://tu-app.elasticbeanstalk.com/api/`
- **Admin:** `http://tu-app.elasticbeanstalk.com/admin`
- **Health:** `http://tu-app.elasticbeanstalk.com/health` (si configuraste el endpoint)

**Ver logs en CloudWatch:**
- CloudWatch → Log groups → `/aws/elasticbeanstalk/chatbot-backend-env/`

---

### 🌐 PASO 3: Desplegar Frontend en S3 + CloudFront

#### A) Preparar Build de Producción
```bash
cd frontend

# Crear/editar archivo .env.production con URL REAL del backend
# Windows (PowerShell):
echo "REACT_APP_API_URL=http://tu-app.elasticbeanstalk.com/api" > .env.production

# Linux/Mac:
echo "REACT_APP_API_URL=http://tu-app.elasticbeanstalk.com/api" > .env.production

# Generar build optimizado
npm run build
```

#### B) Crear Bucket S3

1. **Ir a AWS Console → S3 → Create bucket**

2. **Configuración:**
   - Bucket name: `chatbot-frontend-[tu-nombre-unico]`
   - Region: `us-east-1`
   - **Desmarcar** "Block all public access"
   - Confirmar que el bucket será público

3. **Habilitar Static Website Hosting:**
   - Properties → Static website hosting → **Enable**
   - Index document: `index.html`
   - Error document: `index.html`

4. **Configurar Bucket Policy:**
   - Permissions → Bucket policy → Edit
   - Pegar esta política (reemplazar BUCKET-NAME):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::chatbot-frontend-[tu-nombre]/*"
    }
  ]
}
```

#### C) Subir Archivos Build

**Opción 1: AWS CLI**
```bash
aws s3 sync build/ s3://chatbot-frontend-[tu-nombre] --delete
```

**Opción 2: Consola Web**
- Ir al bucket → Upload
- Arrastrar toda la carpeta `build/`
- Upload

#### D) Crear Distribución CloudFront

1. **Ir a CloudFront → Create distribution**

2. **Configuración de origen:**
   - Origin domain: `chatbot-frontend-[tu-nombre].s3.us-east-1.amazonaws.com`
   - Origin access: **Public**

3. **Configuración de distribución:**
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: **GET, HEAD, OPTIONS**
   - Cache policy: **CachingOptimized**
   - Default root object: `index.html`

4. **Error pages (para React Router):**
   - Error pages → Create custom error response
   - HTTP error code: `403`
   - Customize error response: **Yes**
   - Response page path: `/index.html`
   - HTTP response code: `200`
   - Repetir para error code `404`

5. **Crear distribución** (tarda 10-15 minutos en desplegar)

6. **Anotar URL de CloudFront:**
   - Ejemplo: `https://d111111abcdef8.cloudfront.net`

#### E) Actualizar Variables de Backend

1. **Ir a Elastic Beanstalk → Configuration → Software**
2. **Editar variable:**
```
   FRONTEND_URL=https://d111111abcdef8.cloudfront.net
```
3. **Apply** (reinicia el entorno)

---

## 🔐 Configuración de Seguridad AWS

### IAM Roles
- **Elastic Beanstalk:** `aws-elasticbeanstalk-ec2-role`
- **S3 Access:** Políticas de solo lectura pública

### Security Groups Configurados
- **RDS:** Solo acepta conexiones del Security Group de EB (puerto 5432)
- **Elastic Beanstalk:** Acepta HTTP/HTTPS desde cualquier IP

### HTTPS y Certificados
- **CloudFront:** Certificado SSL automático de AWS
- **Elastic Beanstalk:** Opcional configurar certificado ACM para HTTPS

### CORS
- Configurado en `settings.py` para permitir solo el dominio de CloudFront

---

## 🧪 Testing

### Tests Backend
```bash
cd backend
python manage.py test
```

### Tests Frontend
```bash
cd frontend
npm test
```

---

## 🔍 Verificación Post-Despliegue

### Checklist de Funcionamiento

- [ ] **Backend:** Responde en `http://tu-app.elasticbeanstalk.com/api/`
- [ ] **Frontend:** Carga correctamente en CloudFront URL
- [ ] **Login:** Funciona crear cuenta e iniciar sesión
- [ ] **Chatbot:** Responde preguntas con OpenAI
- [ ] **Base de Datos:** RDS conectada y migraciones aplicadas
- [ ] **Admin:** Accesible en `/admin` con superuser
- [ ] **CORS:** Frontend puede hacer requests al backend
- [ ] **HTTPS:** CloudFront redirecciona HTTP a HTTPS

### URLs Finales Documentar
```
Frontend (CloudFront):        https://xxxxx.cloudfront.net
Backend (Elastic Beanstalk):  http://xxxxx.elasticbeanstalk.com
API Root:                     http://xxxxx.elasticbeanstalk.com/api/
Django Admin:                 http://xxxxx.elasticbeanstalk.com/admin
```

---

## 🆘 Solución de Problemas Comunes

### ❌ Backend no inicia en Elastic Beanstalk

**Síntomas:** Aplicación en estado "Severe" o "Degraded"

**Soluciones:**
1. **Revisar logs en CloudWatch:**
   - CloudWatch → Log groups → `/aws/elasticbeanstalk/`
   - Buscar errores de Python/Django

2. **Verificar variables de entorno:**
   - Configuration → Software
   - Asegurar que todas las variables están configuradas

3. **Comprobar Security Group de RDS:**
   - Debe permitir conexiones desde EB
   - Port 5432 abierto para el SG de EB

4. **Revisar que app.zip no incluya venv:**
```bash
   # Recrear sin venv
   zip -r app.zip . -x "venv/*"
```

---

### ❌ Frontend no conecta con Backend

**Síntomas:** Errores de CORS o "Network Error" en consola

**Soluciones:**
1. **Verificar CORS en backend:**
   - Archivo `settings.py`
   - `CORS_ALLOWED_ORIGINS` debe incluir URL de CloudFront

2. **Comprobar URL en frontend:**
   - Archivo `.env.production`
   - `REACT_APP_API_URL` debe apuntar a Elastic Beanstalk

3. **Revisar consola del navegador:**
   - F12 → Network tab
   - Ver detalles de requests fallidos

4. **Limpiar caché de CloudFront:**
   - CloudFront → Invalidations → Create invalidation
   - Object paths: `/*`

---

### ❌ Base de Datos no conecta

**Síntomas:** Errores "OperationalError" en logs

**Soluciones:**
1. **Verificar Security Group:**
```
   RDS Inbound Rule:
   Type: PostgreSQL
   Port: 5432
   Source: [Security Group ID de Elastic Beanstalk]
```

2. **Comprobar credenciales:**
   - Variables RDS_* en Elastic Beanstalk
   - Endpoint correcto
   - Password sin espacios extras

3. **Verificar que la instancia RDS está "Available":**
   - AWS Console → RDS → Databases
   - Estado debe ser verde

---

### ❌ OpenAI no responde

**Síntomas:** Chatbot no genera respuestas

**Soluciones:**
1. **Verificar API Key:**
   - Variable `OPENAI_API_KEY` en EB
   - Key válida en platform.openai.com

2. **Comprobar créditos en OpenAI:**
   - Cuenta debe tener saldo positivo

3. **Revisar logs de Django:**
   - Buscar errores de OpenAI en CloudWatch

---

## 📝 Entregables del Taller AWS

### 1. Documento PDF (Informe Técnico)

Debe incluir:

#### A) Portada
- Título del proyecto
- Nombres de integrantes
- Fecha de entrega

#### B) Diagrama de Arquitectura
- Diagrama visual de AWS (puedes usar el de este README)
- Descripción de cada servicio usado
- Flujo de datos entre componentes

#### C) Screenshots de AWS Console
- RDS: Instancia creada y running
- Elastic Beanstalk: Aplicación deployed
- S3: Bucket con archivos
- CloudFront: Distribución activa
- Security Groups: Reglas configuradas

#### D) Costos Estimados
- AWS Pricing Calculator: Costo mensual estimado
- Breakdown por servicio:
  - RDS: ~$15-20/mes (db.t3.micro)
  - Elastic Beanstalk: ~$10-15/mes (t2.micro)
  - S3: ~$1/mes
  - CloudFront: ~$1/mes
  - **Total: ~$27-37/mes**

#### E) Evidencia de Funcionamiento
- Screenshots de:
  - Frontend funcionando (CloudFront URL)
  - Backend respondiendo (API)
  - Login exitoso
  - Chatbot respondiendo
  - Admin de Django

#### F) Troubleshooting
- Problemas encontrados durante el despliegue
- Soluciones aplicadas

---

### 2. URLs Funcionales

Documento con:
```
Frontend (CloudFront):  https://xxxxx.cloudfront.net
Backend (EB):           http://xxxxx.elasticbeanstalk.com
API:                    http://xxxxx.elasticbeanstalk.com/api/
Admin:                  http://xxxxx.elasticbeanstalk.com/admin
Repositorio GitHub:     https://github.com/lauracast000009/proyectoFinal
```

---

### 3. Repositorio GitHub

- ✅ Código fuente completo
- ✅ README con instrucciones
- ✅ Archivos `.env.example`
- ✅ Configuración AWS (`.ebextensions/`)

---

### 4. Logs de CloudWatch

Screenshots mostrando:
- Logs de inicio de aplicación
- Requests HTTP exitosos
- Sin errores críticos

---

## 📚 Stack Tecnológico Completo

### Backend
- **Framework:** Django 5.2
- **API:** Django REST Framework 3.16
- **Auth:** Simple JWT
- **Base de Datos:** psycopg2-binary (PostgreSQL driver)
- **IA:** OpenAI Python SDK
- **Server:** Gunicorn
- **Static Files:** WhiteNoise

### Frontend
- **Framework:** React 18
- **Lenguaje:** TypeScript
- **UI:** Material-UI (MUI)
- **HTTP Client:** Axios
- **Routing:** React Router

### Infraestructura AWS
- **Compute:** Elastic Beanstalk (Python 3.11 on Amazon Linux 2023)
- **Database:** RDS PostgreSQL 15 (db.t3.micro)
- **Storage:** S3 (static hosting)
- **CDN:** CloudFront (HTTPS)
- **Monitoring:** CloudWatch
- **Security:** IAM, Security Groups, VPC

### Servicios Externos
- **IA:** OpenAI GPT-4o-mini
- **Email:** Gmail SMTP

---

## 👥 Equipo de Desarrollo

- **Laura Catalina Castiblanco** - Desarrollo Backend & Frontend
- **Brayan Fernando Jimenez Murcia** - DevOps & Despliegue AWS

---

## 📄 Licencia

MIT License

---

## 🎊 Estado del Proyecto

| Fase | Estado | Fecha |
|------|--------|-------|
| **Desarrollo Local** | ✅ Completado | 2025-01-XX |
| **Preparación AWS** | ✅ Completado | 2025-01-XX |
| **Despliegue AWS** | 🚧 En Progreso | 2025-01-XX |
| **Documentación Final** | ⏳ Pendiente | 2025-01-XX |

---

## 📞 Contacto y Soporte

**Repositorio GitHub:**  
[https://github.com/lauracast000009/proyectoFinal](https://github.com/lauracast000009/proyectoFinal)

**Reportar Issues:**  
[Abrir issue en GitHub](https://github.com/lauracast000009/proyectoFinal/issues)

**Email:**  
[tu-email@example.com]

---

## 🔄 Historial de Versiones

### v1.0.0 (2025-01-XX)
- ✅ Implementación completa del chatbot educativo
- ✅ Sistema de autenticación JWT
- ✅ CRUD de lecciones y preguntas
- ✅ Integración con OpenAI GPT-4o-mini
- ✅ Preparación para despliegue AWS
- ✅ Documentación completa

---

**Última actualización:** 2025-01-XX  
**Versión actual:** 1.0.0  
**Rama principal:** main