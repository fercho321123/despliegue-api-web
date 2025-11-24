// src/commons/chatbot/types/types.ts

export interface Mensaje {
  id?: number;
  conversacion: number | null;
  emisor: 'bot' | 'usuario';
  texto?: string;  // Campo español
  text?: string;   // Campo inglés (del backend)
  creado?: string; // Campo español
  created_at?: string; // Campo inglés (del backend)
  sender?: 'bot' | 'user'; // Campo inglés alternativo
  metadata?: Record<string, any> | null;
}

export interface Conversacion {
  id: number;
  estudiante?: number;
  student?: number; // Campo inglés alternativo
  fecha_inicio?: string;
  start_date?: string; // Campo inglés alternativo
  contexto?: string;
  context?: string; // Campo inglés alternativo
  mensajes?: Mensaje[];
  messages?: Mensaje[]; // Campo inglés alternativo
  leccion?: number;
  lesson?: number; // Campo inglés alternativo
}

export interface IniciarConversacionPayload {
  leccion_id?: number;
  lesson_id?: number; // Campo inglés alternativo
}

// Tipo auxiliar para la respuesta del backend
export interface BackendMessageResponse {
  conversation: Conversacion;
  bot_message: {
    id?: number;
    conversation?: number;
    sender: 'bot' | 'user';
    text: string;
    created_at: string;
    metadata?: Record<string, any> | null;
  };
}