// // src/commons/usuarios/screens/UserProfileScreen.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Button,
//   Divider,
//   Avatar,
// } from '@mui/material';
// import ChangePasswordDialog from '../components/ChangePasswordDialog';
// import { getCurrentUser, updateAvatar } from '../services/userService';
// import axios from 'axios';

// const UserProfileScreen: React.FC = () => {
//   const [user, setUser] = useState<any>(getCurrentUser()); // 👈 ahora manejamos user con estado
//   const [openChangePassword, setOpenChangePassword] = useState(false);

//   // Lista de avatares predeterminados
//   const defaultAvatars = [
//     '/media/avatar/avatar1.png',
//     '/media/avatar/avatar2.png',
//     '/media/avatar/avatar3.png',
//     '/media/avatar/avatar4.png',
//   ];

//   // Cargar usuario actual (por si cambia el avatar desde otra parte)
//   // useEffect(() => {
//   //   const fetchUser = async () => {
//   //     try {
//   //       const { data } = await axios.get('http://127.0.0.1:8000/api/usuarios/me/');
//   //       setUser(data);
//   //     } catch (error) {
//   //       console.error('Error al obtener los datos del usuario:', error);
//   //     }
//   //   };
//   //   fetchUser();
//   // }, []);
//   useEffect(() => {
//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem('token'); // 👈 obtiene el token guardado al iniciar sesión

//       if (!token) {
//         console.error("⚠️ No hay token guardado en localStorage");
//         return;
//       }

//       const { data } = await axios.get('http://127.0.0.1:8000/api/usuarios/me/', {
//         headers: {
//           Authorization: `Bearer ${token}`, // 👈 importante
//         },
//       });

//       setUser(data);
//     } catch (error) {
//       console.error('❌ Error al obtener los datos del usuario:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         console.error("El token no es válido o ha expirado. Debes volver a iniciar sesión.");
//       }
//     }
//   };

//   fetchUser();
// }, []);

//   if (!user) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <Typography variant="h6" color="error">
//           No hay sesión activa.
//         </Typography>
//       </Box>
//     );
//   }

//   // ✅ Manejar selección de avatar
//   const handleAvatarSelect = async (avatarUrl: string) => {
//     try {
//       await updateAvatar(avatarUrl);
//       console.log('Avatar actualizado correctamente');

//       // 🔄 Actualizar el estado local del usuario para reflejar el cambio
//       setUser((prevUser: any) => ({
//         ...prevUser,
//         avatar: avatarUrl,
//       }));
//     } catch (error) {
//       console.error('Error al seleccionar el avatar:', error);
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//       <Paper sx={{ p: 4, width: 400, textAlign: 'center' }}>
//         <Typography variant="h5" mb={2}>Configuración de Perfil</Typography>
//         <Divider sx={{ mb: 2 }} />

//         {/* 🧑‍🎓 Avatar actual del usuario */}
//         <Box display="flex" justifyContent="center" mb={2}>
//           <Avatar
//             sx={{ width: 100, height: 100 }}
//             src={user.avatar ? `http://127.0.0.1:8000${user.avatar}` : undefined}
//           />
//         </Box>

//         {/* 🎨 Selección de avatares */}
//         <Typography variant="h6" align="center" mb={1}>
//           Selecciona un Avatar
//         </Typography>
//         <Box display="flex" justifyContent="center" mb={2}>
//           {defaultAvatars.map((avatarUrl, index) => (
//             <img
//               key={index}
//               src={`http://127.0.0.1:8000${avatarUrl}`}
//               alt={`Avatar ${index + 1}`}
//               onClick={() => handleAvatarSelect(avatarUrl)}
//               style={{
//                 width: 50,
//                 height: 50,
//                 margin: '0 5px',
//                 borderRadius: '50%',
//                 cursor: 'pointer',
//                 border: user.avatar === avatarUrl ? '3px solid blue' : '2px solid transparent',
//               }}
//             />
//           ))}
//         </Box>

//         {/* 🧾 Información del usuario */}
//         <Typography><strong>Usuario:</strong> {user.username}</Typography>
//         <Typography><strong>Correo:</strong> {user.email}</Typography>
//         <Typography><strong>Rol:</strong> {user.role}</Typography>

//         <Divider sx={{ my: 3 }} />

//         <Button
//           variant="contained"
//           color="primary"
//           fullWidth
//           onClick={() => setOpenChangePassword(true)}
//         >
//           Cambiar Contraseña
//         </Button>

//         {/* Diálogo para cambiar la contraseña */}
//         <ChangePasswordDialog
//           open={openChangePassword}
//           onClose={() => setOpenChangePassword(false)}
//         />
//       </Paper>
//     </Box>
//   );
// };

// export default UserProfileScreen;

// src/commons/usuarios/screens/UserProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Avatar,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { Edit, Save, Cancel, CameraAlt, Lock } from '@mui/icons-material';
import ChangePasswordDialog from '../components/ChangePasswordDialog';
import { getMe, updateMe, updateAvatar, getAvailableAvatars } from '../services/userService';
import { useAuthContext } from '../hooks/AuthContext';
import { User, Avatar as AvatarType } from '../types/userTypes';

const UserProfileScreen: React.FC = () => {
  const { user: contextUser, updateUser } = useAuthContext();
  const [user, setUser] = useState<User | null>(contextUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState<AvatarType[]>([]);
  const [showAvatars, setShowAvatars] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    telefono1: user?.telefono1 || '', 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [freshUser, avatars] = await Promise.all([getMe(), getAvailableAvatars()]);
        setUser(freshUser);
        setAvailableAvatars(avatars);
        setFormData({
          first_name: freshUser.first_name || '',
          last_name: freshUser.last_name || '',
          email: freshUser.email,
          telefono1: freshUser.telefono1 || '',
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos del perfil');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateMe(formData);
      setUser(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        'Error al actualizar el perfil';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      telefono1: user?.telefono1 || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateAvatar(file);
      const freshUser = await getMe();
      setUser(freshUser);
      updateUser(freshUser);
      setSuccess('Avatar actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir el avatar');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Paper sx={{ p: 4, width: { xs: '100%', sm: 500 }, borderRadius: 3 }}>
        <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
          👤 Mi Perfil
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Avatar */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box position="relative">
            <Avatar
              sx={{ width: 120, height: 120, mb: 1 }}
              src={user.avatar_url || undefined}
              alt={user.username}
            >
              {!user.avatar_url && user.username[0].toUpperCase()}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
              size="small"
            >
              <CameraAlt fontSize="small" />
              <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
            </IconButton>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {user.username}
          </Typography>
          <Chip label={user.role_display || user.role} color={getRoleColor()} size="small" />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Formulario con Stack */}
        <Stack spacing={2}>
          <TextField
            name="first_name"
            label="Nombre"
            fullWidth
            value={formData.first_name}
            onChange={handleChange}
            disabled={!isEditing || loading}
          />
          <TextField
            name="last_name"
            label="Apellido"
            fullWidth
            value={formData.last_name}
            onChange={handleChange}
            disabled={!isEditing || loading}
          />
          <TextField
            name="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing || loading}
          />
          <TextField
            name="telefono1"
            label="Telefono"
            fullWidth
            value={formData.telefono1}
            onChange={handleChange}
            disabled={!isEditing || loading}
          />          

          <TextField label="Usuario" fullWidth value={user.username} disabled />

          {user.role === 'student' && user.grade && (
            <TextField label="Grado" fullWidth value={`${user.grade}°`} disabled />
          )}

          {user.role === 'teacher' && user.subject_area && (
            <TextField label="Área de Enseñanza" fullWidth value={user.subject_area} disabled />
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" gap={2}>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <Save />}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                disabled={loading}
                startIcon={<Cancel />}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setIsEditing(true)}
                startIcon={<Edit />}
              >
                Editar Perfil
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenChangePassword(true)}
                startIcon={<Lock />}
              >
                Cambiar Contraseña
              </Button>
            </>
          )}
        </Box>

        <ChangePasswordDialog
          open={openChangePassword}
          onClose={() => setOpenChangePassword(false)}
        />
      </Paper>
    </Box>
  );
};

export default UserProfileScreen;
