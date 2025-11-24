// import React, { useState } from 'react';
// import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';
// import api from '../../../api/axios';

// const ForgotPasswordScreen: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     try {
//       // 🔹 Aquí llamas a tu endpoint de recuperación (debes implementarlo en Django)
//       const response = await api.post('/usuarios/auth/password/reset/', { email });
//       setMessage(response.data.message || 'Se ha enviado un correo con las instrucciones.');
//     } catch (err: any) {
//       setError(err.response?.data?.error || 'Error al enviar el correo. Verifica el email.');
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//       <Paper sx={{ p: 4, width: 350 }}>
//         <Typography variant="h5" mb={2}>
//           Recuperar contraseña
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <TextField
//             label="Correo electrónico"
//             type="email"
//             fullWidth
//             margin="normal"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           {message && <Typography color="success.main">{message}</Typography>}
//           {error && <Typography color="error">{error}</Typography>}

//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             type="submit"
//             sx={{ mt: 2 }}
//           >
//             Enviar instrucciones
//           </Button>
//         </form>

//         <Box textAlign="center" mt={2}>
//           <Link href="/login" underline="hover">
//             Volver al inicio de sesión
//           </Link>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default ForgotPasswordScreen;


// src/commons/usuarios/screens/ForgotPasswordScreen.tsx
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
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { requestPasswordReset } from '../services/userService';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Validar email
   */
  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  /**
   * Manejar envío
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('El correo electrónico no es válido');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset({ email: email.trim() });
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Error al enviar el correo. Inténtalo de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
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
            ¿Olvidaste tu contraseña? 🔒
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Te enviaremos un correo con una contraseña temporal
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Se ha enviado un correo con instrucciones para recuperar tu contraseña.
            Revisa tu bandeja de entrada.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Formulario */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Correo Electrónico"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
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
              sx={{ mt: 3, height: 48 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Enviar Instrucciones'
              )}
            </Button>
          </form>
        )}

        {/* Enlace de regreso */}
        <Box textAlign="center" mt={3}>
          <Button
            component={Link}
            href="/login"
            startIcon={<ArrowBack />}
            sx={{ textTransform: 'none' }}
          >
            Volver al inicio de sesión
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordScreen;