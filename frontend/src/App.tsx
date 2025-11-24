// src/App.tsx
import React from 'react';
import AppLayout from './components/AppLayout';
import { AuthProvider } from './commons/usuarios/hooks/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
