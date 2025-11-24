// import { useState, useEffect } from 'react';
// import { login, logout, getCurrentUser, User } from '../services/userService';

// export default function useAuth() {
//   const [user, setUser] = useState<User | null>(getCurrentUser());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleLogin = async (username: string, password: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const loggedUser = await login({ username, password });
//       setUser(loggedUser);
//     } catch (err: any) {
//       console.error(err);
//       setError('Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     setUser(null);
//   };

//   return {
//     user,
//     loading,
//     error,
//     handleLogin,
//     handleLogout,
//   };
// }

// src/commons/usuarios/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/userService';
import { useAuthContext } from './AuthContext';
import { LoginCredentials, RegisterData, ApiError, User } from '../types/userTypes';

/**
 * Hook personalizado para manejar autenticación
 * Compatible con múltiples estilos de uso
 */
export const useAuth = () => {
  const { loginUser, logoutUser, user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Manejar inicio de sesión (2 sobrecargas)
   */
  const handleLogin = async (usernameOrCredentials: string | LoginCredentials, password?: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      let credentials: LoginCredentials;

      // Detectar si se pasó un objeto o parámetros separados
      if (typeof usernameOrCredentials === 'string' && password) {
        credentials = { username: usernameOrCredentials, password };
      } else if (typeof usernameOrCredentials === 'object') {
        credentials = usernameOrCredentials;
      } else {
        throw new Error('Parámetros inválidos para login');
      }

      const user = await login(credentials);
      loginUser(user);
      navigate('/'); // Redirigir al home
      return user;
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;
      const errorMessage = 
        apiError?.error || 
        apiError?.detail || 
        'Credenciales inválidas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar registro de usuario
   */
  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await register(data);
      
      // Si el registro devuelve tokens, hacer login automático
      if (response.access && response.user) {
        loginUser(response.user);
        navigate('/');
      } else {
        // Si no, redirigir al login
        navigate('/login');
      }
      
      return response;
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;
      
      // Extraer el primer error encontrado
      let errorMessage = 'Error al registrar usuario';
      
      if (apiError) {
        if (apiError.username) {
          errorMessage = Array.isArray(apiError.username) 
            ? apiError.username[0] 
            : apiError.username;
        } else if (apiError.email) {
          errorMessage = Array.isArray(apiError.email) 
            ? apiError.email[0] 
            : apiError.email;
        } else if (apiError.password) {
          errorMessage = Array.isArray(apiError.password) 
            ? apiError.password[0] 
            : apiError.password;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        } else if (apiError.detail) {
          errorMessage = apiError.detail;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cierre de sesión
   */
  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logoutUser();
      navigate('/login');
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión');
      // Aun así, redirigir al login
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar errores
   */
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError,
  };
};

export default useAuth;