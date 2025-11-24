// src/commons/chatbot/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, List } from '@mui/material';
import MessageItem from './MessageItem';
import { Mensaje } from '../types/types';

interface Props {
  mensajes: Mensaje[];
  onSend: (texto: string) => Promise<void>;
  onStart?: () => Promise<void>;
}

const ChatWindow: React.FC<Props> = ({ mensajes, onSend, onStart }) => {
  const [texto, setTexto] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = async () => {
    if (!texto.trim()) return;
    const t = texto.trim();
    setTexto('');
    await onSend(t);
  };

  return (
    <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ overflowY: 'auto', flex: 1 }} ref={listRef}>
        <List>
          {mensajes.map((m) => (
            <MessageItem key={m.id ?? Math.random()} m={m} />
          ))}
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Escribe un mensaje..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button variant="contained" onClick={handleSend}>Enviar</Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
