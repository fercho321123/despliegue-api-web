

// // src/commons/usuarios/types/userTypes.ts

// /**
//  * Roles disponibles en el sistema
//  */
// export type UserRole = 'admin' | 'teacher' | 'student';

// /**
//  * Grados escolares disponibles
//  */
// export type Grade = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';

// /**
//  * Interfaz principal de Usuario (sincronizada con backend UserSerializer)
//  * Todos los campos que SIEMPRE vienen del backend
//  */
// export interface User {
//   id: number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: UserRole;
//   role_display: string; // get_role_display()
//   avatar: string | null;
//   avatar_url: string | null;
//   grade: Grade | null;
//   subject_area: string | null;
//   is_active: boolean;
//   created_at: string;
// }

// /**
//  * Datos para login
//  */
// export interface LoginCredentials {
//   username: string;
//   password: string;
// }

// /**
//  * Respuesta del backend al hacer login
//  */
// export interface LoginResponse {
//   access: string;
//   refresh: string;
//   user: User;
// }

// /**
//  * Datos para registro público
//  */
// export interface RegisterData {
//   username: string;
//   email: string;
//   password: string;
//   password_confirm: string;
//   first_name?: string;
//   last_name?: string;
//   role?: UserRole;
//   grade?: Grade | null;
//   subject_area?: string | null;
// }

// /**
//  * Datos para crear usuario (admin)
//  */
// export interface CreateUserData {
//   username: string;
//   email: string;
//   password: string;
//   password_confirm: string;
//   first_name?: string;
//   last_name?: string;
//   role: UserRole;
//   grade?: Grade | null;
//   subject_area?: string | null;
// }

// /**
//  * Datos para actualizar usuario (todos opcionales)
//  */
// export interface UpdateUserData {
//   username?: string;
//   email?: string;
//   first_name?: string;
//   last_name?: string;
//   role?: UserRole;
//   grade?: Grade | null;
//   subject_area?: string | null;
// }

// /**
//  * Datos para actualizar perfil propio (solo campos permitidos)
//  */
// export interface UpdateProfileData {
//   first_name?: string;
//   last_name?: string;
//   email?: string;
// }

// /**
//  * Datos para cambio de contraseña
//  */
// export interface ChangePasswordData {
//   old_password: string;
//   new_password: string;
//   new_password_confirm: string;
// }

// /**
//  * Datos para recuperar contraseña
//  */
// export interface PasswordResetData {
//   email: string;
// }

// /**
//  * Respuesta de error de la API
//  */
// export interface ApiError {
//   error?: string;
//   detail?: string;
//   [key: string]: any; // Para errores de campo específicos
// }

// /**
//  * Filtros para listar usuarios
//  */
// export interface UserFilters {
//   role?: UserRole;
//   grade?: Grade;
//   is_active?: boolean;
//   search?: string;
//   ordering?: string;
// }

// /**
//  * Avatar predefinido
//  */
// export interface Avatar {
//   name: string;
//   url: string;
// }

// /**
//  * Estadísticas de usuarios (solo admin)
//  */
// export interface UserStats {
//   total: number;
//   active: number;
//   inactive: number;
//   by_role: Array<{ role: string; count: number }>;
//   students_by_grade?: Array<{ grade: string; count: number }>;
// }


// src/commons/usuarios/types/userTypes.ts

/**
 * Roles disponibles en el sistema
 */
export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * Grados escolares disponibles
 */
export type Grade = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';

/**
 * Interfaz principal de Usuario (sincronizada con backend UserSerializer)
 * Todos los campos que SIEMPRE vienen del backend
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  role_display: string;
  avatar: string | null;
  avatar_url: string | null;
  grade: Grade | null;
  subject_area: string | null;
  is_active: boolean;
  created_at: string;
  telefono1: string ;// ver


}

/**
 * Datos para login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Respuesta del backend al hacer login
 */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Datos base para registro/creación de usuario
 */
interface BaseUserData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefono1?:string;
}

/**
 * Datos base para operaciones que requieren contraseña
 */
interface PasswordData {
  password: string;
  password_confirm: string;
}

/**
 * Datos para registro público
 */
export interface RegisterData extends BaseUserData, PasswordData {
  role?: UserRole;
  grade?: Grade;
  subject_area?: string;
}

/**
 * Datos para creación de usuario (admin)
 */
export interface CreateUserData extends BaseUserData, PasswordData {
  role: UserRole;
  grade?: Grade;
  subject_area?: string;
}

/**
 * Datos para actualizar usuario (todos opcionales)
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  grade?: Grade;
  subject_area?: string;
  telefono1?:string;
}

/**
 * Datos para actualizar perfil propio (solo campos permitidos)
 */
export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  telefono1?: string;
}

/**
 * Datos para cambio de contraseña
 */
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * Datos para recuperar contraseña
 */
export interface PasswordResetData {
  email: string;
}

/**
 * Respuesta de error de la API
 */
export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: any;
}

/**
 * Filtros para listar usuarios
 */
export interface UserFilters {
  role?: UserRole;
  grade?: Grade;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

/**
 * Avatar predefinido
 */
export interface Avatar {
  name: string;
  url: string;
}

/**
 * Estadísticas de usuarios (solo admin)
 */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: Array<{ role: string; count: number }>;
  students_by_grade?: Array<{ grade: string; count: number }>;
}


/**
 * Log de actividad
 */
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

/**
 * Filtros para logs de actividad
 */
export interface ActivityLogFilters {
  user?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}



