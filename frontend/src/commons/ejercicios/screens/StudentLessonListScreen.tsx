// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   CircularProgress,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import { getLessons, Lesson } from "../services/lessonService"; // ✅ importa también la interfaz

// const StudentLessonListScreen: React.FC = () => {
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchLessons = async () => {
//       try {
//         const data = await getLessons(); // ✅ ya está correctamente tipado
//         setLessons(data);
//       } catch (err) {
//         Swal.fire("Error", "No se pudieron cargar las lecciones", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLessons();
//   }, []);

//   if (loading)
//     return (
//       <Box display="flex" justifyContent="center" mt={5}>
//         <CircularProgress />
//       </Box>
//     );

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         📘 Lecciones Disponibles
//       </Typography>

//       {lessons.length === 0 ? (
//         <Typography>No hay lecciones disponibles.</Typography>
//       ) : (
//         lessons.map((lesson) => (
//           <Paper key={lesson.id} sx={{ p: 2, mb: 2 }}>
//             <Typography variant="h6">{lesson.title}</Typography>
//             <Typography variant="subtitle1">Tema: {lesson.topic}</Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               {lesson.description?.slice(0, 100) || "Sin descripción"}...
//             </Typography>
//             <Button
//               variant="contained"
//               onClick={() => navigate(`/leccion/${lesson.id}`)}
//             >
//               Leer Lección
//             </Button>
//           </Paper>
//         ))
//       )}
//     </Box>
//   );
// };

// export default StudentLessonListScreen;

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getLessons, Lesson } from "../services/lessonService"; // ✅ Importa la función y la interfaz

const StudentLessonListScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await getLessons();

        // ✅ Validar que los datos realmente sean un arreglo
        if (Array.isArray(data)) {
          setLessons(data);
        } else {
          console.error("⚠️ Los datos recibidos no son un arreglo:", data);
          Swal.fire("Error", "Formato de datos inválido del servidor.", "error");
        }
      } catch (err) {
        console.error("❌ Error al obtener lecciones:", err);
        Swal.fire("Error", "No se pudieron cargar las lecciones.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📘 Lecciones Disponibles
      </Typography>

      {lessons.length === 0 ? (
        <Typography>No hay lecciones disponibles.</Typography>
      ) : (
        lessons.map((lesson) => (
          <Paper key={lesson.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{lesson.title}</Typography>
            <Typography variant="subtitle1">Tema: {lesson.topic}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {lesson.description
                ? `${lesson.description.slice(0, 100)}...`
                : "Sin descripción disponible."}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/leccion/${lesson.id}`)}
            >
              Leer Lección
            </Button>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default StudentLessonListScreen;
