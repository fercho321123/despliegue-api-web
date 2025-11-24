// import api from '../../../api/axios';

// export interface Lesson {
//   id?: number;
//   title: string;
//   description?: string;
//   grade: string;
//   topic: string;
//   teacher?: number;
//   questions?: Question[];
// }

// export interface Question {
//   id?: number;
//   lesson: number;
//   text: string;
//   option_a: string;
//   option_b: string;
//   option_c: string;
//   option_d: string;
//   correct_answer: 'A' | 'B' | 'C' | 'D';

//   // 🔹 Campos opcionales devueltos por el backend
//   lesson_title?: string;
//   lesson_teacher?: number;
// }

// // ============================
// // 🔹 CRUD de Lecciones
// // ============================

// export const getLessons = async () => {
//   const res = await api.get('/ejercicios/lecciones/');
//   return res.data as Lesson[];
// };

// export const createLesson = async (data: Lesson) => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const lessonData = { ...data, teacher: user.id };
//   console.log('📤 Datos enviados al backend:', lessonData);

//   try {
//     const res = await api.post('/ejercicios/lecciones/', lessonData);
//     return res.data;
//   } catch (error: any) {
//     console.error('❌ Error creando lección:', error.response?.data);
//     alert('Error al crear la lección. Revisa los campos y el formato.');
//     throw error;
//   }
// };

// export const updateLesson = async (id: number, data: Lesson) => {
//   const res = await api.put(`/ejercicios/lecciones/${id}/`, data);
//   return res.data;
// };

// export const deleteLesson = async (id: number) => {
//   await api.delete(`/ejercicios/lecciones/${id}/`);
// };

// // ============================
// // 🔹 CRUD de Preguntas
// // ============================

// export const getQuestions = async (lessonId?: number) => {
//   const res = await api.get('/ejercicios/preguntas/', {
//     params: lessonId ? { lesson: lessonId } : {},
//   });
//   return res.data as Question[];
// };

// export const createQuestion = async (data: Question) => {
//   const res = await api.post('/ejercicios/preguntas/', data);
//   return res.data;
// };

// export const updateQuestion = async (id: number, data: Question) => {
//   const res = await api.put(`/ejercicios/preguntas/${id}/`, data);
//   return res.data;
// };

// export const deleteQuestion = async (id: number) => {
//   await api.delete(`/ejercicios/preguntas/${id}/`);
// };


// export const requestPermission = async (questionId: number, actionType: 'edit' | 'delete') => {
//   const res = await api.post('/ejercicios/solicitudes/', {
//     question: questionId,
//     action_type: actionType,
//   });
//   return res.data;
// };

// export const createPermissionRequest = async (data: {
//   question?: number | null;
//   lesson?: number | null;
//   action_type: "edit" | "delete";
// }) => {
//   // 🧠 Construir el cuerpo dinámicamente (evita enviar null)
//   const body: any = {
//     action_type: data.action_type,
//   };

//   if (data.lesson !== null && data.lesson !== undefined) {
//     body.lesson = data.lesson;
//   }

//   if (data.question !== null && data.question !== undefined) {
//     body.question = data.question;
//   }

//   console.log("🔍 Enviando solicitud al backend:", body);

//   const response = await api.post("/ejercicios/solicitudes/", body);
//   return response.data;
// };

// export const requestEditPermission = async (data: {
//   question?: number;
//   lesson?: number;
//   action_type: "edit" | "delete";
// }) => {
//   return api.post("/ejercicios/solicitudes/", data);
// };


// export const markLessonCompleted = async (lessonId: number) => {
//   const res = await api.post(`/ejercicios/lecciones/${lessonId}/completar/`);
//   return res.data;
// };

// export const getLessonProgress = async () => {
//   const res = await api.get(`/ejercicios/progreso/`);
//   return res.data;
// };




import { api } from "../../../api/axios";
import { extractResults } from '../../../utils/apiHelpers';


// ============================
// 🔹 Interfaces (tipos de datos)
// ============================
export interface Question {
  id?: number;
  lesson: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";

  // Campos extra del backend
  lesson_title?: string;
  lesson_teacher?: number;
  can_edit?: boolean;
}

export interface Lesson {
  id?: number;
  title: string;
  description?: string;
  grade: string;
  topic: string;
  teacher?: number;
  questions?: Question[];
}

export interface LessonProgress {
  id: number;
  student: number;
  student_name: string;
  lesson: number;
  lesson_title: string;
  completed: boolean;
  completed_at: string;
}

// ============================
// 🟢 CRUD de Lecciones
// ============================

export const getLessons = async (): Promise<Lesson[]> => {
  try {
    const res = await api.get("/ejercicios/lecciones/");
    const data = res.data;
    
    // 🔹 Manejar respuesta paginada o array directo
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results as Lesson[];
    }
    
    if (Array.isArray(data)) {
      return data as Lesson[];
    }
    
    console.error("❌ Formato de respuesta inesperado:", data);
    return [];
  } catch (error) {
    console.error("❌ Error al obtener las lecciones:", error);
    return [];
  }
};
export const createLesson = async (data: Lesson) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const lessonData = { ...data, teacher: user.id };

  try {
    const res = await api.post("/ejercicios/lecciones/", lessonData);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error creando lección:", error.response?.data);
    alert("Error al crear la lección. Revisa los campos y el formato.");
    throw error;
  }
};

export const updateLesson = async (id: number, data: Lesson) => {
  const res = await api.put(`/ejercicios/lecciones/${id}/`, data);
  return res.data;
};

export const deleteLesson = async (id: number) => {
  await api.delete(`/ejercicios/lecciones/${id}/`);
};

// ============================
// 🟡 CRUD de Preguntas
// ============================

export const getQuestions = async (lessonId?: number): Promise<Question[]> => {
  try {
    // Realizamos la solicitud GET, agregando el `lessonId` si está presente
    const res = await api.get("/ejercicios/preguntas/", {
      params: lessonId ? { lesson: lessonId } : {},
      withCredentials: true, // Asegura el envío de cookies/token si es necesario
    });

    // Log para verificar la respuesta de la API
    console.log("Respuesta de la API para las preguntas:", res.data);

    // Verificamos si la respuesta es un arreglo
    if (Array.isArray(res.data)) {
      return res.data as Question[];  // Si es un arreglo, lo retornamos como un array de preguntas
    } else {
      // Si no es un arreglo, mostramos una advertencia
      console.warn("⚠️ El backend no devolvió un arreglo de preguntas:", res.data);
      return [];
    }
  } catch (error) {
    // En caso de error, lo mostramos en consola
    console.error("❌ Error al obtener preguntas:", error);
    return [];  // Retornamos un arreglo vacío en caso de error
  }
};



export const createQuestion = async (data: Question) => {
  const res = await api.post("/ejercicios/preguntas/", data);
  return res.data;
};

export const updateQuestion = async (id: number, data: Question) => {
  const res = await api.put(`/ejercicios/preguntas/${id}/`, data);
  return res.data;
};

export const deleteQuestion = async (id: number) => {
  await api.delete(`/ejercicios/preguntas/${id}/`);
};

// ============================
// 🟣 Solicitudes de Permiso (profesores → admin)
// ============================

export const createPermissionRequest = async (data: {
  question?: number | null;
  lesson?: number | null;
  action_type: "edit" | "delete";
}) => {
  const body: any = { action_type: data.action_type };
  if (data.lesson != null) body.lesson = data.lesson;
  if (data.question != null) body.question = data.question;

  console.log("🔍 Enviando solicitud al backend:", body);
  const response = await api.post("/ejercicios/solicitudes/", body);
  return response.data;
};

// ============================
// 🔵 Progreso de Lecciones (estudiantes)
// ============================

export const markLessonCompleted = async (lessonId: number) => {
  try {
    const res = await api.post(`/ejercicios/lecciones/${lessonId}/completar/`);
    console.log("✅ Lección marcada como completada:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error al marcar la lección como completada:", error);
    throw error;
  }
};

export const getLessonProgress = async (): Promise<LessonProgress[]> => {
  try {
    const res = await api.get(`/ejercicios/progreso/`);
    return res.data as LessonProgress[];
  } catch (error) {
    console.error("❌ Error al obtener el progreso de lecciones:", error);
    return [];
  }
};
