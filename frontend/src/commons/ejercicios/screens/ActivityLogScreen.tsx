// src/commons/ejercicios/screens/ActivityLogScreen.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress } from '@mui/material';
import api from '../../../api/axios';

interface Log {
  id: number;
  user_name: string;
  model_name: string;
  object_id: number;
  action: string;
  timestamp: string;
  description: string;
}

const ActivityLogScreen: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/ejercicios/historial/');
        const data = res.data;
        
        // 🔹 Manejar respuesta paginada o array directo
        if (data && typeof data === 'object' && 'results' in data) {
          setLogs(data.results);
        } else if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error('Formato inesperado:', data);
          setLogs([]);
        }
      } catch (error) {
        console.error('Error al cargar logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Historial de Actividades
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay registros de actividad
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell>
                    {log.action === 'create'
                      ? 'Creación'
                      : log.action === 'update'
                      ? 'Edición'
                      : 'Eliminación'}
                  </TableCell>
                  <TableCell>{log.model_name}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ActivityLogScreen;