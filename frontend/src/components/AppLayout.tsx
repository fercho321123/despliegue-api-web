
// import React from 'react';
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { Box, Drawer, List, ListItemButton, Toolbar, Button } from '@mui/material';
// import ChatScreen from '../commons/chatbot/screens/ChatScreen';
// import HomeScreen from './HomeScreen';
// import UserListScreen from '../commons/usuarios/screens/UserListScreen';
// import LoginScreen from '../commons/usuarios/screens/LoginScreen';
// import RegisterScreen from '../commons/usuarios/screens/RegisterScreen';
// import ForgotPasswordScreen from '../commons/usuarios/screens/ForgotPasswordScreen';
// import UserProfileScreen from '../commons/usuarios/screens/UserProfileScreen';
// import LessonListScreen from '../commons/ejercicios/screens/LessonListScreen';
// import QuestionListScreen from '../commons/ejercicios/screens/QuestionListScreen';
// import ActivityLogScreen from '../commons/ejercicios/screens/ActivityLogScreen'; // ✅ Nuevo
// import { useAuthContext } from '../commons/usuarios/hooks/AuthContext';
// import LessonReadScreen from "../commons/ejercicios/screens/LessonReadScreen";
// import StudentQuizScreen from "../commons/ejercicios/screens/StudentQuizScreen";

// const drawerWidth = 240;

// const AppLayout: React.FC = () => {
//   const { user, logoutUser } = useAuthContext();

//   return (
//     <BrowserRouter>
//       <Box sx={{ display: 'flex' }}>
//         {/* 🔹 Menú lateral visible solo si hay usuario logueado */}
//         {user && (
//           <Drawer
//             variant="permanent"
//             sx={{
//               width: drawerWidth,
//               '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
//             }}
//           >
//             <Toolbar />
//             <List>
//               <ListItemButton component={Link} to="/">Home</ListItemButton>

//               {/* 🔸 Opciones específicas para Admin */}
//               {user.role === 'admin' && (
//                 <>
//                   <ListItemButton component={Link} to="/users">
//                     Usuarios
//                   </ListItemButton>
//                   <ListItemButton component={Link} to="/activity-log">
//                     Historial
//                   </ListItemButton> {/* ✅ Solo admin ve el historial */}
//                 </>
//               )}

//               {/* 🔸 Chatbot disponible para docente o estudiante */}
//               {(user.role === 'teacher' || user.role === 'student') && (
//                 <ListItemButton component={Link} to="/chat">
//                   Chatbot
//                 </ListItemButton>
//               )}

//               {/* 🔸 Rutas comunes para docentes y admin */}
//               {user.role !== 'student' && (
//                 <>
//                   <ListItemButton component={Link} to="/lecciones">
//                     Lecciones
//                   </ListItemButton>
//                   <ListItemButton component={Link} to="/preguntas">
//                     Preguntas
//                   </ListItemButton>
//                 </>
//               )}

//               {/* 🔸 Perfil */}
//               <ListItemButton component={Link} to="/profile">
//                 Perfil
//               </ListItemButton>

//               {/* 🔸 Logout */}
//               <ListItemButton onClick={() => logoutUser()}>
//                 <Button variant="text" color="error" fullWidth>
//                   Cerrar sesión
//                 </Button>
//               </ListItemButton>
//             </List>
//           </Drawer>
//         )}

//         {/* 🔹 Contenido principal */}
//         <Box
//           component="main"
//           sx={{ flex: 1, ml: user ? `${drawerWidth}px` : 0, p: 2 }}
//         >
//           <Routes>
//             {/* 🟢 Rutas públicas */}
//             <Route path="/login" element={<LoginScreen />} />
//             <Route path="/register" element={<RegisterScreen />} />
//             <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

//             {/* 🟣 Rutas privadas */}
//             {user ? (
//               <>
//                 <Route path="/" element={<HomeScreen />} />
//                 <Route path="/chat" element={<ChatScreen />} />
//                 <Route path="/users" element={<UserListScreen />} />
//                 <Route path="/profile" element={<UserProfileScreen />} />
//                 <Route path="/lecciones" element={<LessonListScreen />} />
//                 <Route path="/preguntas" element={<QuestionListScreen />} />
//                 <Route path="/activity-log" element={<ActivityLogScreen />} /> 
//                 <Route path="/leccion/:lessonId" element={<LessonReadScreen />} />
// <Route path="/leccion/:lessonId/preguntas" element={<QuestionQuizScreen />} />{/* ✅ Ruta solo admin */}
//               </>
//             ) : (
//               <Route path="*" element={<LoginScreen />} />
//             )}
//           </Routes>
//         </Box>
//       </Box>
//     </BrowserRouter>
//   );
// };

// export default AppLayout;

// src/components/AppLayout.tsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  Toolbar,
  Button,
} from "@mui/material";

import ChatScreen from "../commons/chatbot/screens/ChatScreen";
import HomeScreen from "./HomeScreen";
import UserListScreen from "../commons/usuarios/screens/UserListScreen";
import LoginScreen from "../commons/usuarios/screens/LoginScreen";
import RegisterScreen from "../commons/usuarios/screens/RegisterScreen";
import ForgotPasswordScreen from "../commons/usuarios/screens/ForgotPasswordScreen";
import UserProfileScreen from "../commons/usuarios/screens/UserProfileScreen";
import LessonListScreen from "../commons/ejercicios/screens/LessonListScreen";
import QuestionListScreen from "../commons/ejercicios/screens/QuestionListScreen";
import ActivityLogScreen from "../commons/ejercicios/screens/ActivityLogScreen";
import LessonReadScreen from "../commons/ejercicios/screens/LessonReadScreen";
import StudentQuizScreen from "../commons/ejercicios/screens/StudentQuizScreen";
import { useAuthContext } from "../commons/usuarios/hooks/AuthContext";
import StudentLessonListScreen from "../commons/ejercicios/screens/StudentLessonListScreen";

const drawerWidth = 240;

const AppLayout: React.FC = () => {
  const { user, logoutUser } = useAuthContext();

  return (
    <Box sx={{ display: "flex" }}>
      {/* 🔹 Menú lateral visible solo si hay usuario logueado */}
      {user && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <List>
            {/* 🏠 Inicio */}
            <ListItemButton component={Link} to="/">🏠 Inicio</ListItemButton>

            {/* 🔸 Opciones específicas para ADMIN */}
            {user.role === 'admin' && (
              <>
                <ListItemButton component={Link} to="/users">👥 Usuarios</ListItemButton>
                <ListItemButton component={Link} to="/activity-log">📜 Historial</ListItemButton>
                <ListItemButton component={Link} to="/lecciones">📘 Lecciones</ListItemButton>
                <ListItemButton component={Link} to="/preguntas">❓ Preguntas</ListItemButton>
                <ListItemButton component={Link} to="/chat">💬 Chatbot</ListItemButton>
              </>
            )}

            {/* 🧑‍🏫 Docente */}
            {user.role === 'teacher' && (
              <>
                <ListItemButton component={Link} to="/lecciones">📘 Mis Lecciones</ListItemButton>
                <ListItemButton component={Link} to="/preguntas">❓ Mis Preguntas</ListItemButton>
                <ListItemButton component={Link} to="/progreso">📊 Progreso Estudiantes</ListItemButton>
                <ListItemButton component={Link} to="/chat">💬 Chatbot</ListItemButton>
              </>
            )}

            {/* 🧑‍🎓 Estudiante */}
            {user.role === 'student' && (
              <>
                <ListItemButton component={Link} to="/lecciones">📘 Lecciones</ListItemButton>
                <ListItemButton component={Link} to="/preguntas">📝 Preguntas</ListItemButton>
                <ListItemButton component={Link} to="/chat">💬 Chatbot</ListItemButton>
              </>
            )}

            {/* 👤 Perfil */}
            <ListItemButton component={Link} to="/profile">👤 Perfil</ListItemButton>

            {/* 🚪 Cerrar sesión */}
            <ListItemButton onClick={() => logoutUser()}>
              <Button variant="text" color="error" fullWidth>
                Cerrar sesión
              </Button>
            </ListItemButton>
          </List>


        </Drawer>
      )}

      {/* 🔹 Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: user ? `${drawerWidth}px` : 0,
          p: 2,
        }}
      >
        <Routes>
          {/* 🟢 Rutas públicas */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

          {/* 🟣 Rutas privadas */}

          {user ? (
            <>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/chat" element={<ChatScreen />} />
              <Route path="/users" element={<UserListScreen />} />
              <Route path="/profile" element={<UserProfileScreen />} />
              <Route path="/activity-log" element={<ActivityLogScreen />} />

              {/* 🧑‍🏫 Docentes y Admin */}
              {(user.role?.toLowerCase() === "teacher" || user.role?.toLowerCase() === "admin") && (
                <>
                  <Route path="/lecciones" element={<LessonListScreen />} />
                  <Route path="/preguntas" element={<QuestionListScreen />} />
                </>
              )}

              {/* 👨‍🎓 Estudiantes */}
              {user.role?.toLowerCase() === "student" && (
                <>
                  {/* Lista de lecciones del estudiante */}
                  <Route path="/lecciones" element={<StudentLessonListScreen />} />

                  {/* Lección individual (leer) */}
                  <Route path="/leccion/:lessonId" element={<LessonReadScreen />} />

                  {/* Preguntas para el estudiante */}
                  <Route path="/leccion/:lessonId/quiz" element={<StudentQuizScreen />} />

                </>
              )}
            </>
          ) : (
            <Route path="*" element={<LoginScreen />} />
          )}

        </Routes>
      </Box>
    </Box>
  );
};

export default AppLayout;
