// src/commons/ejercicios/screens/QuestionQuizScreen.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button, Paper } from "@mui/material";
import Swal from "sweetalert2";
import api from "../../../api/axios";

interface Question {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
}

const QuestionQuizScreen: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/ejercicios/preguntas/?lesson=${lessonId}`);
        console.log("Preguntas recibidas:", res.data);  // Verifica que las preguntas estén en el formato correcto
        setQuestions(res.data);
        console.log("Estado de preguntas actualizado:", res.data);
      } catch (error) {
        console.error("Error al cargar las preguntas:", error);
        Swal.fire("Error", "No se pudieron cargar las preguntas", "error");
      }
    };
    fetchQuestions();
  }, [lessonId]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const score = (correct / questions.length) * 100;
    let msg = "";
    if (score >= 80) msg = "¡Excelente trabajo! 🎉";
    else if (score >= 50) msg = "Buen intento, pero puedes mejorar 💪";
    else msg = "Sigue practicando, ¡no te rindas! 📘";

    Swal.fire({
      title: `Tu puntaje: ${score.toFixed(0)}%`,
      text: msg,
      icon: score >= 50 ? "success" : "info",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Cuestionario</Typography>
      {questions.map((q) => (
        <Paper key={q.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{q.text}</Typography>
          <RadioGroup
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          >
            <FormControlLabel value="A" control={<Radio />} label={q.option_a} />
            <FormControlLabel value="B" control={<Radio />} label={q.option_b} />
            <FormControlLabel value="C" control={<Radio />} label={q.option_c} />
            <FormControlLabel value="D" control={<Radio />} label={q.option_d} />
          </RadioGroup>
        </Paper>
      ))}
      {questions.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Enviar respuestas
        </Button>
      )}
    </Box>
  );
};

export default QuestionQuizScreen;
