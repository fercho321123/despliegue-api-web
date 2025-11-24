// src/commons/usuarios/components/ChangePasswordDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { changePassword } from '../services/userService';
import { ChangePasswordData } from '../types/userTypes'; // 👈 Importar tipo

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<Props> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof ChangePasswordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError('');
    setMessage('');
  };

  const validateForm = (): string | null => {
    if (!formData.old_password) {
      return 'La contraseña actual es requerida';
    }
    if (!formData.new_password) {
      return 'La nueva contraseña es requerida';
    }
    if (formData.new_password.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres';
    }
    if (formData.new_password !== formData.new_password_confirm) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSave = async () => {
    setError('');
    setMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData); // 👈 Pasar objeto completo
      setMessage('Contraseña cambiada correctamente.');
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          old_password: '',
          new_password: '',
          new_password_confirm: '',
        });
        onClose();
      }, 2000);
    } catch (err: any) {
      const apiError = err.response?.data;
      setError(
        apiError?.old_password?.[0] ||
        apiError?.new_password?.[0] ||
        apiError?.error ||
        apiError?.detail ||
        'Error al cambiar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🔒 Cambiar Contraseña</DialogTitle>
      
      <DialogContent>
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Contraseña Actual *"
          type="password"
          fullWidth
          margin="normal"
          value={formData.old_password}
          onChange={handleChange('old_password')}
          disabled={loading}
        />
        
        <TextField
          label="Nueva Contraseña *"
          type="password"
          fullWidth
          margin="normal"
          value={formData.new_password}
          onChange={handleChange('new_password')}
          disabled={loading}
          helperText="Mínimo 8 caracteres"
        />
        
        <TextField
          label="Confirmar Nueva Contraseña *"
          type="password"
          fullWidth
          margin="normal"
          value={formData.new_password_confirm}
          onChange={handleChange('new_password_confirm')}
          disabled={loading}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
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

export default ChangePasswordDialog;