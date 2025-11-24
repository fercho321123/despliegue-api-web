// // src/commons/usuarios/screens/UserListScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Button,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from '@mui/material';
// import { getUsers, User } from '../services/userService';
// import UserModal from '../components/UserModal';
// import api from '../../../api/axios';

// const UserListScreen: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState<User | null>(null);

//   // 🔹 Cargar usuarios desde el backend
//   const fetchUsers = async () => {
//     try {
//       const data = await getUsers();
//       setUsers(data);
//     } catch (error) {
//       console.error('Error al cargar usuarios:', error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // 🔹 Guardar (solo refresca lista después del modal)
//   const handleSave = async () => {
//     await fetchUsers(); // refresca después de crear o editar
//     setOpen(false);
//   };

//   // 🔹 Eliminar usuario
//   const handleDelete = async (id: number) => {
//     if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
//       try {
//         await api.delete(`/usuarios/admin/users/${id}/`);
//         await fetchUsers();
//       } catch (error) {
//         console.error('Error al eliminar usuario', error);
//         alert('No se pudo eliminar el usuario.');
//       }
//     }
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h5" mb={2}>
//         Gestión de Usuarios
//       </Typography>

//       <Button
//         variant="contained"
//         onClick={() => {
//           setSelected(null);
//           setOpen(true);
//         }}
//       >
//         Nuevo Usuario
//       </Button>

//       <Table sx={{ mt: 2 }}>
//         <TableHead>
//           <TableRow>
//             <TableCell>ID</TableCell>
//             <TableCell>Usuario</TableCell>
//             <TableCell>Email</TableCell>
//             <TableCell>Rol</TableCell>
//             <TableCell align="right">Acciones</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {users.map((u) => (
//             <TableRow key={u.id} hover>
//               <TableCell>{u.id}</TableCell>
//               <TableCell>{u.username}</TableCell>
//               <TableCell>{u.email}</TableCell>
//               <TableCell>{u.role}</TableCell>
//               <TableCell align="right">
//                 <Button
//                   size="small"
//                   onClick={() => {
//                     setSelected(u);
//                     setOpen(true);
//                   }}
//                 >
//                   Editar
//                 </Button>
//                 <Button
//                   size="small"
//                   color="error"
//                   onClick={() => handleDelete(u.id)}
//                 >
//                   Eliminar
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <UserModal
//         open={open}
//         onClose={() => setOpen(false)}
//         onSave={handleSave} // ✅ ya no hace post ni put aquí
//         user={selected}
//       />
//     </Box>
//   );
// };

// export default UserListScreen;


// src/commons/usuarios/screens/UserListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  TableContainer,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  PersonOff,
  Person,
} from '@mui/icons-material';
import { getUsers, deleteUser, toggleUserActive } from '../services/userService';
import { User, UserFilters, UserRole } from '../types/userTypes';
import UserModal from '../components/UserModal';
import { useAuthContext } from '../hooks/AuthContext';

const UserListScreen: React.FC = () => {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filtros
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: undefined,
    is_active: undefined,
  });

  /**
   * Cargar usuarios
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers(filters);
      setUsers(data);
    } catch (err: any) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Cargar al montar

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = () => {
    fetchUsers();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setFilters({ search: '', role: undefined, is_active: undefined });
  };

  /**
   * Abrir modal para crear
   */
  const handleCreate = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  /**
   * Abrir modal para editar
   */
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  /**
   * Eliminar usuario
   */
  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (!window.confirm(`¿Eliminar a ${user.username}?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  /**
   * Activar/Desactivar usuario
   */
  const handleToggleActive = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }

    try {
      await toggleUserActive(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  /**
   * Obtener color del rol
   */
  const getRoleColor = (role: UserRole) => {
    switch (role) {
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          👥 Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          size="large"
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Buscar por nombre o email..."
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Rol"
            size="small"
            value={filters.role || ''}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value as UserRole | undefined })
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="teacher">Docente</MenuItem>
            <MenuItem value="student">Estudiante</MenuItem>
          </TextField>

          <TextField
            select
            label="Estado"
            size="small"
            value={filters.is_active === undefined ? '' : filters.is_active.toString()}
            onChange={(e) =>
              setFilters({
                ...filters,
                is_active:
                  e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activos</MenuItem>
            <MenuItem value="false">Inactivos</MenuItem>
          </TextField>

          <Button variant="contained" onClick={handleApplyFilters} startIcon={<Search />}>
            Buscar
          </Button>

          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>

          <IconButton onClick={fetchUsers} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={3}>
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <strong>{user.username}</strong>
                    </TableCell>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telefono1 || '-'}</TableCell>

                    <TableCell>
                      <Chip
                        label={user.role_display || user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Activo' : 'Inactivo'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={user.is_active ? 'Desactivar' : 'Activar'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(user)}
                          color={user.is_active ? 'warning' : 'success'}
                        >
                          {user.is_active ? <PersonOff /> : <Person />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(user)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={fetchUsers}
        user={selectedUser}
      />
    </Box>
  );
};

export default UserListScreen;

