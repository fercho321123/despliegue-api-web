
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
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Lock } from "@mui/icons-material";
import Swal from "sweetalert2";

import {
  getQuestions,
  deleteQuestion,
  Question,
  createPermissionRequest,
} from "../services/lessonService";

import QuestionForm from "../components/QuestionForm";
import { useAuthContext } from "../../usuarios/hooks/AuthContext";

// 🔹 Extendemos el tipo base Question con campos adicionales
interface ExtendedQuestion extends Question {
  lesson_title?: string;
  lesson_teacher?: number;
}
const QuestionListScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExtendedQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔹 Cargar preguntas
  // ================================
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      console.log("📥 Cargando preguntas...");
      const data = await getQuestions();
      console.log("✅ Preguntas recibidas:", data);

      if (Array.isArray(data)) {
        setQuestions(data);
        console.log(`📊 Total de preguntas cargadas: ${data.length}`);
      } else {
        console.error("⚠️ Los datos recibidos no son un arreglo:", data);
        setQuestions([]);
      }
    } catch (err) {
      console.error("❌ Error al cargar preguntas:", err);
      Swal.fire("Error", "No se pudieron cargar las preguntas.", "error");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ================================
  // 📨 Enviar solicitud al administrador
  // ================================
  const sendPermissionRequest = async (
    questionId: number | null,
    lessonId: number | null,
    action: "edit" | "delete"
  ) => {
    try {
      const payload = {
        action_type: action,
        question: questionId !== null ? questionId : undefined,
        lesson: lessonId !== null ? lessonId : undefined,
      };

      console.log("🔍 Enviando solicitud al backend:", payload);

      if (!payload.question && !payload.lesson) {
        Swal.fire("Error", "Debes proporcionar 'question' o 'lesson'.", "error");
        return;
      }

      await createPermissionRequest(payload);
      Swal.fire(
        "Solicitud enviada",
        "El administrador revisará tu petición.",
        "success"
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "No se pudo enviar la solicitud.";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  // ================================
  // 🗑️ Eliminar pregunta (con permisos)
  // ================================
  const handleDelete = async (q: ExtendedQuestion) => {
    const isTeacher = user?.role === "teacher";
    const isOwner = q.lesson_teacher === user?.id;

    if (isTeacher && !isOwner) {
      Swal.fire({
        icon: "info",
        title: "No puedes eliminar esta pregunta",
        text: "Esta pregunta fue creada por el administrador o por otro docente.",
        showCancelButton: true,
        confirmButtonText: "Solicitar permiso al administrador",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          sendPermissionRequest(q.id!, null, "delete");
        }
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Eliminar esta pregunta?",
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
        await deleteQuestion(q.id!);
        await fetchQuestions();
        Swal.fire("Eliminada", "La pregunta se eliminó correctamente.", "success");
      } catch (err: any) {
        if (err.response?.status === 403) {
          Swal.fire(
            "Acceso denegado",
            "No tienes permiso para eliminar esta pregunta.",
            "warning"
          );
        } else {
          Swal.fire("Error", "No se pudo eliminar la pregunta.", "error");
        }
      }
    }
  };

  // ================================
  // ✏️ Editar pregunta (con permisos)
  // ================================
  const handleEdit = (q: ExtendedQuestion) => {
    const isTeacher = user?.role === "teacher";
    const isOwner = q.lesson_teacher === user?.id;

    if (isTeacher && !isOwner) {
      Swal.fire({
        icon: "info",
        title: "No puedes editar esta pregunta",
        text: "Esta pregunta pertenece al administrador o a otro docente.",
        showCancelButton: true,
        confirmButtonText: "Solicitar permiso al administrador",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          sendPermissionRequest(q.id!, null, "edit");
        }
      });
      return;
    }

    setSelected(q);
    setOpen(true);
  };

  // ================================
  // 🖋️ Render principal
  // ================================
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Gestión de Preguntas
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          setSelected(null);
          setOpen(true);
        }}
      >
        Nueva Pregunta
      </Button>

      {/* Tabla de preguntas */}
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Texto</strong></TableCell>
            <TableCell><strong>Lección</strong></TableCell>
            <TableCell><strong>Creada por</strong></TableCell>
            <TableCell><strong>Correcta</strong></TableCell>
            <TableCell align="center"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="text.secondary" py={3}>
                  No hay preguntas disponibles. Haz clic en "Nueva Pregunta" para crear una.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            questions.map((q) => {
              const isAdmin = user?.role === "admin";
              const isTeacher = user?.role === "teacher";
              const isOwner = q.lesson_teacher === user?.id;

              return (
                <TableRow key={q.id}>
                  <TableCell>{q.text}</TableCell>
                  <TableCell>{q.lesson_title || "—"}</TableCell>
                  <TableCell>
                    {isOwner ? (
                      <span style={{ color: "green" }}>✅ Tú</span>
                    ) : (
                      <span style={{ color: "gray" }}>👑 Administrador</span>
                    )}
                  </TableCell>
                  <TableCell>{q.correct_answer}</TableCell>
                  <TableCell align="center">
                    {!isTeacher || isOwner ? (
                      <>
                        <Tooltip title="Editar">
                          <IconButton color="primary" onClick={() => handleEdit(q)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton color="error" onClick={() => handleDelete(q)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="No puedes modificar esta pregunta (haz clic para solicitar permiso)">
                        <span>
                          <IconButton onClick={() => handleEdit(q)}>
                            <Lock />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Modal de creación/edición */}
      <QuestionForm
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        question={selected || undefined}
        onSave={() => {
          fetchQuestions();
          setOpen(false);
          setSelected(null);
        }}
      />
    </Box>
  );
};

export default QuestionListScreen;