// // src/commons/usuarios/components/LoginForm.tsx
// import React, { useState } from 'react';
// import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';
// import useAuth from '../hooks/useAuth';

// const LoginForm: React.FC = () => {
//   const { handleLogin, error, loading } = useAuth();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await handleLogin(username, password);
//     window.location.href = '/'; // Redirige tras login exitoso
//   };

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//       <Paper sx={{ p: 4, width: 350 }}>
//         <Typography variant="h5" mb={2}>
//           Iniciar sesión
//         </Typography>

//         <form onSubmit={onSubmit}>
//           <TextField
//             label="Usuario"
//             fullWidth
//             margin="normal"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <TextField
//             label="Contraseña"
//             type="password"
//             fullWidth
//             margin="normal"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           {error && (
//             <Typography color="error" sx={{ mt: 1 }}>
//               {error}
//             </Typography>
//           )}

//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             type="submit"
//             disabled={loading}
//             sx={{ mt: 2 }}
//           >
//             {loading ? 'Cargando...' : 'Entrar'}
//           </Button>
//         </form>

//         {/* 🔹 Enlaces adicionales */}
//         <Box sx={{ mt: 3, textAlign: 'center' }}>
//           <Typography variant="body2">
//             <Link href="/forgot-password" underline="hover">
//               ¿Olvidaste tu contraseña?
//             </Link>
//           </Typography>

//           <Typography variant="body2" sx={{ mt: 1 }}>
//             ¿No tienes cuenta?{' '}
//             <Link href="/register" underline="hover">
//               Regístrate
//             </Link>
//           </Typography>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default LoginForm;


// src/commons/usuarios/components/LoginForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

const LoginForm: React.FC = () => {
  const { handleLogin, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  /**
   * Validar campos antes de enviar
   */
  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'El usuario es requerido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await handleLogin({ username: username.trim(), password });
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  /**
   * Limpiar error al cambiar campos
   */
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (validationErrors.username) {
      setValidationErrors({ ...validationErrors, username: undefined });
    }
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors({ ...validationErrors, password: undefined });
    }
    if (error) clearError();
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: { xs: '90%', sm: 400 },
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            ¡Bienvenido! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inicia sesión para continuar
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={handleUsernameChange}
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

          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={handlePasswordChange}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
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

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            size="large"
            sx={{ mt: 3, mb: 2, height: 48 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Enlaces adicionales */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            <Link href="/forgot-password" underline="hover">
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" underline="hover" fontWeight="bold">
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;