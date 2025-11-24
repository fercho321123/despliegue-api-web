// src/commons/chatbot/screens/ChatScreen.tsx
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material'; // ← eliminamos Button
import useChatbot from '../hooks/useChatbot';
import ChatWindow from '../components/ChatWindow';

const ChatScreen: React.FC = () => {
  // ← eliminamos 'loading' porque no se usa
  const { conversacion, mensajes, error, start, send } = useChatbot();

  useEffect(() => {
    // iniciar conversación automática (sin meta)
    start().catch(() => {});
  }, [start]); // ← agregamos start para eliminar el warning del useEffect

  const handleSend = async (texto: string) => {
    // en este ejemplo tratamos todo como 'consulta'
    await send(texto, 'query', {});
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Chatbot educativo
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Conversación: {conversacion ? `#${conversacion.id}` : 'no iniciada'}
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <ChatWindow
        mensajes={mensajes}
        onSend={handleSend}
        onStart={async () => { await start(); }}
      />
    </Box>
  );
};

export default ChatScreen;
