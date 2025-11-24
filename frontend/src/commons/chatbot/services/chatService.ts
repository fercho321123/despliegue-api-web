// src/commons/chatbot/services/chatService.ts
import api from '../../../api/axios';
import { Conversacion, Mensaje, IniciarConversacionPayload } from '../types/types';

/**
 * Iniciar una nueva conversación
 */
export const iniciarConversacion = async (
  payload?: IniciarConversacionPayload
): Promise<Conversacion> => {
  const resp = await api.post('/chatbot/conversacion/iniciar/', payload || {});
  return resp.data.conversacion || resp.data;
};

/**
 * Enviar un mensaje en la conversación
 */
export const enviarMensaje = async (data: {
  conversacion?: number | null;
  texto: string;
  tipo?: 'answer' | 'query';
  meta?: Record<string, any>;
}): Promise<{ conversacion: Conversacion; mensaje_bot: Mensaje }> => {
  // El backend espera estos nombres de campos
  const payload = {
    conversation: data.conversacion,
    text: data.texto,
    type: data.tipo || 'query',
    meta: data.meta || {}
  };

  console.log('📤 Enviando mensaje al backend:', payload);

  const resp = await api.post('/chatbot/mensaje/', payload);
  
  console.log('📥 Respuesta del backend:', resp.data);

  // El backend devuelve { conversation: {...}, bot_message: {...} }
  return {
    conversacion: resp.data.conversation,
    mensaje_bot: resp.data.bot_message
  };
};

/**
 * Obtener el historial de una conversación
 */
export const obtenerHistorial = async (conversacionId: number): Promise<Conversacion> => {
  const resp = await api.get(`/chatbot/conversacion/${conversacionId}/historial/`);
  return resp.data;
};

/**
 * Listar todas las conversaciones del usuario
 */
export const listarConversaciones = async (): Promise<Conversacion[]> => {
  const resp = await api.get('/chatbot/conversaciones/');
  return resp.data;
};