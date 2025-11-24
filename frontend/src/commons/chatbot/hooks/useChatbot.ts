// src/commons/chatbot/hooks/useChatbot.ts
import { useState } from 'react';
import { Mensaje, Conversacion } from '../types/types';
import { iniciarConversacion, enviarMensaje } from '../services/chatService';

export default function useChatbot() {
  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Iniciar una nueva conversación
   */
  const start = async (meta?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const conv = await iniciarConversacion(meta);
      setConversacion(conv);
      setMensajes(conv.mensajes || []);
      
      console.log('✅ Conversación iniciada:', conv);
      return conv;
    } catch (err: any) {
      console.error('❌ Error al iniciar conversación:', err);
      setError('Error al iniciar la conversación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enviar un mensaje
   */
  const send = async (
    texto: string,
    tipo: 'answer' | 'query' = 'query',
    meta: any = {}
  ) => {
    if (!texto.trim()) {
      setError('El mensaje no puede estar vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Agregar mensaje del usuario optimísticamente
      const mensajeUsuario: Mensaje = {
        conversacion: conversacion?.id ?? null,
        emisor: 'usuario',
        texto: texto.trim(),
        creado: new Date().toISOString(),
        metadata: meta
      };

      setMensajes(prev => [...prev, mensajeUsuario]);

      // Enviar al backend
      const res = await enviarMensaje({
        conversacion: conversacion?.id ?? null,
        texto: texto.trim(),
        tipo,
        meta,
      });

      // Actualizar estado con la respuesta del backend
      setConversacion(res.conversacion);
      
      // El backend ya incluye ambos mensajes (usuario y bot) en la conversación
      // Pero vamos a agregar solo el mensaje del bot ya que el del usuario ya lo pusimos
      const botMessage = res.mensaje_bot;
      const mensajeBot: Mensaje = {
        id: botMessage.id,
        conversacion: res.conversacion.id,
        emisor: 'bot',
        texto: (botMessage as any).text || (botMessage as any).texto || '',
        creado: (botMessage as any).created_at || (botMessage as any).creado || new Date().toISOString(),
        metadata: botMessage.metadata
      };

      setMensajes(prev => [...prev, mensajeBot]);

      console.log('✅ Mensaje enviado y respuesta recibida');
      return res;
    } catch (err: any) {
      console.error('❌ Error al enviar mensaje:', err);
      setError(err.response?.data?.detail || 'Error al enviar el mensaje');
      
      // Remover el mensaje optimista del usuario si hubo error
      setMensajes(prev => prev.slice(0, -1));
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar conversación actual
   */
  const clear = () => {
    setConversacion(null);
    setMensajes([]);
    setError(null);
  };

  return {
    conversacion,
    mensajes,
    loading,
    error,
    start,
    send,
    clear
  };
}