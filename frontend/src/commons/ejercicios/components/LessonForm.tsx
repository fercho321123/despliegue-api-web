import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Lesson, createLesson, updateLesson } from '../services/lessonService';

interface Props {
  open: boolean;
  onClose: () => void;
  lesson?: Lesson | null;
  onSave: () => void;
}

const LessonForm: React.FC<Props> = ({ open, onClose, lesson, onSave }) => {
  const [form, setForm] = useState<Lesson>({
    title: '',
    grade: '',
    topic: '',
    description: '',
  });

  const [errorOpen, setErrorOpen] = useState(false); // 🔹 Controla el mensaje de error
  const [errorMsg, setErrorMsg] = useState(''); // 🔹 Mensaje dinámico

  useEffect(() => {
    setForm(lesson || { title: '', grade: '', topic: '', description: '' });
  }, [lesson]);

  const handleSave = async () => {
    // 🔹 Validación antes de enviar
    if (!form.title || !form.grade || !form.topic || !form.description) {
      setErrorMsg('Por favor, completa todos los campos antes de guardar.');
      setErrorOpen(true);
      return;
    }

    try {
      if (lesson) await updateLesson(lesson.id!, form);
      else await createLesson(form);
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar la lección:', error.response?.data || error);
      setErrorMsg('Ocurrió un error al guardar la lección. Revisa los campos.');
      setErrorOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{lesson ? 'Editar Lección' : 'Nueva Lección'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            required
            margin="dense"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Grado"
            fullWidth
            required
            margin="dense"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
          />
          <TextField
            label="Tema"
            fullWidth
            required
            margin="dense"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            required
            margin="dense"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Snackbar de error */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="warning" onClose={() => setErrorOpen(false)} sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LessonForm;
