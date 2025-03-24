import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  FormHelperText,
  Box
} from '@mui/material';
import { WhatsAppAccount } from './WhatsAppAccountsList';

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<WhatsAppAccount, 'id'>) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ open, onClose, onAddAccount }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    name: ''
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      phoneNumber: '',
      name: ''
    };

    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es requerido';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Ingrese un número de teléfono válido (10-15 dígitos)';
      isValid = false;
    }

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddAccount({
        phoneNumber,
        name,
        status: 'inactive', // Default status for new accounts
        webhookUrl: webhookUrl || undefined,
        lastConnection: undefined
      });
      
      // Reset form
      setPhoneNumber('');
      setName('');
      setWebhookUrl('');
      setErrors({ phoneNumber: '', name: '' });
      
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Nueva Cuenta de WhatsApp</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Ingrese los detalles de la nueva cuenta de WhatsApp para agregarla al sistema.
        </DialogContentText>
        
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl error={!!errors.phoneNumber} fullWidth>
            <TextField
              label="Número de Teléfono"
              variant="outlined"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ej: 5491112345678"
              fullWidth
              error={!!errors.phoneNumber}
            />
            {errors.phoneNumber && <FormHelperText>{errors.phoneNumber}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.name} fullWidth>
            <TextField
              label="Nombre"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cuenta Principal"
              fullWidth
              error={!!errors.name}
            />
            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth>
            <TextField
              label="Webhook URL (Opcional)"
              variant="outlined"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              fullWidth
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Agregar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAccountModal;