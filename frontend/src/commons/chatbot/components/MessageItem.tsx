// src/commons/chatbot/components/MessageItem.tsx
import React from 'react';
import { Mensaje } from '../types/types';
import { Box, Typography, Paper } from '@mui/material';

const MessageItem: React.FC<{ m: Mensaje }> = ({ m }) => {
  const isBot = m.emisor === 'bot';
  return (
    <Box display="flex" justifyContent={isBot ? 'flex-start' : 'flex-end'} my={1}>
      <Paper sx={{ p:2, maxWidth: '80%' }}>
        <Typography variant="body2">{m.texto}</Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {m.creado ? new Date(m.creado).toLocaleString() : ''}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageItem;
