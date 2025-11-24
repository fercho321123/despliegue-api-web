// src/commons/ejercicios/screens/LessonReadScreen.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import Swal from "sweetalert2";
import { markLessonCompleted } from "../services/lessonService";
import api from "../../../api/axios";

interface Lesson {
  id: number;
  title: string;
  topic: string;
  description: string;
}

const LessonReadScreen: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const navigate = useNavigate();
  const lessonIdNumber = Number(lessonId);

  // 🔹 Cargar la lección
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/ejercicios/lecciones/${lessonId}/`);
        setLesson(res.data);
      } catch {
        Swal.fire("Error", "No se pudo cargar la lección", "error");
      }
    };
    fetchLesson();
  }, [lessonId]);

  // 🔹 Marcar como completada y preguntar qué hacer después
  const handleMarkCompleted = async () => {
    try {
      await markLessonCompleted(lessonIdNumber);
      Swal.fire({
        title: "¡Lección completada!",
        text: "¿Qué deseas hacer ahora?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Resolver cuestionario",
        cancelButtonText: "Hablar con el chatbot",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/leccion/${lessonId}/quiz`);
        } else {
          navigate(`/chat?lesson_id=${lessonId}`);
        }
      });
    } catch {
      Swal.fire("Error", "No se pudo marcar la lección como leída", "error");
    }
  };

  if (!lesson) return <Typography>Cargando lección...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {lesson.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Tema: {lesson.topic}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {lesson.description}
        </Typography>
      </Paper>

      {/* 🔹 Botones de acción */}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMarkCompleted}
        >
          Marcar como leída
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate(`/leccion/${lessonId}/quiz`)}
        >
          Resolver cuestionario
        </Button>

        <Button
          variant="text"
          color="info"
          onClick={() => navigate(`/chat?lesson_id=${lessonId}`)}
        >
          Hablar con el chatbot
        </Button>
      </Box>
    </Box>
  );
};

export default LessonReadScreen;
