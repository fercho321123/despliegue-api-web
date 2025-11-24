// // src/commons/usuarios/components/UserModal.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Button,
//   MenuItem,
// } from '@mui/material';
// import { User } from '../services/userService';
// import api from '../../../api/axios';
// import { registerAdminUser } from '../services/userService';

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onSave: (user: Partial<User> & { password?: string }) => void;
//   user?: User | null;
// }

// const emptyForm: Partial<User> & { password?: string } = {
//   username: '',
//   email: '',
//   password: '',
//   role: 'student',
// };

// const UserModal: React.FC<Props> = ({ open, onClose, onSave, user }) => {
//   const [form, setForm] = useState<Partial<User> & { password?: string }>(emptyForm);
//   const [isSaving, setIsSaving] = useState(false); // ✅ Nuevo estado

//   useEffect(() => {
//     if (user) {
//       setForm({
//         username: user.username,
//         email: user.email,
//         password: '',
//         role: user.role,
//       });
//     } else {
//       setForm(emptyForm);
//     }
//   }, [user, open]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSave = async () => {
//     try {
//       if (!form.username || !form.email || (!user && !form.password)) {
//         alert('Por favor completa todos los campos obligatorios.');
//         return;
//       }

//       setIsSaving(true); // ⏳ Desactiva botón mientras guarda

//       if (user) {
//         // 🔹 EDITAR
//         await api.put(`/usuarios/admin/users/${user.id}/`, {
//           username: form.username.trim(),
//           email: form.email.trim(),
//           role: form.role,
//         });
//       } else {
//         // 🔹 CREAR
//         await registerAdminUser({
//           username: form.username.trim(),
//           email: form.email.trim(),
//           password: form.password!.trim(),
//           role: form.role || 'student',
//         });
//       }

//       onSave(form);
//       setForm(emptyForm);
//       onClose();
//     } catch (err: any) {
//       console.error('❌ Error al guardar usuario:', err);
//       const msg =
//         err.response?.data?.username?.[0] ||
//         err.response?.data?.error ||
//         err.response?.data?.detail ||
//         'Error al guardar el usuario. Verifica los datos.';
//       alert(msg);
//     } finally {
//       setIsSaving(false); // ✅ Rehabilita el botón
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={() => {
//         setForm(emptyForm);
//         onClose();
//       }}
//     >
//       <DialogTitle>{user ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
//       <DialogContent>
//         <TextField
//           name="username"
//           label="Usuario"
//           fullWidth
//           margin="dense"
//           value={form.username}
//           onChange={handleChange}
//         />
//         <TextField
//           name="email"
//           label="Correo electrónico"
//           fullWidth
//           margin="dense"
//           value={form.email}
//           onChange={handleChange}
//         />

//         {!user && (
//           <TextField
//             name="password"
//             label="Contraseña"
//             type="password"
//             fullWidth
//             margin="dense"
//             value={form.password}
//             onChange={handleChange}
//           />
//         )}

//         <TextField
//           select
//           name="role"
//           label="Rol"
//           fullWidth
//           margin="dense"
//           value={form.role}
//           onChange={handleChange}
//         >
//           <MenuItem value="admin">Administrador</MenuItem>
//           <MenuItem value="teacher">Docente</MenuItem>
//           <MenuItem value="student">Estudiante</MenuItem>
//         </TextField>
//       </DialogContent>

//       <DialogActions>
//         <Button
//           onClick={() => {
//             setForm(emptyForm);
//             onClose();
//           }}
//           disabled={isSaving}
//         >
//           Cancelar
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleSave}
//           disabled={isSaving}
//         >
//           {isSaving ? 'Guardando...' : 'Guardar'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default UserModal;


// src/commons/usuarios/components/UserModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Box,
} from '@mui/material';
import { User, CreateUserData, UpdateUserData, UserRole, Grade } from '../types/userTypes';
import { registerAdminUser, updateUser } from '../services/userService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'teacher', label: 'Docente' },
  { value: 'student', label: 'Estudiante' },
];

const GRADES: { value: Grade; label: string }[] = [
  { value: '1', label: '1°' },
  { value: '2', label: '2°' },
  { value: '3', label: '3°' },
  { value: '4', label: '4°' },
  { value: '5', label: '5°' },
  { value: '6', label: '6°' },
  { value: '7', label: '7°' },
  { value: '8', label: '8°' },
  { value: '9', label: '9°' },
  { value: '10', label: '10°' },
  { value: '11', label: '11°' },
];

const UserModal: React.FC<Props> = ({ open, onClose, onSave, user }) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student' as UserRole,
    grade: '' as Grade | '',
    subject_area: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Cargar datos del usuario si es edición
   */
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
          password_confirm: '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role,
          grade: user.grade || '',
          subject_area: user.subject_area || '',
        });
      } else {
        setFormData({
          username: '',
          email: '',
          password: '',
          password_confirm: '',
          first_name: '',
          last_name: '',
          role: 'student',
          grade: '',
          subject_area: '',
        });
      }
      setError('');
    }
  }, [open, user]);

  /**
   * Manejar cambios en los campos
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  /**
   * Validar formulario
   */
  const validateForm = (): string | null => {
    if (!formData.username.trim()) {
      return 'El nombre de usuario es requerido';
    }
    if (!formData.email.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!isEditing) {
      if (!formData.password) {
        return 'La contraseña es requerida';
      }
      if (formData.password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (formData.password !== formData.password_confirm) {
        return 'Las contraseñas no coinciden';
      }
    }
    if (formData.role === 'student' && !formData.grade) {
      return 'Los estudiantes deben tener un grado asignado';
    }
    if (formData.role === 'teacher' && !formData.subject_area.trim()) {
      return 'Los docentes deben tener un área asignada';
    }
    return null;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && user) {
        const updateData: UpdateUserData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          role: formData.role,
          grade: formData.role === 'student' ? (formData.grade as Grade) : undefined,
          subject_area: formData.role === 'teacher' ? formData.subject_area.trim() : undefined,
        };
        await updateUser(user.id, updateData);
      } else {
        const createData: CreateUserData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password_confirm: formData.password_confirm,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          role: formData.role,
          grade: formData.role === 'student' ? (formData.grade as Grade) : undefined,
          subject_area: formData.role === 'teacher' ? formData.subject_area.trim() : undefined,
        };
        await registerAdminUser(createData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      const apiError = err.response?.data;
      const errorMessage =
        apiError?.username?.[0] ||
        apiError?.email?.[0] ||
        apiError?.password?.[0] ||
        apiError?.error ||
        apiError?.detail ||
        'Error al guardar el usuario';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? '✏️ Editar Usuario' : '➕ Crear Usuario'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            name="username"
            label="Usuario *"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            name="email"
            label="Correo Electrónico *"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

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

          {!isEditing && (
            <>
              <TextField
                name="password"
                label="Contraseña *"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                helperText="Mínimo 8 caracteres"
              />

              <TextField
                name="password_confirm"
                label="Confirmar Contraseña *"
                type="password"
                fullWidth
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={loading}
              />
            </>
          )}

          <TextField
            select
            name="role"
            label="Rol *"
            fullWidth
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            {ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>

          {formData.role === 'student' && (
            <TextField
              select
              name="grade"
              label="Grado *"
              fullWidth
              value={formData.grade}
              onChange={handleChange}
              disabled={loading}
            >
              {GRADES.map((grade) => (
                <MenuItem key={grade.value} value={grade.value}>
                  {grade.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {formData.role === 'teacher' && (
            <TextField
              name="subject_area"
              label="Área de Enseñanza *"
              fullWidth
              value={formData.subject_area}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: Matemáticas"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;