import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { getLessonProgress } from "../services/lessonService";

interface LessonProgress {
  id: number;
  student_name: string;
  lesson_title: string;
  completed: boolean;
  completed_at: string;
}

const StudentProgressScreen: React.FC = () => {
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getLessonProgress();
        setProgress(data);
      } catch (error) {
        console.error("Error al cargar progreso de estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        📊 Progreso de Estudiantes
      </Typography>

      {progress.length === 0 ? (
        <Typography>No hay datos de progreso aún.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Estudiante</strong></TableCell>
              <TableCell><strong>Lección</strong></TableCell>
              <TableCell><strong>Completada</strong></TableCell>
              <TableCell><strong>Fecha de finalización</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {progress.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.student_name}</TableCell>
                <TableCell>{p.lesson_title}</TableCell>
                <TableCell>{p.completed ? "✅ Sí" : "❌ No"}</TableCell>
                <TableCell>
                  {p.completed_at
                    ? new Date(p.completed_at).toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default StudentProgressScreen;
