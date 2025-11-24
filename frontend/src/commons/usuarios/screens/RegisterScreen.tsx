// import React, { useState } from 'react';
// import { Box, Button, TextField, Typography, Paper, MenuItem } from '@mui/material';
// import { register } from '../services/userService';

// const RegisterScreen: React.FC = () => {
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     password: '',
//     role: 'student',
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');
//     try {
//       const res = await register(form);
//       setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
//       setForm({ username: '', email: '', password: '', role: 'estudiante' });
//     } catch (err: any) {
//       console.error(err);
//       setMessage(err.response?.data?.username?.[0] || 'Error al registrar usuario.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//       <Paper sx={{ p: 4, width: 350 }}>
//         <Typography variant="h5" mb={2}>Registro</Typography>
//         <form onSubmit={handleRegister}>
//           <TextField
//             name="username"
//             label="Usuario"
//             fullWidth
//             margin="normal"
//             value={form.username}
//             onChange={handleChange}
//           />
//           <TextField
//             name="email"
//             label="Correo electrónico"
//             fullWidth
//             margin="normal"
//             value={form.email}
//             onChange={handleChange}
//           />
//           <TextField
//             name="password"
//             label="Contraseña"
//             type="password"
//             fullWidth
//             margin="normal"
//             value={form.password}
//             onChange={handleChange}
//           />
//           <TextField
//             select
//             name="role"
//             label="Rol"
//             fullWidth
//             margin="normal"
//             value={form.role}
//             onChange={handleChange}
//           >
//             <MenuItem value="student">Estudiante</MenuItem>
//             <MenuItem value="teacher">Docente</MenuItem>
//           </TextField>
//           {message && <Typography color="info.main" mt={1}>{message}</Typography>}
//           <Button
//             variant="contained"
//             fullWidth
//             type="submit"
//             disabled={loading}
//             sx={{ mt: 2 }}
//           >
//             {loading ? 'Registrando...' : 'Registrarse'}
//           </Button>
//         </form>
//         <Typography variant="body2" sx={{ mt: 2 }}>
//           ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
//         </Typography>
//       </Paper>
//     </Box>
//   );
// };

// export default RegisterScreen;

// src/commons/usuarios/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { RegisterData, Grade } from '../types/userTypes';

const GRADES: { value: Grade; label: string }[] = [
  { value: '1', label: '1° Primero' },
  { value: '2', label: '2° Segundo' },
  { value: '3', label: '3° Tercero' },
  { value: '4', label: '4° Cuarto' },
  { value: '5', label: '5° Quinto' },
  { value: '6', label: '6° Sexto' },
  { value: '7', label: '7° Séptimo' },
  { value: '8', label: '8° Octavo' },
  { value: '9', label: '9° Noveno' },
  { value: '10', label: '10° Décimo' },
  { value: '11', label: '11° Once' },
];

const RegisterScreen: React.FC = () => {
  const { handleRegister, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student',
    grade: undefined,
    subject_area: '',
  
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Manejar cambios en los campos
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error de validación del campo
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
    if (error) clearError();
  };

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Las contraseñas no coinciden';
    }

    if (formData.role === 'student' && !formData.grade) {
      errors.grade = 'Debes seleccionar un grado';
    }

    if (formData.role === 'teacher' && !formData.subject_area?.trim()) {
      errors.subject_area = 'Debes especificar tu área de enseñanza';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await handleRegister(formData);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: { xs: '90%', sm: 500 },
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Registro 📝
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu cuenta para comenzar
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Usuario */}
            <TextField
              name="username"
              label="Usuario *"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email */}
            <TextField
              name="email"
              label="Correo Electrónico *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {/* 🆕 CAMPO TELÉFONO */}
                      <TextField
                        name="telefono1"
                        label="Teléfono"
                        fullWidth
                        value={formData.telefono1}
                        onChange={handleChange}
                        error={!!validationErrors.telefono1}
                        helperText={validationErrors.telefono1 || 'Opcional. Ej: 3001234567'}
                        disabled={loading}
                        placeholder="3001234567"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                            </InputAdornment>
                          ),
                        }}
                      />
            

            {/* Nombre y Apellido */}
            <Box display="flex" gap={2}>
              <TextField
                name="first_name"
                label="Nombre"
                fullWidth
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                name="last_name"
                label="Apellido"
                fullWidth
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>

            {/* Contraseña */}
            <TextField
              name="password"
              label="Contraseña *"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password || 'Mínimo 8 caracteres'}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirmar Contraseña */}
            <TextField
              name="password_confirm"
              label="Confirmar Contraseña *"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={formData.password_confirm}
              onChange={handleChange}
              error={!!validationErrors.password_confirm}
              helperText={validationErrors.password_confirm}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Rol */}
            <TextField
              select
              name="role"
              label="Soy *"
              fullWidth
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="student">Estudiante</MenuItem>
              <MenuItem value="teacher">Docente</MenuItem>
            </TextField>

            {/* Grado (solo estudiantes) */}
            {formData.role === 'student' && (
              <TextField
                select
                name="grade"
                label="Grado *"
                fullWidth
                value={formData.grade || ''}
                onChange={handleChange}
                error={!!validationErrors.grade}
                helperText={validationErrors.grade}
                disabled={loading}
              >
                {GRADES.map((grade) => (
                  <MenuItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Área (solo docentes) */}
            {formData.role === 'teacher' && (
              <TextField
                name="subject_area"
                label="Área de Enseñanza *"
                fullWidth
                value={formData.subject_area}
                onChange={handleChange}
                error={!!validationErrors.subject_area}
                helperText={validationErrors.subject_area}
                disabled={loading}
                placeholder="Ej: Matemáticas"
              />
            )}
          </Stack>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            size="large"
            sx={{ mt: 3, height: 48 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </Button>
        </form>

        {/* Enlace a login */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" underline="hover" fontWeight="bold">
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterScreen;