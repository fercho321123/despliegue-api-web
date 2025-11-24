
from openai import OpenAI
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Inicializar cliente de OpenAI
client = None
if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    logger.info("✅ Cliente de OpenAI inicializado")
else:
    logger.warning("⚠️  OPENAI_API_KEY no configurada")


def ask_openai(
    user_message: str,
    system_prompt: str = None,
    conversation_history: list = None,
    lesson_context: dict = None,
    student_grade: str = None
):
    """
    Llama a la API de OpenAI con contexto mejorado.
    
    Args:
        user_message: El mensaje/pregunta del usuario
        system_prompt: Instrucciones del sistema (opcional)
        conversation_history: Historial de mensajes previos
        lesson_context: Contexto de la lección actual
        student_grade: Grado del estudiante para adaptar respuestas
    
    Returns:
        dict: {
            "text": "respuesta",
            "success": True/False,
            "error": None/"mensaje",
            "tokens_used": int,
            "model": "nombre del modelo"
        }
    """
    
    # Verificar configuración
    if not client:
        logger.error("Cliente de OpenAI no inicializado")
        return {
            "text": "El servicio de IA no está configurado. Contacta al administrador.",
            "success": False,
            "error": "OpenAI client not initialized"
        }
    
    # Configuración del modelo
    model = getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini')
    max_tokens = getattr(settings, 'OPENAI_MAX_TOKENS', 1000)
    temperature = getattr(settings, 'OPENAI_TEMPERATURE', 0.7)
    
    # Construir System Prompt Contextualizado
    if system_prompt is None:
        grade_info = ""
        if student_grade:
            grade_mapping = {
                '1': 'primero', '2': 'segundo', '3': 'tercero',
                '4': 'cuarto', '5': 'quinto', '6': 'sexto',
                '7': 'séptimo', '8': 'octavo', '9': 'noveno',
                '10': 'décimo', '11': 'once'
            }
            grade_name = grade_mapping.get(student_grade, student_grade)
            grade_info = f"El estudiante está en grado {grade_name}. "
        
        system_prompt = f"""Eres EduBot, un tutor educativo especializado para estudiantes de primaria y secundaria. {grade_info}

Tu objetivo es:
- Explicar conceptos de forma clara y adaptada al nivel del estudiante
- Usar ejemplos prácticos y relevantes para su edad
- Ser motivador y positivo en tus respuestas
- Fomentar el pensamiento crítico con preguntas guía
- Responder en español
- Mantener un tono amigable pero profesional

Formato de respuestas:
- Usa emojis relevantes para hacer la explicación más amena (📚 📝 ✨ 🎯 etc.)
- Estructura tus respuestas con saltos de línea para mejor lectura
- Si el tema es complejo, divide la explicación en pasos
- Incluye ejemplos cuando sea apropiado

Límites:
- No hagas la tarea por el estudiante, guíalo
- Si la pregunta no es educativa, redirige amablemente al tema de estudio
- No proporciones respuestas directas a exámenes o evaluaciones"""
    
    # Agregar contexto de lección
    if lesson_context:
        system_prompt += f"\n\n📚 CONTEXTO DE LA LECCIÓN ACTUAL:\n"
        system_prompt += f"• Título: {lesson_context.get('title', 'N/A')}\n"
        system_prompt += f"• Tema: {lesson_context.get('topic', 'N/A')}\n"
        system_prompt += f"• Grado: {lesson_context.get('grade', 'N/A')}\n"
        
        if lesson_context.get('description'):
            system_prompt += f"• Descripción: {lesson_context['description']}\n"
        
        system_prompt += (
            "\nTus respuestas deben estar relacionadas con esta lección. "
            "Si el estudiante pregunta algo fuera del tema, primero responde brevemente "
            "y luego guíalo de vuelta al tema de la lección."
        )
    
    # Construir array de mensajes
    messages = [{"role": "system", "content": system_prompt}]
    
    # Agregar historial (máximo últimos 10 para optimizar tokens)
    if conversation_history:
        messages.extend(conversation_history[-10:])
    
    # Agregar mensaje actual
    messages.append({"role": "user", "content": user_message})
    
    # Llamar a OpenAI
    try:
        logger.info(f"🤖 Llamando a {model}...")
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            frequency_penalty=0.5,
            presence_penalty=0.3
        )
        
        # Extraer respuesta
        if response and response.choices:
            text = response.choices[0].message.content.strip()
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            logger.info(f"✅ Respuesta de OpenAI ({tokens_used} tokens)")
            
            return {
                "text": text,
                "success": True,
                "error": None,
                "tokens_used": tokens_used,
                "model": model
            }
        else:
            logger.error("Respuesta vacía de OpenAI")
            return {
                "text": "No pude generar una respuesta. Por favor, intenta reformular.",
                "success": False,
                "error": "Empty response"
            }
    
    except Exception as e:
        error_msg = str(e)
        logger.exception(f"❌ Error en OpenAI: {error_msg}")
        
        # Manejo de errores específicos
        if "authentication" in error_msg.lower():
            return {
                "text": "Error de configuración del sistema. Contacta al administrador.",
                "success": False,
                "error": "Authentication failed"
            }
        elif "rate_limit" in error_msg.lower():
            return {
                "text": "El sistema está muy ocupado. Intenta de nuevo en unos momentos.",
                "success": False,
                "error": "Rate limit exceeded"
            }
        elif "insufficient_quota" in error_msg.lower():
            return {
                "text": "El servicio ha alcanzado su límite. Contacta al administrador.",
                "success": False,
                "error": "Quota exceeded"
            }
        else:
            return {
                "text": "Ocurrió un error inesperado. Por favor intenta de nuevo.",
                "success": False,
                "error": error_msg[:100]
            }


def format_conversation_history(messages_queryset):
    """
    Convierte QuerySet de ChatMessage a formato OpenAI.
    
    Args:
        messages_queryset: QuerySet ordenado por created_at
    
    Returns:
        list: [{"role": "user/assistant", "content": "..."}]
    """
    history = []
    
    for msg in messages_queryset:
        # Ignorar mensajes del sistema
        if msg.sender == 'system':
            continue
        
        role = "assistant" if msg.sender == "bot" else "user"
        
        # Limitar longitud de mensajes históricos para optimizar tokens
        content = msg.text
        if len(content) > 500:
            content = content[:500] + "..."
        
        history.append({
            "role": role,
            "content": content
        })
    
    return history


def generate_conversation_title(first_message: str):
    """
    Genera un título descriptivo para la conversación usando IA.
    
    Args:
        first_message: Primer mensaje del usuario
    
    Returns:
        str: Título generado o título por defecto
    """
    if not client:
        return "Nueva Conversación"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Genera un título breve (máximo 6 palabras) y descriptivo en español para una conversación educativa basándote en el primer mensaje del usuario."
                },
                {
                    "role": "user",
                    "content": first_message[:200]
                }
            ],
            max_tokens=20,
            temperature=0.5
        )
        
        if response and response.choices:
            title = response.choices[0].message.content.strip()
            # Limpiar el título (remover comillas, etc.)
            title = title.strip('"\'')
            return title[:60]  # Máximo 60 caracteres
    
    except Exception as e:
        logger.warning(f"No se pudo generar título: {str(e)}")
    
    return "Nueva Conversación"


def test_openai_connection():
    """
    Función de prueba para verificar la conexión.
    Uso en shell: python manage.py shell
    >>> from chatbot.services.openai_client import test_openai_connection
    >>> test_openai_connection()
    """
    if not client:
        print("❌ Cliente de OpenAI no inicializado")
        print("   Verifica que OPENAI_API_KEY esté en settings.py")
        return False
    
    try:
        print("🧪 Probando conexión con OpenAI...")
        
        response = ask_openai(
            user_message="Di 'hola' en una palabra",
            system_prompt="Responde en español con solo una palabra"
        )
        
        if response['success']:
            print(f"✅ Conexión exitosa!")
            print(f"   Respuesta: {response['text']}")
            print(f"   Tokens: {response.get('tokens_used', 0)}")
            print(f"   Modelo: {response.get('model', 'unknown')}")
            return True
        else:
            print(f"❌ Error: {response['error']}")
            return False
    
    except Exception as e:
        print(f"❌ Excepción: {str(e)}")
        return False