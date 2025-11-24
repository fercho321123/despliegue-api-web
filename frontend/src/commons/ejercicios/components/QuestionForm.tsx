import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';
import Swal from 'sweetalert2';
import { Question, createQuestion, updateQuestion, getLessons, Lesson } from '../services/lessonService';

interface Props {
  open: boolean;
  onClose: () => void;
  question?: Question | null;
  onSave: () => void;
}

const QuestionForm: React.FC<Props> = ({ open, onClose, question, onSave }) => {
  const [form, setForm] = useState<Question>({
    lesson: 0,
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  // 🔹 Cargar lecciones y rellenar si es edición
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await getLessons();
        setLessons(data);
      } catch (error) {
        console.error('Error al cargar lecciones:', error);
      }
    };
    fetchLessons();

    // Si es edición, cargar datos; si no, limpiar formulario
    if (question) {
      setForm(question);
    } else {
      setForm({
        lesson: 0,
        text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
      });
    }
  }, [question, open]);

  // 🔹 Guardar o actualizar pregunta
  const handleSave = async () => {
    if (
      !form.lesson ||
      !form.text ||
      !form.option_a ||
      !form.option_b ||
      !form.option_c ||
      !form.option_d ||
      !form.correct_answer
    ) {
      setSnackbar({
        open: true,
        message: 'Por favor, completa todos los campos antes de guardar.',
        severity: 'warning',
      });
      return;
    }

    try {
      if (question?.id) {
        await updateQuestion(question.id, form);
      } else {
        await createQuestion(form);
      }

      Swal.fire('Éxito', 'La pregunta se guardó correctamente.', 'success');

      // ✅ Limpia y cierra el modal
      setForm({
        lesson: 0,
        text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
      });

      onSave(); // recarga la lista y cierra desde el padre
      onClose(); // cierra el modal localmente por seguridad
    } catch (error: any) {
      console.error('Error al guardar la pregunta:', error.response?.data || error);
      Swal.fire('Error', 'No se pudo guardar la pregunta. Revisa los campos.', 'error');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{question ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
        <DialogContent>
          {/* 🔹 Selector de lección */}
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Lección</InputLabel>
            <Select
              value={form.lesson || ''}
              label="Lección"
              onChange={(e) => setForm({ ...form, lesson: Number(e.target.value) })}
            >
              {lessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.topic || lesson.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Texto de la pregunta"
            fullWidth
            required
            margin="dense"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
          <TextField
            label="Opción A"
            fullWidth
            required
            margin="dense"
            value={form.option_a}
            onChange={(e) => setForm({ ...form, option_a: e.target.value })}
          />
          <TextField
            label="Opción B"
            fullWidth
            required
            margin="dense"
            value={form.option_b}
            onChange={(e) => setForm({ ...form, option_b: e.target.value })}
          />
          <TextField
            label="Opción C"
            fullWidth
            required
            margin="dense"
            value={form.option_c}
            onChange={(e) => setForm({ ...form, option_c: e.target.value })}
          />
          <TextField
            label="Opción D"
            fullWidth
            required
            margin="dense"
            value={form.option_d}
            onChange={(e) => setForm({ ...form, option_d: e.target.value })}
          />

          <FormControl fullWidth margin="dense" required>
            <InputLabel>Respuesta Correcta</InputLabel>
            <Select
              value={form.correct_answer}
              label="Respuesta Correcta"
              onChange={(e) =>
                setForm({
                  ...form,
                  correct_answer: e.target.value as 'A' | 'B' | 'C' | 'D',
                })
              }
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuestionForm;
