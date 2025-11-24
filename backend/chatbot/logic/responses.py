# chatbot/logic/responses.py
from ejercicios.models import Question
from django.db.models import Q
import random

def get_next_question_by_lesson(lesson_id, exclude_ids=None):
    """
    Devuelve la siguiente pregunta de la lección, excluyendo ids en exclude_ids.
    Retorna un objeto Question o None.
    """
    exclude_ids = exclude_ids or []
    qs = Question.objects.filter(lesson_id=lesson_id).exclude(id__in=exclude_ids)
    return qs.order_by('?').first()  # aleatorio entre los disponibles (puedes cambiar orden)

def evaluate_answer(question, answer_text):
    """
    Evalúa la respuesta enviada por el usuario.
    - question: instancia de Question
    - answer_text: texto enviado por el usuario (puede ser "A", "a", "A) texto", etc)
    Retorna dict: { 'correct': bool, 'feedback': str }
    """
    if not question:
        return {'correct': False, 'feedback': "No pude encontrar la pregunta para evaluarla."}

    # intentar extraer la letra (A/B/C/D)
    ans = (answer_text or "").strip().upper()
    # si el usuario envía 'A) ...' o 'A. ...' tomamos la primera letra
    if len(ans) >= 1 and ans[0] in ['A', 'B', 'C', 'D']:
        ans_letter = ans[0]
    else:
        # intentar buscar la letra dentro del texto
        for ch in ['A', 'B', 'C', 'D']:
            if ans.startswith(ch):
                ans_letter = ch
                break
        else:
            # fallback: comparar con opciones por contenido (si el usuario escribió el texto completo)
            mapping = {
                'A': question.option_a.strip().upper(),
                'B': question.option_b.strip().upper(),
                'C': question.option_c.strip().upper(),
                'D': question.option_d.strip().upper(),
            }
            user_upper = ans.upper()
            found = None
            for k, v in mapping.items():
                if v and v in user_upper:
                    found = k
                    break
            ans_letter = found if found else None

    correct = ans_letter == question.correct_answer
    if correct:
        feedback = "✅ Correcto."
    else:
        feedback = f"❌ Incorrecto. La respuesta correcta es {question.correct_answer}."

    return {'correct': bool(correct), 'feedback': feedback}
