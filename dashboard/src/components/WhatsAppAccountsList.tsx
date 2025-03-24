import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Avatar,
  Box,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import AddAccountModal from './AddAccountModal';

// Define the WhatsApp account interface
export interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  name: string;
  status: 'active' | 'inactive';
  lastConnection?: string;
  webhookUrl?: string;
}

interface WhatsAppAccountsListProps {
  accounts: WhatsAppAccount[];
  onAddAccount?: (account: Omit<WhatsAppAccount, 'id'>) => void;
}

const WhatsAppAccountsList: React.FC<WhatsAppAccountsListProps> = ({ accounts, onAddAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleAddAccount = (newAccount: Omit<WhatsAppAccount, 'id'>) => {
    if (onAddAccount) {
      onAddAccount(newAccount);
    }
  };
  return (
    <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 0 }}>
          Cuentas de WhatsApp
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Agregar Cuenta
        </Button>
      </Box>
      
      {accounts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay cuentas de WhatsApp registradas.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ 
          backgroundColor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: 'primary.dark' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Número</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Última Conexión</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Webhook URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: account.status === 'active' ? 'success.main' : 'text.disabled' }}>
                      {account.name.charAt(0).toUpperCase()}
                    </Avatar>
                    {account.phoneNumber}
                  </TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={account.status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={account.status === 'active' ? 'Activo' : 'Inactivo'}
                      color={account.status === 'active' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{account.lastConnection || 'N/A'}</TableCell>
                  <TableCell sx={{ 
                    maxWidth: 200, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {account.webhookUrl || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      

      
      {/* Add Account Modal */}
      <AddAccountModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        onAddAccount={handleAddAccount}
      />
    </Box>
  );
};

export default WhatsAppAccountsList;