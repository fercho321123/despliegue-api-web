// // src/commons/usuarios/services/userService.ts
// import api from '../../../api/axios';
// import { 
//   User, 
//   LoginCredentials, 
//   RegisterData, 
//   LoginResponse,
//   ChangePasswordData,
//   UpdateProfileData
// } from '../types/userTypes';

// // ❌❌❌ ASEGÚRATE DE QUE NO EXISTAN ESTAS LÍNEAS EN NINGUNA PARTE DEL ARCHIVO ❌❌❌
// // export interface User { ... }
// // export interface LoginData { ... }
// // export interface RegisterData { ... }

// // ----------------------
// // Autenticación
// // ----------------------
// export const login = async (data: LoginCredentials): Promise<User> => {
//   const response = await api.post<LoginResponse>('/usuarios/auth/login/', data);
//   const { access, refresh, user } = response.data;

//   localStorage.setItem('access', access);
//   localStorage.setItem('refresh', refresh);
//   localStorage.setItem('user', JSON.stringify(user));

//   return user;
// };

// export const logout = async (): Promise<void> => {
//   const refresh = localStorage.getItem('refresh');
//   if (refresh) {
//     try {
//       await api.post('/usuarios/auth/logout/', { refresh });
//     } catch (e) {
//       console.warn('Logout: token inválido o ya expirado.');
//     }
//   }

//   localStorage.removeItem('access');
//   localStorage.removeItem('refresh');
//   localStorage.removeItem('user');
// };

// // ----------------------
// // Registro de usuarios
// // ----------------------

// // 🔹 Registro libre (público)
// export const register = async (data: RegisterData): Promise<LoginResponse> => {
//   const response = await api.post<LoginResponse>('/usuarios/auth/register/', data);
  
//   // Guardar tokens si vienen en la respuesta
//   if (response.data.access && response.data.refresh) {
//     localStorage.setItem('access', response.data.access);
//     localStorage.setItem('refresh', response.data.refresh);
//     localStorage.setItem('user', JSON.stringify(response.data.user));
//   }
  
//   return response.data;
// };

// // 🔹 Creación de usuario desde el rol admin (requiere token)
// export const registerAdminUser = async (data: RegisterData): Promise<User> => {
//   const resp = await api.post<User>('/usuarios/admin/users/', data);
//   return resp.data;
// };

// // 🔹 Alias para uso en componentes de administración
// export const createUser = registerAdminUser;

// // ----------------------
// // Gestión de contraseñas
// // ----------------------
// export const changePassword = async (data: ChangePasswordData): Promise<void> => {
//   await api.put('/usuarios/auth/password/change/', data);
// };

// export const resetPassword = async (email: string): Promise<void> => {
//   await api.post('/usuarios/auth/password/reset/', { email });
// };

// // ----------------------
// // Gestión de usuarios
// // ----------------------
// export const getUsers = async (): Promise<User[]> => {
//   const response = await api.get<User[]>('/usuarios/admin/users/');
//   return response.data;
// };

// export const getUserById = async (id: number): Promise<User> => {
//   const response = await api.get<User>(`/usuarios/admin/users/${id}/`);
//   return response.data;
// };

// export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
//   const response = await api.patch<User>(`/usuarios/admin/users/${id}/`, data);
//   return response.data;
// };

// export const deleteUser = async (id: number): Promise<void> => {
//   await api.delete(`/usuarios/admin/users/${id}/`);
// };

// export const toggleUserActive = async (id: number): Promise<User> => {
//   const response = await api.patch<User>(`/usuarios/admin/users/${id}/toggle_active/`);
//   return response.data;
// };

// // ----------------------
// // Usuario actual
// // ----------------------
// export const getCurrentUser = (): User | null => {
//   const userStr = localStorage.getItem('user');
//   if (!userStr) return null;
  
//   try {
//     return JSON.parse(userStr) as User;
//   } catch (e) {
//     console.error('Error al parsear usuario:', e);
//     return null;
//   }
// };

// export const getMe = async (): Promise<User> => {
//   const response = await api.get<User>('/usuarios/me/');
  
//   // Actualizar usuario en localStorage
//   localStorage.setItem('user', JSON.stringify(response.data));
  
//   return response.data;
// };

// export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
//   const response = await api.patch<User>('/usuarios/me/update/', data);
  
//   // Actualizar usuario en localStorage
//   localStorage.setItem('user', JSON.stringify(response.data));
  
//   return response.data;
// };

// // ----------------------
// // Gestión de avatares
// // ----------------------
// export const updateAvatar = async (file: File): Promise<{ avatar_url: string }> => {
//   const formData = new FormData();
//   formData.append('avatar', file);
  
//   const response = await api.put<{ avatar: string }>('/usuarios/avatar/', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
  
//   // Actualizar usuario en localStorage
//   const currentUser = getCurrentUser();
//   if (currentUser) {
//     currentUser.avatar_url = response.data.avatar;
//     localStorage.setItem('user', JSON.stringify(currentUser));
//   }
  
//   return { avatar_url: response.data.avatar };
// };

// export const deleteAvatar = async (): Promise<void> => {
//   await api.delete('/usuarios/avatar/');
  
//   // Actualizar usuario en localStorage
//   const currentUser = getCurrentUser();
//   if (currentUser) {
//     currentUser.avatar = null;
//     currentUser.avatar_url = null;
//     localStorage.setItem('user', JSON.stringify(currentUser));
//   }
// };

// export const listAvatars = async (): Promise<Array<{ name: string; url: string }>> => {
//   const response = await api.get('/usuarios/avatars/');
//   return response.data.avatars;
// };

// // ----------------------
// // Estadísticas (solo admin)
// // ----------------------
// export const getUserStats = async () => {
//   const response = await api.get('/usuarios/admin/stats/');
//   return response.data;
// };

// // ----------------------
// // Verificar token
// // ----------------------
// export const verifyToken = async (token: string): Promise<boolean> => {
//   try {
//     await api.post('/usuarios/auth/token/verify/', { token });
//     return true;
//   } catch {
//     return false;
//   }
// };


// src/commons/usuarios/services/userService.ts
import api from '../../../api/axios';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  LoginResponse,
  ChangePasswordData,
  UpdateProfileData,
  PasswordResetData,
  UserFilters,
  Avatar,
  CreateUserData,
  UpdateUserData
} from '../types/userTypes';

// ----------------------
// Autenticación
// ----------------------
export const login = async (data: LoginCredentials): Promise<User> => {
  const response = await api.post<LoginResponse>('/usuarios/auth/login/', data);
  const { access, refresh, user } = response.data;

  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

export const logout = async (): Promise<void> => {
  const refresh = localStorage.getItem('refresh');
  if (refresh) {
    try {
      await api.post('/usuarios/auth/logout/', { refresh });
    } catch (e) {
      console.warn('Logout: token inválido o ya expirado.');
    }
  }

  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

// ----------------------
// Registro de usuarios
// ----------------------

// 🔹 Registro libre (público)
export const register = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/usuarios/auth/register/', data);
  
  // Guardar tokens si vienen en la respuesta
  if (response.data.access && response.data.refresh) {
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// 🔹 Creación de usuario desde el rol admin (requiere token)
export const registerAdminUser = async (data: RegisterData | CreateUserData): Promise<User> => {
  const resp = await api.post<User>('/usuarios/admin/users/', data);
  return resp.data;
};

// 🔹 Alias para uso en componentes de administración
export const createUser = registerAdminUser;

// ----------------------
// Gestión de contraseñas
// ----------------------
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.put('/usuarios/auth/password/change/', data);
};

export const resetPassword = async (email: string): Promise<void> => {
  await api.post('/usuarios/auth/password/reset/', { email });
};

// 🔹 Solicitar recuperación de contraseña (enviar email)
export const requestPasswordReset = async (data: PasswordResetData): Promise<void> => {
  await api.post('/usuarios/auth/password/reset/', data);
};

// ----------------------
// Gestión de usuarios
// ----------------------
export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();
  
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.role) {
    params.append('role', filters.role);
  }
  if (filters?.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString());
  }
  if (filters?.grade) {
    params.append('grade', filters.grade);
  }
  if (filters?.ordering) {
    params.append('ordering', filters.ordering);
  }

  const queryString = params.toString();
  const url = queryString ? `/usuarios/admin/users/?${queryString}` : '/usuarios/admin/users/';
  
  const response = await api.get(url); // Quité el tipo genérico <User[]>
  
  // 🔹 Ajuste: verificar si la respuesta es un array o un objeto
  const data = response.data;
  
  // Si es un objeto con 'results', devolver results
  if (data && typeof data === 'object' && 'results' in data) {
    return data.results as User[];
  }
  
  // Si ya es un array, devolverlo directamente
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si no es ninguno, devolver array vacío y loguear el error
  console.error('Formato de respuesta inesperado:', data);
  return [];
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/usuarios/admin/users/${id}/`);
  return response.data;
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  const response = await api.patch<User>(`/usuarios/admin/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/admin/users/${id}/`);
};

export const toggleUserActive = async (id: number): Promise<User> => {
  const response = await api.patch<User>(`/usuarios/admin/users/${id}/toggle_active/`);
  return response.data;
};

// ----------------------
// Usuario actual
// ----------------------
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error('Error al parsear usuario:', e);
    return null;
  }
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/usuarios/me/');
  
  // Actualizar usuario en localStorage
  localStorage.setItem('user', JSON.stringify(response.data));
  
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.patch<User>('/usuarios/me/update/', data);
  
  // Actualizar usuario en localStorage
  localStorage.setItem('user', JSON.stringify(response.data));
  
  return response.data;
};

// 🔹 Alias para compatibilidad
export const updateMe = updateProfile;

// ----------------------
// Gestión de avatares
// ----------------------
export const updateAvatar = async (file: File): Promise<{ avatar_url: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.put<{ avatar: string }>('/usuarios/avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Actualizar usuario en localStorage
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.avatar_url = response.data.avatar;
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
  
  return { avatar_url: response.data.avatar };
};

export const deleteAvatar = async (): Promise<void> => {
  await api.delete('/usuarios/avatar/');
  
  // Actualizar usuario en localStorage
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.avatar = null;
    currentUser.avatar_url = null;
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
};

export const listAvatars = async (): Promise<Avatar[]> => {
  const response = await api.get<{ avatars: Avatar[] }>('/usuarios/avatars/');
  return response.data.avatars;
};

// 🔹 Alias para compatibilidad
export const getAvailableAvatars = listAvatars;

// ----------------------
// Estadísticas (solo admin)
// ----------------------
export const getUserStats = async () => {
  const response = await api.get('/usuarios/admin/stats/');
  return response.data;
};

// ----------------------
// Verificar token
// ----------------------
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await api.post('/usuarios/auth/token/verify/', { token });
    return true;
  } catch {
    return false;
  }
};


// ----------------------
// Logs de actividad (solo admin)
// ----------------------

export interface ActivityLog {
  id: number;
  user: number;
  username: string;
  action: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
}

export interface ActivityLogFilters {
  user?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const getActivityLogs = async (filters?: ActivityLogFilters): Promise<ActivityLog[]> => {
  const params = new URLSearchParams();
  
  if (filters?.user) {
    params.append('user', filters.user.toString());
  }
  if (filters?.action) {
    params.append('action', filters.action);
  }
  if (filters?.start_date) {
    params.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    params.append('end_date', filters.end_date);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const url = queryString ? `/usuarios/admin/activity-logs/?${queryString}` : '/usuarios/admin/activity-logs/';
  
  const response = await api.get(url);
  const data = response.data;
  
  // 🔹 Mismo patrón: manejar respuesta paginada o array directo
  if (data && typeof data === 'object' && 'results' in data) {
    return data.results as ActivityLog[];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  console.error('Formato de respuesta inesperado en activity logs:', data);
  return [];
};