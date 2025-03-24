import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Typography } from '@mui/material';
import WhatsAppAccountsList, { WhatsAppAccount } from './components/WhatsAppAccountsList';
import { getWhatsAppAccounts } from './utils/sessionReader';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#25D366', // WhatsApp green
      dark: '#128C7E',
    },
    secondary: {
      main: '#34B7F1', // WhatsApp blue
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
});

// Path to the bot_sessions directory
const BOT_SESSIONS_DIR = '/Users/jhoanjg/bot-whatsapp-notas-de-voz/bot_sessions';

function App() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  
  // Load accounts from session files on component mount
  useEffect(() => {
    const loadAccounts = () => {
      try {
        const whatsappAccounts = getWhatsAppAccounts(BOT_SESSIONS_DIR);
        setAccounts(whatsappAccounts as WhatsAppAccount[]);
      } catch (error) {
        console.error('Error loading WhatsApp accounts:', error);
      }
    };
    
    loadAccounts();
    
    // Refresh accounts every 30 seconds
    const intervalId = setInterval(loadAccounts, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleAddAccount = (newAccount: Omit<WhatsAppAccount, 'id'>) => {
    // Create a new account with a generated ID
    const newAccountWithId: WhatsAppAccount = {
      ...newAccount,
      id: `${accounts.length + 1}`, // Simple ID generation
    };
    
    // Add the new account to the list
    setAccounts([...accounts, newAccountWithId]);
  };
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Normalize CSS and apply theme's baseline */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WhatsApp Bot Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <WhatsAppAccountsList 
            accounts={accounts} 
            onAddAccount={handleAddAccount} 
          />
        </Container>
        <Box component="footer" sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} WhatsApp Bot Dashboard
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
