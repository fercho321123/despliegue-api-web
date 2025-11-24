// src/commons/usuarios/hooks/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types/userTypes';
import { getCurrentUser, logout } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) setUser(storedUser);
  }, []);

  const loginUser = (user: User) => {
    setUser(user);
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};