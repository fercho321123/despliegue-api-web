import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Lock } from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  getLessons,
  deleteLesson,
  Lesson,
  createPermissionRequest,
} from "../services/lessonService";
import LessonForm from "../components/LessonForm";
import { useAuthContext } from "../../usuarios/hooks/AuthContext";


// 🔹 Extendemos Lesson para incluir información del profesor
interface ExtendedLesson extends Lesson {
  teacher?: number;
  teacher_name?: string;
}

const LessonListScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [lessons, setLessons] = useState<ExtendedLesson[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExtendedLesson | null>(null);

  // 🔹 Cargar lecciones
  const fetchLessons = async () => {
    try {
      const data = await getLessons();
      setLessons(data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar las lecciones.", "error");
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // 🗑️ Eliminar (con control de permisos)
  const handleDelete = async (lesson: ExtendedLesson) => {
    if (user?.role === "teacher" && lesson.teacher !== user.id) {
      const result = await Swal.fire({
        icon: "info",
        title: "No puedes eliminar esta lección",
        text: "Esta lección fue creada por el administrador u otro docente.",
        showCancelButton: true,
        confirmButtonText: "Solicitar permiso al administrador",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await createPermissionRequest({
            question: null,
            lesson: lesson.id,
            action_type: "delete",
          });
          Swal.fire(
            "Solicitud enviada",
            "El administrador revisará tu petición.",
            "success"
          );
        } catch {
          Swal.fire(
            "Error",
            "No se pudo enviar la solicitud de permiso.",
            "error"
          );
        }
      }
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Eliminar esta lección?",
      text: "No podrás recuperarla después.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteLesson(lesson.id!);
        fetchLessons();
        Swal.fire("Eliminada", "La lección se eliminó correctamente.", "success");
      } catch {
        Swal.fire("Error", "No se pudo eliminar la lección.", "error");
      }
    }
  };

  // ✏️ Editar (con control de permisos)
  const handleEdit = (lesson: ExtendedLesson) => {
    if (user?.role === "teacher" && lesson.teacher !== user.id) {
      Swal.fire({
        icon: "info",
        title: "No puedes editar esta lección",
        text: "Esta lección fue creada por el administrador u otro docente.",
        showCancelButton: true,
        confirmButtonText: "Solicitar permiso al administrador",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await createPermissionRequest({
              question: null,
              lesson: lesson.id,
              action_type: "edit",
            });
            Swal.fire(
              "Solicitud enviada",
              "El administrador revisará tu petición.",
              "success"
            );
          } catch {
            Swal.fire(
              "Error",
              "No se pudo enviar la solicitud de permiso.",
              "error"
            );
          }
        }
      });
      return;
    }

    setSelected(lesson);
    setOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Gestión de Lecciones
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          setSelected(null);
          setOpen(true);
        }}
      >
        Nueva Lección
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Grado</TableCell>
            <TableCell>Tema</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lessons.map((lesson) => {
            const isOwner = lesson.teacher === user?.id;

            return (
              <TableRow key={lesson.id}>
                <TableCell>{lesson.title}</TableCell>
                <TableCell>{lesson.grade}</TableCell>
                <TableCell>{lesson.topic}</TableCell>
                <TableCell align="center">
                  {user?.role === "admin" || isOwner ? (
                    <>
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => handleEdit(lesson)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(lesson)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="No puedes modificar esta lección (clic para solicitar permiso)">
                      <span>
                        <IconButton onClick={() => handleEdit(lesson)}>
                          <Lock />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <LessonForm
        open={open}
        onClose={() => setOpen(false)}
        lesson={selected || undefined}
        onSave={fetchLessons}
      />
    </Box>
  );
};

export default LessonListScreen;
