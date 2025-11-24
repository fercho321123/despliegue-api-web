// import React, { useEffect, useState } from "react";
// import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Paper } from "@mui/material";
// import Swal from "sweetalert2";
// import { getQuestions, Question } from "../services/lessonService";


// interface Question {
//   id: number;
//   text: string;
//   option_a: string;
//   option_b: string;
//   option_c: string;
//   option_d: string;
//   correct_answer: string;
// }

// const StudentQuizScreen: React.FC<{ lessonId: number }> = ({ lessonId }) => {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [answers, setAnswers] = useState<{ [key: number]: string }>({});
//   const [score, setScore] = useState<number | null>(null);


//   useEffect(() => {
//   const fetchQuestions = async () => {
//     try {
//       const data = await getQuestions(lessonId);
//       setQuestions(data);
//     } catch (error) {
//       console.error("Error al cargar preguntas", error);
//     }
//   };
//   fetchQuestions();
// }, [lessonId]);
  



//   const handleSelect = (qid: number, ans: string) => {
//     setAnswers({ ...answers, [qid]: ans });
//   };

//   const handleSubmit = () => {
//     let correct = 0;
//     questions.forEach(q => {
//       if (answers[q.id] === q.correct_answer) correct++;
//     });
//     const total = questions.length;
//     const percent = (correct / total) * 100;
//     setScore(percent);

//     if (percent >= 80)
//       Swal.fire("¡Excelente!", `Tu puntaje es ${percent.toFixed(1)}%. ¡Sigue así!`, "success");
//     else if (percent >= 50)
//       Swal.fire("Bien hecho", `Tu puntaje es ${percent.toFixed(1)}%. Puedes mejorar.`, "info");
//     else Swal.fire("Sigue practicando", `Tu puntaje es ${percent.toFixed(1)}%.`, "warning");
//   };

//   return (
//     <Paper sx={{ p: 3 }}>
//       <Typography variant="h5" mb={2}>Cuestionario de la Lección</Typography>
//       {questions.map(q => (
//         <Box key={q.id} mb={3}>
//           <Typography fontWeight="bold">{q.text}</Typography>
//           <RadioGroup
//             value={answers[q.id] || ""}
//             onChange={(e) => handleSelect(q.id, e.target.value)}
//           >
//             <FormControlLabel value="A" control={<Radio />} label={q.option_a} />
//             <FormControlLabel value="B" control={<Radio />} label={q.option_b} />
//             <FormControlLabel value="C" control={<Radio />} label={q.option_c} />
//             <FormControlLabel value="D" control={<Radio />} label={q.option_d} />
//           </RadioGroup>
//         </Box>
//       ))}

//       <Button variant="contained" onClick={handleSubmit}>Finalizar</Button>
//       {score !== null && <Typography mt={2}>Puntaje: {score.toFixed(1)}%</Typography>}
//     </Paper>
//   );
// };

// export default StudentQuizScreen;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ incluye navigate por si se quiere volver
import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { getQuestions, Question } from "../services/lessonService"; // ✅ Usa la interfaz del servicio

const StudentQuizScreen: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>(); // obtiene el ID de la URL
  const navigate = useNavigate();
  const lessonIdNumber = Number(lessonId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar preguntas de la lección
  useEffect(() => {
    if (!lessonIdNumber || isNaN(lessonIdNumber)) {
      console.error("❌ ID de lección inválido en la URL:", lessonId);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(lessonIdNumber);
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error("⚠️ El backend no devolvió un arreglo de preguntas:", data);
          Swal.fire("Error", "Formato de datos inválido del servidor.", "error");
        }
      } catch (error) {
        console.error("Error al cargar preguntas:", error);
        Swal.fire("Error", "No se pudieron cargar las preguntas.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [lessonIdNumber, lessonId]);

  // 🔹 Manejar selección de respuesta
  const handleSelect = (qid: number, ans: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  // 🔹 Calcular resultados del test
  const handleSubmit = () => {
    if (questions.length === 0) {
      Swal.fire("Atención", "No hay preguntas disponibles para esta lección.", "info");
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id!] === q.correct_answer) correct++;
    });

    const total = questions.length;
    const percent = (correct / total) * 100;
    setScore(percent);

    if (percent >= 80)
      Swal.fire("¡Excelente!", `Tu puntaje es ${percent.toFixed(1)}%. ¡Sigue así! 🎉`, "success");
    else if (percent >= 50)
      Swal.fire("Bien hecho", `Tu puntaje es ${percent.toFixed(1)}%. Puedes mejorar. 💪`, "info");
    else
      Swal.fire("Sigue practicando", `Tu puntaje es ${percent.toFixed(1)}%.`, "warning");
  };

  // 🔹 Si todavía carga
  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  // 🔹 Render principal
  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" mb={2}>
        🧠 Cuestionario de la Lección
      </Typography>

      {questions.length === 0 ? (
        <Typography>No hay preguntas disponibles para esta lección.</Typography>
      ) : (
        questions.map((q) => (
          <Box key={q.id} mb={3}>
            <Typography fontWeight="bold" mb={1}>
              {q.text}
            </Typography>
            <RadioGroup
              value={answers[q.id!] || ""}
              onChange={(e) => handleSelect(q.id!, e.target.value)}
            >
              <FormControlLabel value="A" control={<Radio />} label={q.option_a} />
              <FormControlLabel value="B" control={<Radio />} label={q.option_b} />
              <FormControlLabel value="C" control={<Radio />} label={q.option_c} />
              <FormControlLabel value="D" control={<Radio />} label={q.option_d} />
            </RadioGroup>
          </Box>
        ))
      )}

      {questions.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Finalizar
        </Button>
      )}

      {score !== null && (
        <Typography mt={3} variant="h6">
          🧾 Puntaje: {score.toFixed(1)}%
        </Typography>
      )}

      <Box mt={3}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Volver a Lección
        </Button>
      </Box>
    </Paper>
  );
};

export default StudentQuizScreen;
